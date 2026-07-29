import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { CoachShell, CoachCard, CoachLabel } from "@/components/CoachShell";
import { getStudents } from "@/lib/coachService";

export const Route = createFileRoute("/coach/analytics")({
  head: () => ({
    meta: [
      { title: "Coach Analytics — Putt Vector" },
      { name: "description", content: "Roster-wide putting analytics with drill-down into each student." },
      { property: "og:title", content: "Coach Analytics — Putt Vector" },
      { property: "og:description", content: "Roster-wide putting analytics with drill-down into each student." },
    ],
  }),
  component: CoachAnalytics,
});

function CoachAnalytics() {
  // TODO: mock data — swap for Supabase queries.
  const students = getStudents();

  return (
    <CoachShell>
      <header className="mb-10">
        <CoachLabel>Performance</CoachLabel>
        <h1 className="text-3xl font-bold text-white tracking-tight mt-1">Analytics</h1>
        <p className="text-sm text-white/40 mt-2">Select a student to open their full session breakdown.</p>
      </header>

      <CoachCard>
        <ul className="divide-y divide-white/5">
          {students.map((s) => (
            <li key={s.id}>
              <Link
                to="/coach/students/$studentId"
                params={{ studentId: s.id }}
                className="flex items-center gap-6 py-5 hover:bg-white/5 rounded-lg px-3 transition-colors"
              >
                <span className="w-10 h-10 rounded-full bg-white/10 text-white/70 flex items-center justify-center text-xs font-bold">
                  {s.initials}
                </span>
                <span className="flex-1 text-sm font-bold text-white">{s.name}</span>
                <div className="w-24">
                  <CoachLabel>Make %</CoachLabel>
                  <p className="text-xl font-bold text-white">{s.makePercent}</p>
                </div>
                <div className="w-24">
                  <CoachLabel>Sessions</CoachLabel>
                  <p className="text-xl font-bold text-white">{s.totalSessions}</p>
                </div>
                <div className="w-28">
                  <CoachLabel>Last</CoachLabel>
                  <p className="text-xl font-bold text-white">{s.lastSession}</p>
                </div>
                <ChevronRight size={18} className="text-white/30" />
              </Link>
            </li>
          ))}
        </ul>
      </CoachCard>
    </CoachShell>
  );
}
