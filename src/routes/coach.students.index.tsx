import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { CoachShell, CoachCard, CoachLabel } from "@/components/CoachShell";
import { getStudents } from "@/lib/coachService";

export const Route = createFileRoute("/coach/students/")({
  head: () => ({
    meta: [
      { title: "Students — Putt Vector Coach" },
      { name: "description", content: "Your student roster with make %, sessions, and last activity." },
      { property: "og:title", content: "Students — Putt Vector Coach" },
      { property: "og:description", content: "Your student roster with make %, sessions, and last activity." },
    ],
  }),
  component: StudentsPage,
});

function StudentsPage() {
  // TODO: mock data — swap for Supabase queries.
  const students = getStudents();

  return (
    <CoachShell>
      <header className="mb-10">
        <CoachLabel>Roster</CoachLabel>
        <h1 className="text-3xl font-bold text-white tracking-tight mt-1">Students</h1>
      </header>

      <div className="grid grid-cols-2 gap-6">
        {students.map((s) => (
          <Link key={s.id} to="/coach/students/$studentId" params={{ studentId: s.id }}>
            <CoachCard className="hover:bg-[#203320] transition-colors">
              <div className="flex items-center gap-5">
                <span className="w-14 h-14 rounded-full bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center text-base font-bold">
                  {s.initials}
                </span>
                <div className="flex-1">
                  <p className="text-lg font-bold text-white">{s.name}</p>
                  <p className="text-xs text-white/40 mt-1">
                    Hcp {s.handicap} · Last session {s.lastSession}
                  </p>
                </div>
                <div className="text-right mr-2">
                  <CoachLabel>Make %</CoachLabel>
                  <p
                    className={`text-3xl font-bold ${s.trend === "down" ? "text-[#EF4444]" : "text-white"}`}
                  >
                    {s.makePercent}
                  </p>
                </div>
                <ChevronRight size={20} className="text-white/30" />
              </div>
            </CoachCard>
          </Link>
        ))}
      </div>
    </CoachShell>
  );
}
