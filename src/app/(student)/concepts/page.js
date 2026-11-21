import { ConceptExplorer } from "@/components/student/ConceptExplorer";
import { PageHeader } from "@/components/ui/primitives";
import { requireRole } from "@/lib/auth";
import { rankConcepts } from "@/engine/selector";
import { getLearnerSnapshot } from "@/services/learner";
import { getSyllabus } from "@/services/syllabus";

export const metadata = { title: "Concept explorer" };

export default async function ConceptsPage({ searchParams }) {
  const session = await requireRole(["student"]);
  const params = await searchParams;
  const [snapshot, syllabus] = await Promise.all([getLearnerSnapshot(session.id), getSyllabus()]);
  const miscStatus = Object.fromEntries(snapshot.misconceptions.map((m) => [m.code, m.status]));

  const concepts = snapshot.concepts.map((c) => ({
    slug: c.slug, name: c.name, chapterId: c.chapterId, chapterName: c.chapterName, topic: c.topic, difficulty: c.difficulty, status: c.status,
    mastery: c.mastery, attempts: c.attempts, summary: c.summary, keyIdeas: c.keyIdeas, formulas: c.formulas,
    prerequisites: c.prerequisites, dependents: c.dependents,
    lastPracticedAt: c.lastPracticedAt ? new Date(c.lastPracticedAt).toISOString() : null, nextReview: c.schedule ? new Date(c.schedule.dueAt).toISOString() : null,
    misconceptions: syllabus.misconceptions.filter((m) => m.conceptSlug === c.slug).map((m) => ({ code: m.code, name: m.name, status: miscStatus[m.code] ?? null })),
  }));
  const top = rankConcepts(snapshot.concepts)[0]?.concept.slug;
  const initial = concepts.some((c) => c.slug === params.c) ? params.c : top ?? concepts[0].slug;

  return (
    <>
      <PageHeader eyebrow="Concept explorer" title="Physics, mapped" description="Explore the syllabus as a graph. See what each concept depends on, what it unlocks, and where you stand." />
      <ConceptExplorer chapters={syllabus.chapters.map((c) => ({ id: c.id, name: c.name }))} concepts={concepts} initial={initial} />
    </>
  );
}
