import { createFileRoute } from "@tanstack/react-router";
import { TabPlaceholder } from "@/components/tab-placeholder";

export const Route = createFileRoute("/_authenticated/preview")({
  head: () => ({ meta: [{ title: "Preview — Putt Vector" }] }),
  component: () => <TabPlaceholder name="Preview" />,
});
