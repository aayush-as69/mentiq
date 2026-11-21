// Aggregates learner models across a classroom into gaps, misconception clusters and teacher recommendations.
import { DAY_MS, mean } from "./mastery.js";

const STRUGGLE = 0.5;

function recommendation({ strugglingShare, masteredShare, topIssue }) {
  if (strugglingShare >= 0.35) return `Run a 10-minute intervention lesson${topIssue ? ` on “${topIssue.name}”` : ""}.`;
  if (strugglingShare >= 0.2) return "Set up a short small-group review for the students who are struggling.";
  if (masteredShare >= 0.7) return "Already mastered by most of the class — safe to move on.";
  return "Monitor — most students are progressing.";
}

/**
 * students: [{ id, name, overall, lastActiveAt, totalAttempts }]
 * records: [{ userId, conceptId, mastery, attempts }]
 * misconceptionRows: [{ userId, code, status, occurrences }]
 */
export function analyzeClass({ students, concepts, records, misconceptionRows, library, now = new Date() }) {
  const libByCode = Object.fromEntries(library.map((m) => [m.code, m]));
  const studentCount = students.length;
  const liveMisc = misconceptionRows.filter((r) => r.status !== "resolved");

  const conceptStats = concepts.map((concept) => {
    const rows = records.filter((r) => r.conceptId === concept.id && r.attempts > 0);
    const struggling = rows.filter((r) => r.mastery < STRUGGLE).length;
    const mastered = rows.filter((r) => r.mastery >= 0.8).length;
    const issueCounts = {};
    for (const row of liveMisc) {
      const m = libByCode[row.code];
      if (m?.conceptSlug === concept.slug) issueCounts[row.code] = (issueCounts[row.code] ?? 0) + 1;
    }
    const [issueCode] = Object.entries(issueCounts).sort((a, b) => b[1] - a[1])[0] ?? [];
    const topIssue = issueCode ? { code: issueCode, name: libByCode[issueCode].name, students: issueCounts[issueCode] } : null;
    const assessed = rows.length;
    const strugglingShare = studentCount ? struggling / studentCount : 0;
    const masteredShare = studentCount ? mastered / studentCount : 0;
    return {
      slug: concept.slug, name: concept.name, chapterName: concept.chapterName, chapterSlug: concept.chapterSlug, conceptId: concept.id,
      avgMastery: assessed ? mean(rows.map((r) => r.mastery)) : null, assessed, struggling, mastered, strugglingShare, masteredShare, topIssue,
      recommendation: recommendation({ strugglingShare, masteredShare, topIssue }),
    };
  });

  const misconceptionStats = Object.entries(
    liveMisc.reduce((acc, r) => ({ ...acc, [r.code]: (acc[r.code] ?? new Set()).add(r.userId) }), {}),
  )
    .map(([code, set]) => {
      const m = libByCode[code];
      const concept = concepts.find((c) => c.slug === m.conceptSlug);
      return { code, name: m.name, severity: m.severity, students: set.size, conceptSlug: m.conceptSlug, conceptName: concept?.name ?? "", intervention: m.intervention, correctModel: m.correctModel };
    })
    .sort((a, b) => b.students - a.students);

  const activeByStudent = {};
  for (const r of liveMisc) if (r.status === "active") activeByStudent[r.userId] = (activeByStudent[r.userId] ?? 0) + 1;
  const attention = students
    .map((s) => {
      const reasons = [];
      if (s.overall < STRUGGLE) reasons.push(`Overall mastery ${Math.round(s.overall * 100)}%`);
      const idle = s.lastActiveAt ? (new Date(now) - new Date(s.lastActiveAt)) / DAY_MS : null;
      if (idle !== null && idle > 7) reasons.push(`Inactive for ${Math.round(idle)} days`);
      if ((activeByStudent[s.id] ?? 0) >= 3) reasons.push(`${activeByStudent[s.id]} active misconceptions`);
      return { ...s, reasons };
    })
    .filter((s) => s.reasons.length)
    .sort((a, b) => b.reasons.length - a.reasons.length || a.overall - b.overall);

  const assessedStats = conceptStats.filter((c) => c.avgMastery !== null);
  const insights = [
    ...assessedStats.filter((c) => c.strugglingShare >= 0.2).sort((a, b) => b.struggling - a.struggling).slice(0, 4).map((c) => ({
      kind: "intervention", conceptSlug: c.slug, severity: c.strugglingShare >= 0.35 ? "high" : "medium", studentCount: c.struggling,
      title: `${c.name}: ${c.struggling} of ${studentCount} students struggling`,
      body: `${c.topIssue ? `Most common issue: ${c.topIssue.name}. ` : ""}Recommendation: ${c.recommendation}`,
    })),
    ...misconceptionStats.slice(0, 3).map((m) => ({
      kind: "misconception", conceptSlug: m.conceptSlug, severity: m.students >= studentCount * 0.25 ? "high" : "medium", studentCount: m.students,
      title: `“${m.name}” is affecting ${m.students} students`,
      body: `Affected concept: ${m.conceptName}. Suggested approach: ${m.intervention[0]?.toLowerCase() ?? "short targeted re-teach"}.`,
    })),
    ...assessedStats.filter((c) => c.masteredShare >= 0.7).slice(0, 2).map((c) => ({
      kind: "strength", conceptSlug: c.slug, severity: "low", studentCount: c.mastered,
      title: `${c.name} is mastered by ${c.mastered} students`, body: "Most of the class is secure here — little revision time needed.",
    })),
  ];

  return {
    studentCount,
    classAverage: mean(students.map((s) => s.overall)),
    conceptStats,
    hardest: [...assessedStats].sort((a, b) => a.avgMastery - b.avgMastery).slice(0, 5),
    masteredByMost: assessedStats.filter((c) => c.masteredShare >= 0.7),
    misconceptionStats, attention, insights,
  };
}
