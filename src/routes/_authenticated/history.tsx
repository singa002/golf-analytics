import { createFileRoute } from "@tanstack/react-router";
import { TabPlaceholder } from "@/components/tab-placeholder";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "History — Putt Vector" }] }),
  component: () => <TabPlaceholder name="History" />,
});
