import { createFileRoute, redirect } from "@tanstack/react-router";

// Landing always continues into the app — no separate Enter App gate.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
  component: () => null,
});
