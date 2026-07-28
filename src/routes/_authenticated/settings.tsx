import { createFileRoute } from "@tanstack/react-router";
import { TabPlaceholder } from "@/components/tab-placeholder";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Putt Vector" }] }),
  component: () => <TabPlaceholder name="Settings" />,
});
