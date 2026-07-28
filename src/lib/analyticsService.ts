// TODO: Replace hardcoded sample data with real Supabase queries once the
// putting session schema is finalized. Keep the return shape stable so the
// Analytics tab does not need to change when we swap the data source.

export type PuttResult = "made" | "missed";

export type StartLinePoint = {
  /** Horizontal offset in degrees (- = left, + = right) */
  x: number;
  /** Distance in feet from the ball */
  y: number;
  result: PuttResult;
};

export type SpeedBucket = {
  speed: string; // label, e.g. "1.4"
  count: number;
};

export type PuttMapPoint = {
  /** Normalized -1..1 across the green (x) */
  x: number;
  /** Normalized 0..1 down from the hole */
  y: number;
  result: PuttResult;
};

export type StartLineAccuracyBar = {
  bucket: string; // e.g. "-3", "-1.5", "0", "1.5", "3"
  count: number;
};

export type SessionAnalytics = {
  makePercent: number;
  totalPutts: number;
  made: number;
  missed: number;
  avgDistanceFt: number;
  avgSpeedMs: number;
  avgStartLineDeg: number; // negative = left
  avgBreakDeg: number; // positive = right
  withinOneFiveDegPercent: number;
  optimalSpeedMs: number;
  tooSlow: number;
  good: number;
  tooFast: number;
  startLineAccuracy: StartLineAccuracyBar[];
  startLinePoints: StartLinePoint[];
  speedDistribution: SpeedBucket[];
  puttMap: PuttMapPoint[];
};

export function getSessionAnalytics(): SessionAnalytics {
  // TODO: fetch real session data from Supabase (Lovable Cloud) and map into
  // this shape. For now we return a representative sample session.
  return {
    makePercent: 64,
    totalPutts: 25,
    made: 16,
    missed: 9,
    avgDistanceFt: 18.6,
    avgSpeedMs: 1.7,
    avgStartLineDeg: -0.6,
    avgBreakDeg: 1.1,
    withinOneFiveDegPercent: 82,
    optimalSpeedMs: 1.8,
    tooSlow: 2,
    good: 19,
    tooFast: 4,
    startLineAccuracy: [
      { bucket: "-3", count: 1 },
      { bucket: "-2", count: 2 },
      { bucket: "-1", count: 5 },
      { bucket: "0", count: 9 },
      { bucket: "1", count: 5 },
      { bucket: "2", count: 2 },
      { bucket: "3", count: 1 },
    ],
    startLinePoints: [
      { x: -2.6, y: 22, result: "missed" },
      { x: -1.8, y: 15, result: "missed" },
      { x: -1.2, y: 18, result: "made" },
      { x: -0.9, y: 12, result: "made" },
      { x: -0.6, y: 25, result: "made" },
      { x: -0.4, y: 8, result: "made" },
      { x: -0.2, y: 20, result: "made" },
      { x: 0.1, y: 14, result: "made" },
      { x: 0.3, y: 19, result: "made" },
      { x: 0.4, y: 10, result: "made" },
      { x: 0.5, y: 24, result: "made" },
      { x: 0.6, y: 17, result: "made" },
      { x: 0.7, y: 13, result: "made" },
      { x: 0.9, y: 21, result: "made" },
      { x: 1.0, y: 9, result: "made" },
      { x: 1.1, y: 16, result: "made" },
      { x: 1.3, y: 23, result: "made" },
      { x: 1.4, y: 11, result: "made" },
      { x: 1.6, y: 18, result: "missed" },
      { x: 1.9, y: 26, result: "missed" },
      { x: 2.2, y: 14, result: "missed" },
      { x: 2.5, y: 20, result: "missed" },
      { x: -2.1, y: 28, result: "missed" },
      { x: -2.8, y: 12, result: "missed" },
      { x: 2.8, y: 22, result: "missed" },
    ],
    speedDistribution: [
      { speed: "1.0", count: 1 },
      { speed: "1.2", count: 1 },
      { speed: "1.4", count: 3 },
      { speed: "1.6", count: 5 },
      { speed: "1.8", count: 8 },
      { speed: "2.0", count: 4 },
      { speed: "2.2", count: 2 },
      { speed: "2.4", count: 1 },
    ],
    puttMap: [
      { x: -0.15, y: 0.12, result: "made" },
      { x: 0.05, y: 0.18, result: "made" },
      { x: -0.22, y: 0.25, result: "missed" },
      { x: 0.18, y: 0.22, result: "made" },
      { x: -0.05, y: 0.32, result: "made" },
      { x: 0.28, y: 0.35, result: "missed" },
      { x: -0.32, y: 0.4, result: "missed" },
      { x: 0.1, y: 0.42, result: "made" },
      { x: -0.12, y: 0.48, result: "made" },
      { x: 0.35, y: 0.5, result: "missed" },
      { x: -0.08, y: 0.55, result: "made" },
      { x: 0.22, y: 0.58, result: "made" },
      { x: -0.28, y: 0.62, result: "missed" },
      { x: 0.02, y: 0.65, result: "made" },
      { x: 0.15, y: 0.7, result: "made" },
      { x: -0.18, y: 0.72, result: "made" },
      { x: 0.38, y: 0.75, result: "missed" },
      { x: -0.4, y: 0.78, result: "missed" },
      { x: 0.08, y: 0.82, result: "made" },
      { x: -0.22, y: 0.85, result: "made" },
      { x: 0.28, y: 0.88, result: "missed" },
      { x: -0.05, y: 0.9, result: "made" },
      { x: 0.18, y: 0.92, result: "made" },
      { x: -0.35, y: 0.95, result: "missed" },
      { x: 0.32, y: 0.15, result: "made" },
    ],
  };
}
