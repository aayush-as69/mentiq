import { getSession } from "@/lib/auth";
import { AdaptiveSection, CtaSection, Footer, HowItWorks, Hero, LandingNav, LearnerModelSection, MisconceptionSection, ProgressSection, TeacherSection } from "@/components/marketing/Sections";

export default async function LandingPage() {
  const session = await getSession();
  const startHref = session?.role === "student" ? "/diagnostic" : "/signup";
  return (
    <>
      <LandingNav session={session} startHref={startHref} />
      <main id="main">
        <Hero startHref={startHref} />
        <HowItWorks />
        <LearnerModelSection />
        <MisconceptionSection />
        <AdaptiveSection />
        <TeacherSection />
        <ProgressSection />
        <CtaSection startHref={startHref} />
      </main>
      <Footer />
    </>
  );
}
