import { ButtonLink, EmptyState } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24">
      <EmptyState title="We couldn't find that page" body="The link may be old, or you may not have access to it." action={<ButtonLink href="/">Back to Mentiq</ButtonLink>} />
    </div>
  );
}
