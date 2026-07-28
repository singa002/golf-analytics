import { createFileRoute } from "@tanstack/react-router";
import { TabPlaceholder } from "@/components/tab-placeholder";

export const Route = createFileRoute("/_authenticated/practice")({
  head: () => ({ meta: [{ title: "Practice — Putt Vector" }] }),
  component: () => <TabPlaceholder name="Practice" />,
});
