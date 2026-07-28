import { createFileRoute } from "@tanstack/react-router";
import { TabPlaceholder } from "@/components/tab-placeholder";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Putt Vector" }] }),
  component: () => <TabPlaceholder name="Analytics" />,
});
