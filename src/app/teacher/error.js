"use client";

import { ErrorState } from "@/components/ui/primitives";

export default function TeacherError({ reset }) {
  return <ErrorState title="We couldn't load the class data" body="Try again. If it keeps failing, refresh the page or sign in again." onRetry={reset} />;
}
