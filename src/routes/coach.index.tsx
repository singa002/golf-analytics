import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { CoachShell, CoachCard, CoachLabel } from "@/components/CoachShell";
import { COACH, getCoachStats, getStudents, getUpcomingLessons } from "@/lib/coachService";

export const Route = createFileRoute("/coach/")({
  head: () => ({
    meta: [
      { title: "Coach Dashboard — Putt Vector" },
      { name: "description", content: "Coach home: upcoming lessons, active students, and roster stats." },
      { property: "og:title", content: "Coach Dashboard — Putt Vector" },
      { property: "og:description", content: "Coach home: upcoming lessons, active students, and roster stats." },
    ],
  }),
  component: CoachDashboard,
});

function CoachDashboard() {
  // TODO: mock data — swap for Supabase queries.
  const stats = getCoachStats();
  const lessons = getUpcomingLessons().slice(0, 4);
  const students = getStudents().slice(0, 5);

  return (
    <CoachShell>
      <header className="flex justify-between items-end mb-12">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-1">
            Good Morning, {COACH.name}
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tight">{COACH.academy}</h1>
        </div>
        <Link
          to="/coach/schedule"
          className="flex items-center gap-3 bg-[#22C55E] hover:bg-[#16a34a] text-black px-6 py-3 rounded-xl font-bold transition-all"
        >
          <Clock size={20} />
          <span>VIEW SCHEDULE</span>
        </Link>
      </header>

      <div className="grid grid-cols-4 gap-6 mb-8">
        {[
          { label: "Active Students", value: stats.activeStudents },
          { label: "Lessons This Week", value: stats.lessonsThisWeek },
          { label: "Roster Avg Make %", value: `${stats.avgMakePercent}%` },
          { label: "Sessions Logged", value: stats.sessionsLogged },
        ].map((s) => (
          <CoachCard key={s.label} className="p-6">
            <CoachLabel>{s.label}</CoachLabel>
            <p className="text-4xl font-bold text-white mt-2">{s.value}</p>
          </CoachCard>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-7">
          <CoachCard>
            <CoachLabel>Upcoming Lessons</CoachLabel>
            <ul className="mt-6 divide-y divide-white/5">
              {lessons.map((l) => (
                <li key={l.id} className="flex items-center justify-between py-4">
                  <div>
                    <p className="text-sm font-bold text-white">{l.studentName}</p>
                    <p className="text-xs text-white/40 mt-1">{l.focus}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#22C55E]">{l.time}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mt-1">{l.date}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CoachCard>
        </div>

        <div className="col-span-5">
          <CoachCard>
            <div className="flex items-center justify-between">
              <CoachLabel>Current Students</CoachLabel>
              <Link to="/coach/students" className="text-[10px] uppercase tracking-widest font-bold text-[#22C55E]">
                View all
              </Link>
            </div>
            <ul className="mt-6 space-y-3">
              {students.map((s) => (
                <li key={s.id}>
                  <Link
                    to="/coach/students/$studentId"
                    params={{ studentId: s.id }}
                    className="flex items-center gap-4 rounded-lg px-3 py-3 hover:bg-white/5 transition-colors"
                  >
                    <span className="w-9 h-9 rounded-full bg-white/10 text-white/70 flex items-center justify-center text-xs font-bold">
                      {s.initials}
                    </span>
                    <span className="flex-1 text-sm font-medium text-white/80">{s.name}</span>
                    <span className="text-sm font-bold text-[#22C55E]">{s.makePercent}%</span>
                  </Link>
                </li>
              ))}
            </ul>
          </CoachCard>
        </div>
      </div>
    </CoachShell>
  );
}
