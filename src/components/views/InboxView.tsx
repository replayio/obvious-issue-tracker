import { ViewHeader } from "./ViewHeader";
import { EmptyState } from "./EmptyState";

export function InboxView() {
  return (
    <section className="flex h-full flex-col">
      <ViewHeader title="Inbox" />
      <EmptyState
        title="Your inbox is empty"
        description="Notifications about issues you follow will show up here."
      />
    </section>
  );
}

