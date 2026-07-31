import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { CoachShell, CoachLabel } from "@/components/CoachShell";
import { AnalyticsGrid } from "@/components/AnalyticsGrid";
import { getStudent, getStudentAnalytics } from "@/lib/coachService";

export const Route = createFileRoute("/coach/students/$studentId")({
  head: () => ({
    meta: [
      { title: "Student Analytics — Putt Vector Coach" },
      { name: "description", content: "Detailed putting analytics for an individual student." },
      { property: "og:title", content: "Student Analytics — Putt Vector Coach" },
      { property: "og:description", content: "Detailed putting analytics for an individual student." },
    ],
  }),
  component: StudentDetail,
});

function StudentDetail() {
  const { studentId } = Route.useParams();
  // TODO: mock data — swap for Supabase queries.
  const student = getStudent(studentId);
  const data = getStudentAnalytics(studentId);

  return (
    <CoachShell>
      <nav className="flex items-center gap-2 mb-6 golf-label">
        <Link to="/coach/students" className="flex items-center gap-1 golf-text-secondary hover:text-white">
          <ChevronLeft size={14} /> Students
        </Link>
        <span className="golf-text-secondary">/</span>
        <span className="text-[#22C55E]">{student?.name ?? "Unknown"}</span>
      </nav>

      <header className="flex items-center gap-5 mb-10">
        <span className="w-14 h-14 rounded-full bg-[#102F1D] text-[#22C55E] flex items-center justify-center text-base font-bold">
          {student?.initials ?? "--"}
        </span>
        <div>
          <CoachLabel>Student Analytics</CoachLabel>
          <h1 className="golf-display text-3xl text-white">{student?.name ?? "Unknown student"}</h1>
        </div>
      </header>

      <AnalyticsGrid data={data} />
    </CoachShell>
  );
}
