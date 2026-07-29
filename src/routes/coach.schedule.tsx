import { createFileRoute } from "@tanstack/react-router";
import { CoachShell, CoachCard, CoachLabel } from "@/components/CoachShell";
import { getUpcomingLessons } from "@/lib/coachService";

export const Route = createFileRoute("/coach/schedule")({
  head: () => ({
    meta: [
      { title: "Schedule — Putt Vector Coach" },
      { name: "description", content: "Upcoming putting lessons with your students." },
      { property: "og:title", content: "Schedule — Putt Vector Coach" },
      { property: "og:description", content: "Upcoming putting lessons with your students." },
    ],
  }),
  component: SchedulePage,
});

function SchedulePage() {
  // TODO: mock data — swap for a real bookings/calendar source.
  const lessons = getUpcomingLessons();

  return (
    <CoachShell>
      <header className="mb-10">
        <CoachLabel>Upcoming</CoachLabel>
        <h1 className="text-3xl font-bold text-white tracking-tight mt-1">Schedule</h1>
      </header>

      <div className="flex flex-col gap-4 max-w-3xl">
        {lessons.map((l) => (
          <CoachCard key={l.id} className="p-6 flex items-center gap-6">
            <div className="w-28">
              <CoachLabel>{l.date}</CoachLabel>
              <p className="text-2xl font-bold text-[#22C55E] mt-1">{l.time}</p>
            </div>
            <div className="flex-1 border-l border-white/10 pl-6">
              <p className="text-lg font-bold text-white">{l.studentName}</p>
              <p className="text-xs text-white/40 mt-1">{l.focus}</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] text-[10px] font-bold uppercase tracking-widest">
              Confirmed
            </span>
          </CoachCard>
        ))}
      </div>
    </CoachShell>
  );
}
