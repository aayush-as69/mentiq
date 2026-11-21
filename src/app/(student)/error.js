"use client";

import { ErrorState } from "@/components/ui/primitives";

export default function StudentError({ reset }) {
  return <ErrorState title="We couldn't load this page" body="Your learner model is safe. Try again, or refresh the page. If it keeps failing, sign out and back in." onRetry={reset} />;
}
