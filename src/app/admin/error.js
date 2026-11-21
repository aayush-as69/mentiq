"use client";

import { ErrorState } from "@/components/ui/primitives";

export default function AdminError({ reset }) {
  return <ErrorState title="We couldn't load this admin page" body="Try again, or refresh the page." onRetry={reset} />;
}
