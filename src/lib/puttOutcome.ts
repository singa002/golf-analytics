import type { PrePuttRead } from "@/lib/previewService";

export type PuttOutcomeId =
  | "pure-make"
  | "tracking-make"
  | "late-diverge"
  | "early-veer"
  | "distance-miss";

export type MeasuredStat = {
  label: string;
  value: string;
  /** true when the measured value materially differs from the predicted read */
  off?: boolean;
};

export type PuttOutcome = {
  id: PuttOutcomeId;
  /** Human-readable variant name (used in the result view + testing) */
  name: string;
  made: boolean;
  /** The six measured stats, revealed one at a time during the LIVE state */
  stats: MeasuredStat[];
  /** Lateral deviation samples (in feet, positive = right of the intended line) */
  deviation: number[];
  /** 1 = finishes at the hole, <1 = short, >1 = runs past */
  endScale: number;
  /** Coaching sentence shown in the RESULT state */
  feedback: string;
};

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function n1(v: number) {
  return Number(v.toFixed(1));
}

function n2(v: number) {
  return Number(v.toFixed(2));
}

/** Build a smooth 0→1 ramp of lateral deviation with an optional onset point. */
function ramp(magnitude: number, onset: number, samples = 9) {
  return Array.from({ length: samples }, (_, i) => {
    const t = i / (samples - 1);
    if (t <= onset) return magnitude * 0.06 * (t / Math.max(onset, 0.0001));
    const k = (t - onset) / (1 - onset);
    return magnitude * (0.06 + 0.94 * k * k);
  });
}

function buildStats(
  read: PrePuttRead,
  measured: {
    distanceFt: number;
    speedMs: number;
    breakDeg: number;
    startLineDeg: number;
    startLineDirection: "Left" | "Right";
    stimp: number;
    aimPointFt: number;
  },
  offFlags: Partial<Record<"distance" | "speed" | "break" | "startLine" | "stimp" | "aimPoint", boolean>>,
): MeasuredStat[] {
  return [
    { label: "Distance", value: `${n1(measured.distanceFt)} ft`, off: offFlags.distance },
    { label: "Speed", value: `${n2(measured.speedMs)} m/s`, off: offFlags.speed },
    { label: "Break", value: `${n1(measured.breakDeg)}° ${read.breakDirection}`, off: offFlags.break },
    {
      label: "Start Line",
      value: `${n1(measured.startLineDeg)}° ${measured.startLineDirection}`,
      off: offFlags.startLine,
    },
    { label: "Stimp", value: `${n1(measured.stimp)}`, off: offFlags.stimp },
    {
      label: "Aim Point",
      value: `${n1(measured.aimPointFt)} ft ${read.aimPointDirection}`,
      off: offFlags.aimPoint,
    },
  ];
}

const VARIANTS: Record<PuttOutcomeId, (read: PrePuttRead) => PuttOutcome> = {
  // (d) tracks exactly on the intended line and makes it
  "pure-make": (read) => {
    const startLineDeg = n1(read.startLineDeg + rand(-0.08, 0.08));
    const speedMs = n2(read.speedMs + rand(-0.04, 0.04));
    return {
      id: "pure-make",
      name: "Pure — dead on line",
      made: true,
      stats: buildStats(
        read,
        {
          distanceFt: read.distanceFt,
          speedMs,
          breakDeg: read.breakDeg,
          startLineDeg,
          startLineDirection: read.startLineDirection,
          stimp: read.stimp,
          aimPointFt: read.aimPointFt,
        },
        {},
      ),
      deviation: ramp(rand(-0.08, 0.08), 0.2),
      endScale: 1,
      feedback: `Perfect. You started it ${startLineDeg}° ${read.startLineDirection.toLowerCase()} — within a hair of the ${read.startLineDeg}° read — and rolled it at ${speedMs} m/s so the ball took the full ${read.breakDeg}° of break and died in the middle of the cup.`,
    };
  },

  // (a) closely tracks the intended line and makes it
  "tracking-make": (read) => {
    const drift = rand(0.18, 0.4) * (read.breakDirection === "Right" ? -1 : 1);
    const speedMs = n2(read.speedMs + rand(-0.09, 0.09));
    const startLineDeg = n1(read.startLineDeg + rand(0.1, 0.3));
    return {
      id: "tracking-make",
      name: "Tracking — caught the side door",
      made: true,
      stats: buildStats(
        read,
        {
          distanceFt: read.distanceFt,
          speedMs,
          breakDeg: n1(read.breakDeg + rand(-0.15, 0.15)),
          startLineDeg,
          startLineDirection: read.startLineDirection,
          stimp: read.stimp,
          aimPointFt: n1(read.aimPointFt + rand(-0.2, 0.2)),
        },
        { startLine: true },
      ),
      deviation: ramp(drift, 0.35),
      endScale: 1,
      feedback: `Made it, but you rode the edge. Start line was ${startLineDeg}° ${read.startLineDirection.toLowerCase()} versus the ${read.startLineDeg}° read, so the ball drifted about ${Math.abs(n1(drift * 12))} in off the intended track and caught the side door. Your speed control at ${speedMs} m/s is what saved it.`,
    };
  },

  // (b) tracks the intended line partway then diverges and misses
  "late-diverge": (read) => {
    const side: "Left" | "Right" = read.breakDirection === "Right" ? "Left" : "Right";
    const mag = rand(0.55, 0.95) * (side === "Right" ? 1 : -1);
    const speedMs = n2(read.speedMs - rand(0.1, 0.22));
    return {
      id: "late-diverge",
      name: "Late diverge — lipped out",
      made: false,
      stats: buildStats(
        read,
        {
          distanceFt: read.distanceFt,
          speedMs,
          breakDeg: n1(read.breakDeg + rand(0.3, 0.7)),
          startLineDeg: n1(read.startLineDeg + rand(-0.1, 0.1)),
          startLineDirection: read.startLineDirection,
          stimp: read.stimp,
          aimPointFt: read.aimPointFt,
        },
        { speed: true, break: true },
      ),
      endScale: rand(0.97, 1.03),
      deviation: ramp(mag, 0.62),
      feedback: `You matched the read for the first two thirds, then it let go. Rolling at ${speedMs} m/s — about ${n2(read.speedMs - speedMs)} m/s under the ${read.speedMs} m/s target — the ball lost pace late and took ${Math.abs(n1(mag * 12))} in more break than planned, falling away ${side.toLowerCase()} and lipping out. Same line, but hit it firmer so it holds through the last three feet.`,
    };
  },

  // (c) veers off significantly from the start and misses
  "early-veer": (read) => {
    const side: "Left" | "Right" = Math.random() < 0.5 ? "Left" : "Right";
    const mag = rand(1.3, 2.1) * (side === "Right" ? 1 : -1);
    const startLineDeg = n1(read.startLineDeg + rand(1.2, 2.2));
    return {
      id: "early-veer",
      name: "Early veer — pushed off line",
      made: false,
      stats: buildStats(
        read,
        {
          distanceFt: read.distanceFt,
          speedMs: n2(read.speedMs + rand(-0.08, 0.08)),
          breakDeg: n1(read.breakDeg + rand(-0.2, 0.2)),
          startLineDeg,
          startLineDirection: side,
          stimp: read.stimp,
          aimPointFt: n1(read.aimPointFt + rand(0.8, 1.6)),
        },
        { startLine: true, aimPoint: true },
      ),
      endScale: rand(0.98, 1.04),
      deviation: ramp(mag, 0.12),
      feedback: `The face was off at impact. You started it ${startLineDeg}° ${side.toLowerCase()} instead of ${read.startLineDeg}° ${read.startLineDirection.toLowerCase()}, so it drifted ${side.toLowerCase()} of the intended line straight away and finished roughly ${Math.abs(n1(mag * 12))} in wide. Pace was fine — this one is all start line, so square the face and commit to the ${read.aimPointFt} ft ${read.aimPointDirection.toLowerCase()} aim point.`,
    };
  },

  // (e) overshoots or undershoots distance-wise and misses
  "distance-miss": (read) => {
    const long = Math.random() < 0.5;
    const endScale = long ? rand(1.18, 1.32) : rand(0.7, 0.84);
    const speedMs = n2(long ? read.speedMs + rand(0.22, 0.42) : read.speedMs - rand(0.28, 0.45));
    const distanceFt = n1(read.distanceFt * endScale);
    return {
      id: "distance-miss",
      name: long ? "Ran long — too much pace" : "Left short — not enough pace",
      made: false,
      stats: buildStats(
        read,
        {
          distanceFt,
          speedMs,
          breakDeg: n1(long ? read.breakDeg - rand(0.3, 0.6) : read.breakDeg + rand(0.3, 0.6)),
          startLineDeg: n1(read.startLineDeg + rand(-0.15, 0.15)),
          startLineDirection: read.startLineDirection,
          stimp: read.stimp,
          aimPointFt: read.aimPointFt,
        },
        { distance: true, speed: true, break: true },
      ),
      endScale,
      deviation: ramp(rand(-0.25, 0.25) + (long ? 0.25 : -0.25), 0.5),
      feedback: long
        ? `Line was good — pace beat you. At ${speedMs} m/s (${n2(speedMs - read.speedMs)} m/s hot) the ball held too straight through the break and ran ${n1(distanceFt - read.distanceFt)} ft past the hole. Take a shorter stroke and trust the ${read.breakDeg}° read.`
        : `Line was good — you left it short. At ${speedMs} m/s (${n2(read.speedMs - speedMs)} m/s soft) the ball took extra break and stopped ${n1(read.distanceFt - distanceFt)} ft shy. Get it to at least ${read.speedMs} m/s so it reaches the hole.`,
    };
  },
};

const VARIANT_IDS = Object.keys(VARIANTS) as PuttOutcomeId[];

/**
 * Randomly selects one of the five putt outcome variants and produces the
 * measured stats, red live-path shape, and coaching feedback for it.
 *
 * TODO: Replace with real hardware/sensor data — the returned shape (measured
 * stats + lateral deviation samples + endScale) is what the LIVE state consumes,
 * so a real sensor stream can drop in here without touching the UI.
 */
export function pickPuttOutcome(read: PrePuttRead): PuttOutcome {
  const id = VARIANT_IDS[Math.floor(Math.random() * VARIANT_IDS.length)];
  return VARIANTS[id](read);
}
