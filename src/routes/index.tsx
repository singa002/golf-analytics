import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Target } from "lucide-react";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Putt Vector — Smarter Putting. Better Scores." },
      {
        name: "description",
        content:
          "Putt Vector by Golf Analytics — professional putting analytics for serious golfers.",
      },
      { property: "og:title", content: "Putt Vector — Smarter Putting. Better Scores." },
      {
        property: "og:description",
        content: "Professional putting analytics for serious golfers.",
      },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8 py-12 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top, oklch(0.72 0.19 145 / 0.15), transparent 60%)",
        }}
      />
      <div className="relative z-10 flex flex-col items-center max-w-lg w-full text-center">
        <div className="mb-8 h-20 w-20 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
          <Target className="h-10 w-10 text-primary" strokeWidth={2.5} />
        </div>
        <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
          by Golf Analytics
        </div>
        <h1 className="text-6xl font-bold tracking-tight text-foreground">Putt Vector</h1>
        <p className="mt-4 text-lg text-muted-foreground">Smarter Putting. Better Scores.</p>

        <div className="mt-12 flex flex-col gap-3 w-full max-w-sm">
          <button
            type="button"
            onClick={() => navigate({ to: "/dashboard", replace: true })}
            className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base flex items-center justify-center hover:opacity-90 transition"
          >
            Enter App
          </button>

        </div>

        <div className="mt-16 flex items-center gap-6 text-xs text-muted-foreground uppercase tracking-widest">
          <span>Distance</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground" />
          <span>Speed</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground" />
          <span>Break</span>
        </div>
      </div>
    </div>
  );
}
