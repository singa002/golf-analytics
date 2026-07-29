// TODO: Replace all mock data below with real Supabase queries once the coach /
// student schema exists. Keep the exported shapes stable so screens don't change.

import { getSessionAnalytics, type SessionAnalytics } from "./analyticsService";

export type Student = {
  id: string;
  name: string;
  initials: string;
  makePercent: number;
  lastSession: string;
  totalSessions: number;
  handicap: number;
  trend: "up" | "down" | "flat";
};

export type Lesson = {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  time: string;
  focus: string;
};

export type CoachProfile = {
  name: string;
  academy: string;
  initials: string;
};

// TODO: mock — replace with the signed-in coach's profile.
export const COACH: CoachProfile = {
  name: "Coach Williams",
  academy: "Golf Analytics Performance Academy",
  initials: "CW",
};

// TODO: mock — replace with `select * from students where coach_id = ...`
export const STUDENTS: Student[] = [
  { id: "s1", name: "Dheeraj Singh", initials: "DS", makePercent: 64, lastSession: "Jul 27", totalSessions: 24, handicap: 8.2, trend: "up" },
  { id: "s2", name: "Marcus Lee", initials: "ML", makePercent: 58, lastSession: "Jul 26", totalSessions: 17, handicap: 12.4, trend: "up" },
  { id: "s3", name: "Ana Torres", initials: "AT", makePercent: 71, lastSession: "Jul 26", totalSessions: 31, handicap: 4.1, trend: "flat" },
  { id: "s4", name: "Ben Carter", initials: "BC", makePercent: 49, lastSession: "Jul 24", totalSessions: 9, handicap: 18.0, trend: "down" },
  { id: "s5", name: "Priya Nair", initials: "PN", makePercent: 66, lastSession: "Jul 23", totalSessions: 20, handicap: 6.7, trend: "up" },
  { id: "s6", name: "Tom Fischer", initials: "TF", makePercent: 53, lastSession: "Jul 21", totalSessions: 12, handicap: 14.9, trend: "down" },
];

// TODO: mock — replace with a lessons/bookings table.
export const UPCOMING_LESSONS: Lesson[] = [
  { id: "l1", studentId: "s1", studentName: "Dheeraj Singh", date: "Today", time: "9:00 AM", focus: "Start line control" },
  { id: "l2", studentId: "s3", studentName: "Ana Torres", date: "Today", time: "11:30 AM", focus: "Speed on long putts" },
  { id: "l3", studentId: "s2", studentName: "Marcus Lee", date: "Tomorrow", time: "8:15 AM", focus: "Green reading" },
  { id: "l4", studentId: "s5", studentName: "Priya Nair", date: "Wed Jul 31", time: "2:00 PM", focus: "Breaking putts" },
  { id: "l5", studentId: "s4", studentName: "Ben Carter", date: "Thu Aug 1", time: "10:00 AM", focus: "Setup & alignment" },
];

export function getStudents(): Student[] {
  return STUDENTS;
}

export function getStudent(id: string): Student | undefined {
  return STUDENTS.find((s) => s.id === id);
}

export function getUpcomingLessons(): Lesson[] {
  return UPCOMING_LESSONS;
}

export function getCoachStats() {
  // TODO: mock aggregates — compute server-side later.
  return {
    activeStudents: STUDENTS.length,
    lessonsThisWeek: UPCOMING_LESSONS.length,
    avgMakePercent: Math.round(
      STUDENTS.reduce((a, s) => a + s.makePercent, 0) / STUDENTS.length,
    ),
    sessionsLogged: STUDENTS.reduce((a, s) => a + s.totalSessions, 0),
  };
}

/**
 * TODO: mock — per-student analytics currently reuse the shared sample session,
 * lightly shifted so each student looks distinct in the demo.
 */
export function getStudentAnalytics(studentId: string): SessionAnalytics {
  const base = getSessionAnalytics();
  const student = getStudent(studentId);
  if (!student) return base;
  const made = Math.round((student.makePercent / 100) * base.totalPutts);
  return {
    ...base,
    makePercent: student.makePercent,
    made,
    missed: base.totalPutts - made,
  };
}
