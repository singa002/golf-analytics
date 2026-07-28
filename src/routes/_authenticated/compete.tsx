import { createFileRoute } from "@tanstack/react-router";
import { TabPlaceholder } from "@/components/tab-placeholder";

export const Route = createFileRoute("/_authenticated/compete")({
  head: () => ({ meta: [{ title: "Compete — Putt Vector" }] }),
  component: () => <TabPlaceholder name="Compete" />,
});
