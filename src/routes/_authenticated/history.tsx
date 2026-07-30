import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy History URL — merged into Analytics. Keep redirect so old links don't break. */
export const Route = createFileRoute("/_authenticated/history")({
  beforeLoad: () => {
    throw redirect({ to: "/analytics" });
  },
});
