import { count, sql } from "drizzle-orm";
import { db } from "../index.js";
import * as t from "../schema.js";
import { hashPassword } from "../../lib/password.js";
import { subject, chapters, concepts, misconceptions, questions, exam, estimateSeconds } from "../../content/class10-physics/index.js";
import { clamp, emptyRecord, statusFor } from "../../engine/mastery.js";
import { summarizeModel } from "../../engine/learnerModel.js";
import { buildStudentHistory, mulberry32 } from "./students.js";

export const DEMO_PASSWORD = "mentiq-demo";

const FIRST = ["Aarav", "Diya", "Kabir", "Ananya", "Rohan", "Ishita", "Vihaan", "Meera", "Arjun", "Saanvi", "Aditya", "Riya", "Kartik", "Nisha", "Reyansh", "Tara", "Dev", "Pooja", "Yash", "Kavya", "Neel"];
const LAST = ["Mehta", "Iyer", "Singh", "Nair", "Gupta", "Reddy", "Kapoor", "Das"];

// Average class mastery per concept — Lens Formula & Power of Lens are the class-wide pain points.
const CLASS_MEAN = {
  "laws-of-reflection": 0.86, "spherical-mirrors": 0.74, "mirror-formula": 0.58, magnification: 0.62, "laws-of-refraction": 0.64, "refractive-index": 0.6,
  lenses: 0.55, "ray-diagrams": 0.52, "lens-formula": 0.47, "power-of-lens": 0.45, "eye-structure": 0.8, accommodation: 0.66, "vision-defects": 0.6,
  "dispersion-scattering": 0.64, "electric-current": 0.8, "ohms-law": 0.78, resistance: 0.7, "series-parallel": 0.6, "electric-power": 0.55,
  "heating-effect": 0.66, "magnetic-field": 0.78, "field-current-wire": 0.6, "force-on-conductor": 0.5, "electric-motor": 0.5, "em-induction": 0.52,
  "ac-dc-generator": 0.55, "domestic-circuits": 0.7,
};

// How many classmates currently hold each misconception.
const CLASS_MISCONCEPTIONS = {
  "M-VIRT-INV": 14, "M-UNITS-CM": 11, "M-SIGN-CONV": 12, "M-POWER-FOCAL": 11, "M-OBJ-IMG": 9, "M-RES-THICK": 8, "M-PARALLEL-ADD": 7, "M-CURRENT-USED": 7,
  "M-MYOPIA-CONVEX": 6, "M-POWER-R": 6, "M-OHM-DEPENDS": 5, "M-INDUCTION-STATIC": 8, "M-FIELD-CROSS": 4, "M-FLEMING": 4, "M-REFL-ANGLE": 3, "M-BEND-DENSE": 4, "M-FUSE-MELT": 3,
};

const DEMO_TARGETS = {
  "laws-of-reflection": 0.88, "spherical-mirrors": 0.72, "mirror-formula": 0.6, magnification: 0.62, "laws-of-refraction": 0.56, "refractive-index": 0.51,
  lenses: 0.55, "ray-diagrams": 0.5, "lens-formula": 0.42, "power-of-lens": 0.45, "eye-structure": 0.86, accommodation: 0.7, "vision-defects": 0.55,
  "dispersion-scattering": 0.64, "electric-current": 0.84, "ohms-law": 0.91, resistance: 0.67, "series-parallel": 0.6, "electric-power": 0.58,
  "heating-effect": 0.72, "magnetic-field": 0.82, "field-current-wire": 0.68, "force-on-conductor": 0.48, "em-induction": 0.52,
};

const chunked = async (tx, table, rows, size = 400) => {
  for (let i = 0; i < rows.length; i += size) await tx.insert(table).values(rows.slice(i, i + size));
};

async function seedSyllabus(tx) {
  const [subjectRow] = await tx.insert(t.subjects).values(subject).returning();
  const chapterRows = await tx.insert(t.chapters).values(chapters.map((c, i) => ({ ...c, subjectId: subjectRow.id, position: i }))).returning();
  const chapterBySlug = Object.fromEntries(chapterRows.map((c) => [c.slug, c]));
  const conceptRows = await tx.insert(t.concepts).values(concepts.map((c, i) => ({
    chapterId: chapterBySlug[c.chapter].id, slug: c.slug, name: c.name, topic: c.topic, difficulty: c.d, position: i, summary: c.summary,
    keyIdeas: c.ideas, formulas: c.formulas, intuition: c.intuition, subconcepts: c.subs, keywords: c.kw,
  }))).returning();
  const conceptBySlug = Object.fromEntries(conceptRows.map((c) => [c.slug, c]));

  await tx.insert(t.conceptDependencies).values(concepts.flatMap((c) => [
    ...c.prereq.map((p) => ({ conceptId: conceptBySlug[c.slug].id, relatedConceptId: conceptBySlug[p].id, kind: "prerequisite" })),
    ...c.related.map((r) => ({ conceptId: conceptBySlug[c.slug].id, relatedConceptId: conceptBySlug[r].id, kind: "related" })),
  ]));

  const staticBySlug = Object.fromEntries(concepts.map((c) => [c.slug, c]));
  const questionRows = await tx.insert(t.questions).values(questions.map((q) => ({
    code: q.code, conceptId: conceptBySlug[q.concept].id, subconcept: q.sub ?? null, difficulty: q.d, type: q.type, prompt: q.prompt, options: q.options ?? null,
    correctAnswer: q.answer, tolerance: q.tol ?? null, unit: q.unit ?? null, keywords: q.keywords ?? null, explanation: q.explanation, hints: q.hints ?? [],
    prerequisiteSlugs: staticBySlug[q.concept].prereq, misconceptionCodes: q.mis ?? [], distractorMap: q.dm ?? {}, wrongPatterns: q.wp ?? [],
    learningObjective: q.obj, estimatedSeconds: q.secs ?? estimateSeconds(q.type, q.d), requiresReasoning: Boolean(q.reason), isDiagnostic: Boolean(q.diag),
  }))).returning();

  const misconceptionRows = await tx.insert(t.misconceptions).values(misconceptions.map((m) => ({
    code: m.code, conceptId: conceptBySlug[m.concept].id, name: m.name, description: m.description, triggerPatterns: m.triggers, severity: m.severity,
    baseConfidence: m.base, correctModel: m.correct, intervention: m.steps, relatedQuestionCodes: m.related,
  }))).returning();

  await tx.insert(t.exams).values({ title: exam.title, subjectId: subjectRow.id, durationMinutes: exam.durationMinutes, questionCount: exam.questionCount, distribution: exam.distribution });
  return { subjectRow, conceptRows, conceptBySlug, questionRows, misconceptionRows };
}

async function insertStudentHistory(tx, userId, history, misconceptionEntries, conceptRows, syllabusRows) {
  await chunked(tx, t.questionAttempts, history.attempts);
  await chunked(tx, t.masteryRecords, history.records);
  await chunked(tx, t.masterySnapshots, history.snapshots);
  await chunked(tx, t.reviewSchedules, history.schedules);
  if (misconceptionEntries.length) await tx.insert(t.studentMisconceptions).values(misconceptionEntries);

  const recordBy = Object.fromEntries(history.records.map((r) => [r.conceptId, r]));
  const scheduleBy = Object.fromEntries(history.schedules.map((s) => [s.conceptId, s]));
  const slugById = Object.fromEntries(conceptRows.map((c) => [c.id, c.slug]));
  const liveMis = misconceptionEntries.filter((m) => m.status !== "resolved");
  const modelConcepts = concepts.map((c) => {
    const row = conceptRows.find((r) => r.slug === c.slug);
    const record = recordBy[row.id] ?? emptyRecord();
    return {
      slug: c.slug, prerequisites: c.prereq, ...record, status: statusFor(record.mastery, record.attempts), schedule: scheduleBy[row.id] ?? null,
      activeMisconceptions: liveMis.filter((m) => syllabusRows.misconceptionRows.find((x) => x.id === m.misconceptionId)?.conceptId === row.id)
        .map((m) => ({ code: String(m.misconceptionId), status: m.status, severity: syllabusRows.misconceptionRows.find((x) => x.id === m.misconceptionId).severity })),
    };
  });
  const newestFirst = [...history.attempts].sort((a, b) => b.createdAt - a.createdAt).map((a) => ({ ...a, conceptSlug: slugById[a.conceptId] }));
  const summary = summarizeModel({ concepts: modelConcepts, attempts: newestFirst });
  await tx.insert(t.learnerModels).values({ userId, ...summary, updatedAt: history.lastActiveAt });
}

async function seedDemo(tx, syllabusRows) {
  const now = new Date();
  const rng = mulberry32(20240601);
  const passwordHash = hashPassword(DEMO_PASSWORD);
  const { conceptRows, questionRows, misconceptionRows, subjectRow } = syllabusRows;
  const miscByCode = Object.fromEntries(misconceptionRows.map((m) => [m.code, m]));
  const miscConceptSlug = Object.fromEntries(misconceptions.map((m) => [m.code, m.concept]));
  const conceptSlugById = Object.fromEntries(conceptRows.map((c) => [c.id, c.slug]));
  const questionsBySlug = {};
  for (const q of questionRows) (questionsBySlug[conceptSlugById[q.conceptId]] ??= []).push(q);

  const [teacher, admin] = await tx.insert(t.users).values([
    { email: "teacher@mentiq.demo", name: "Ms. Priya Sharma", passwordHash, role: "teacher" },
    { email: "admin@mentiq.demo", name: "Admin Rao", passwordHash, role: "admin" },
  ]).returning();
  await tx.insert(t.teacherProfiles).values({ userId: teacher.id, department: "Science" });
  const [classroom] = await tx.insert(t.classrooms).values({ name: "Class 10-A", grade: 10, joinCode: "10A-PHY", teacherId: teacher.id }).returning();

  const studentUsers = await tx.insert(t.users).values(Array.from({ length: 42 }, (_, i) => ({
    email: i === 0 ? "student@mentiq.demo" : `student${i}@mentiq.demo`,
    name: i === 0 ? "Aarav Mehta" : `${FIRST[i % 21]} ${LAST[(i * 3 + Math.floor(i / 21) + 1) % 8]}`,
    passwordHash, role: "student", createdAt: new Date(now.getTime() - (30 + Math.floor(rng() * 30)) * 86400000),
  }))).returning();

  await tx.insert(t.studentProfiles).values(studentUsers.map((u, i) => ({
    userId: u.id, classroomId: classroom.id, subjectId: subjectRow.id, grade: 10, exam: "CBSE Class 10 Board Exam", confidence: i === 0 ? 3 : 1 + Math.floor(rng() * 5),
    goals: i === 0 ? ["Score 80%+ in boards", "Fix weak numericals"] : ["Improve my score"], pace: ["relaxed", "steady", "intensive"][Math.floor(rng() * 3)],
    dailyMinutes: i === 0 ? 45 : 30 + Math.floor(rng() * 4) * 15, targetScore: i === 0 ? 80 : 70 + Math.floor(rng() * 4) * 5,
    onboardedAt: new Date(now.getTime() - 35 * 86400000), diagnosticCompletedAt: new Date(now.getTime() - 28 * 86400000),
  })));

  // Demo student: mixed mastery, several misconceptions, history, upcoming reviews, 9-day streak.
  const demoLive = new Set(["lens-formula", "power-of-lens", "lenses"]);
  const demoHistory = buildStudentHistory({ rng, userId: studentUsers[0].id, targets: DEMO_TARGETS, conceptRows, questionsBySlug, liveMisconceptionConcepts: demoLive, attemptsRange: [5, 9], daysSpan: 28, streakDays: 9, now });
  const demoMis = [
    ["M-POWER-FOCAL", 3, 0, "active"], ["M-UNITS-CM", 2, 0, "active"], ["M-OBJ-IMG", 4, 2, "improving"], ["M-SIGN-CONV", 3, 3, "resolved"], ["M-PARALLEL-ADD", 2, 0, "active"],
  ].map(([code, occurrences, correctAfter, status]) => ({
    userId: studentUsers[0].id, misconceptionId: miscByCode[code].id, occurrences, correctAfter, status, lastConfidence: 0.85,
    firstDetectedAt: new Date(now.getTime() - 20 * 86400000), lastDetectedAt: new Date(now.getTime() - (status === "active" ? 2 : 6) * 86400000), resolvedAt: status === "resolved" ? new Date(now.getTime() - 5 * 86400000) : null,
  }));
  await insertStudentHistory(tx, studentUsers[0].id, demoHistory, demoMis, conceptRows, syllabusRows);

  // Classmates: assign misconceptions with exact class-level counts, then derive mastery from them.
  const classmates = studentUsers.slice(1);
  const assignments = classmates.map(() => []);
  for (const [code, target] of Object.entries(CLASS_MISCONCEPTIONS)) {
    const order = classmates.map((_, i) => [rng(), i]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);
    order.slice(0, target).forEach((idx, k) => assignments[idx].push({ code, status: k % 4 === 3 ? "improving" : "active" }));
    order.slice(target, target + 2).forEach((idx) => assignments[idx].push({ code, status: "resolved" }));
  }
  for (let i = 0; i < classmates.length; i += 1) {
    const ability = (rng() - 0.5) * 0.4;
    const liveSlugs = new Set(assignments[i].filter((a) => a.status !== "resolved").map((a) => miscConceptSlug[a.code]));
    const targets = {};
    for (const c of concepts) {
      if (rng() < 0.07) continue;
      targets[c.slug] = clamp(CLASS_MEAN[c.slug] + ability + (rng() - 0.5) * 0.22 - (liveSlugs.has(c.slug) ? 0.1 : 0), 0.08, 0.97);
    }
    const history = buildStudentHistory({
      rng, userId: classmates[i].id, targets, conceptRows, questionsBySlug, liveMisconceptionConcepts: liveSlugs, attemptsRange: [2, 4], daysSpan: 24,
      idleDays: i % 7 === 3 ? 9 + Math.floor(rng() * 10) : 0, now,
    });
    const entries = assignments[i].map(({ code, status }) => ({
      userId: classmates[i].id, misconceptionId: miscByCode[code].id, occurrences: 1 + Math.floor(rng() * 4), correctAfter: status === "resolved" ? 3 : status === "improving" ? 2 : 0,
      status, lastConfidence: 0.7 + rng() * 0.25, firstDetectedAt: new Date(now.getTime() - 14 * 86400000), lastDetectedAt: new Date(now.getTime() - Math.floor(rng() * 10) * 86400000),
      resolvedAt: status === "resolved" ? new Date(now.getTime() - 3 * 86400000) : null,
    }));
    await insertStudentHistory(tx, classmates[i].id, history, entries, conceptRows, syllabusRows);
  }
}

let running = null;

/** Idempotent: seeds the syllabus and the demo classroom the first time the app is used. */
export function ensureSeeded() {
  if (!running) {
    running = db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(7731)`);
      const [{ n }] = await tx.select({ n: count() }).from(t.subjects);
      if (n > 0) return false;
      const rows = await seedSyllabus(tx);
      await seedDemo(tx, rows);
      return true;
    }).catch((error) => {
      running = null;
      throw error;
    });
  }
  return running;
}
