import { db } from "@/db";
import * as t from "@/db/schema";

const TTL_MS = 60_000;
let cache = null;
let cachedAt = 0;

/** Call after admin edits so the next read reloads the syllabus. */
export function invalidateSyllabus() {
  cache = null;
}

async function load() {
  const [[subject], chapters, concepts, deps, questions, misconceptions] = await Promise.all([
    db.select().from(t.subjects).limit(1),
    db.select().from(t.chapters),
    db.select().from(t.concepts),
    db.select().from(t.conceptDependencies),
    db.select().from(t.questions),
    db.select().from(t.misconceptions),
  ]);

  const chapterById = Object.fromEntries(chapters.map((c) => [c.id, c]));
  const idToSlug = Object.fromEntries(concepts.map((c) => [c.id, c.slug]));

  const enriched = concepts
    .map((c) => ({
      ...c,
      chapterSlug: chapterById[c.chapterId]?.slug,
      chapterName: chapterById[c.chapterId]?.name,
      chapterPosition: chapterById[c.chapterId]?.position ?? 0,
      prerequisites: deps.filter((d) => d.conceptId === c.id && d.kind === "prerequisite").map((d) => idToSlug[d.relatedConceptId]),
      dependents: deps.filter((d) => d.relatedConceptId === c.id && d.kind === "prerequisite").map((d) => idToSlug[d.conceptId]),
      related: deps.filter((d) => d.conceptId === c.id && d.kind === "related").map((d) => idToSlug[d.relatedConceptId]),
    }))
    .sort((a, b) => a.chapterPosition - b.chapterPosition || a.position - b.position);

  const conceptBySlug = Object.fromEntries(enriched.map((c) => [c.slug, c]));
  const conceptById = Object.fromEntries(enriched.map((c) => [c.id, c]));
  const libs = misconceptions.map((m) => ({ ...m, conceptSlug: idToSlug[m.conceptId], conceptName: conceptById[m.conceptId]?.name }));
  const qs = questions.map((q) => ({ ...q, conceptSlug: idToSlug[q.conceptId], conceptName: conceptById[q.conceptId]?.name }));
  for (const c of enriched) c.misconceptionCodes = libs.filter((m) => m.conceptId === c.id).map((m) => m.code);

  return {
    subject,
    chapters: chapters.sort((a, b) => a.position - b.position).map((ch) => ({ ...ch, concepts: enriched.filter((c) => c.chapterId === ch.id) })),
    concepts: enriched, conceptBySlug, conceptById,
    questions: qs, questionById: Object.fromEntries(qs.map((q) => [q.id, q])),
    misconceptions: libs,
    misconceptionByCode: Object.fromEntries(libs.map((m) => [m.code, m])),
    misconceptionById: Object.fromEntries(libs.map((m) => [m.id, m])),
  };
}

/** Cached syllabus (static content changes rarely, so we avoid re-querying on every request). */
export async function getSyllabus() {
  if (cache && Date.now() - cachedAt < TTL_MS) return cache;
  cache = await load();
  cachedAt = Date.now();
  return cache;
}

/** Strips answers/explanations — safe to send to the browser before an answer is submitted. */
export function toClientQuestion(q) {
  return {
    id: q.id, code: q.code, conceptSlug: q.conceptSlug, conceptName: q.conceptName, subconcept: q.subconcept,
    difficulty: q.difficulty, type: q.type, prompt: q.prompt, options: q.options ?? null, unit: q.unit,
    requiresReasoning: q.requiresReasoning, estimatedSeconds: q.estimatedSeconds, objective: q.learningObjective,
    answerKind: q.options?.length ? "choice" : q.keywords?.length ? "text" : "number",
  };
}
