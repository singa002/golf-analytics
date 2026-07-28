// TODO: Replace with real Supabase queries once session schema is finalized.
import type { PuttMapPoint, StartLineAccuracyBar } from "./analyticsService";

export type SessionSummary = {
  id: string;
  date: string; // e.g. "Mon Jul 27"
  time: string; // e.g. "3:48 PM"
  makePercent: number;
  totalPutts: number;
  made: number;
  missed: number;
  avgDistanceFt: number;
  avgSpeedMs: number;
  avgStartLineDeg: number;
  avgBreakDeg: number;
  startLineAccuracy: StartLineAccuracyBar[];
  puttMap: PuttMapPoint[];
};

function makePuttMap(total: number, made: number): PuttMapPoint[] {
  const pts: PuttMapPoint[] = [];
  for (let i = 0; i < total; i++) {
    const t = i / Math.max(1, total - 1);
    const x = Math.sin(i * 1.7) * 0.4;
    const y = 0.1 + t * 0.85;
    pts.push({ x, y, result: i < made ? "made" : "missed" });
  }
  // shuffle deterministically
  return pts.sort((a, b) => Math.sin(a.x * 9 + a.y) - Math.sin(b.x * 9 + b.y));
}

function makeAccuracy(peak: number): StartLineAccuracyBar[] {
  const buckets = ["-3", "-2", "-1", "0", "1", "2", "3"];
  return buckets.map((b) => {
    const d = Math.abs(parseFloat(b));
    const count = Math.max(1, Math.round(peak * Math.exp(-d * 0.6)));
    return { bucket: b, count };
  });
}

export function getSessionHistory(): SessionSummary[] {
  const base: Omit<SessionSummary, "startLineAccuracy" | "puttMap">[] = [
    { id: "s1", date: "Mon Jul 27", time: "3:48 PM", makePercent: 64, totalPutts: 25, made: 16, missed: 9, avgDistanceFt: 18.6, avgSpeedMs: 1.7, avgStartLineDeg: -0.6, avgBreakDeg: 1.1 },
    { id: "s2", date: "Sun Jul 26", time: "10:15 AM", makePercent: 70, totalPutts: 30, made: 21, missed: 9, avgDistanceFt: 15.2, avgSpeedMs: 1.6, avgStartLineDeg: -0.4, avgBreakDeg: 0.9 },
    { id: "s3", date: "Sat Jul 25", time: "4:00 PM", makePercent: 55, totalPutts: 20, made: 11, missed: 9, avgDistanceFt: 22.1, avgSpeedMs: 1.9, avgStartLineDeg: 0.8, avgBreakDeg: 1.4 },
    { id: "s4", date: "Thu Jul 24", time: "9:30 AM", makePercent: 74, totalPutts: 35, made: 26, missed: 9, avgDistanceFt: 12.8, avgSpeedMs: 1.5, avgStartLineDeg: -0.3, avgBreakDeg: 0.8 },
    { id: "s5", date: "Wed Jul 23", time: "2:00 PM", makePercent: 61, totalPutts: 18, made: 11, missed: 7, avgDistanceFt: 19.4, avgSpeedMs: 1.8, avgStartLineDeg: 0.5, avgBreakDeg: 1.2 },
    { id: "s6", date: "Tue Jul 22", time: "11:00 AM", makePercent: 58, totalPutts: 22, made: 13, missed: 9, avgDistanceFt: 20.5, avgSpeedMs: 1.7, avgStartLineDeg: -0.7, avgBreakDeg: 1.0 },
  ];

  return base.map((s) => ({
    ...s,
    startLineAccuracy: makeAccuracy(Math.round(s.totalPutts / 3)),
    puttMap: makePuttMap(s.totalPutts, s.made),
  }));
}
