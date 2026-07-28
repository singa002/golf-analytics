// Sensor service — hardware sensor data will replace these randomized values.

export type PuttQuality = "Good" | "Fair" | "Poor";

export interface PuttData {
  speedMs: number;
  speedQuality: PuttQuality;
  startLineDeg: number;
  startLineDirection: "Left" | "Right";
  startLineQuality: PuttQuality;
  breakDeg: number;
  breakDirection: "Left" | "Right";
  breakQuality: PuttQuality;
  entrySpeedMs: number;
  made: boolean;
  coaching: string;
  // Ball path deviation across the roll, expressed in inches at 8 sample points along the path (positive = right).
  pathSamples: number[];
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function classify(diff: number): PuttQuality {
  const a = Math.abs(diff);
  if (a < 0.35) return "Good";
  if (a < 0.75) return "Fair";
  return "Poor";
}

export function generatePuttData(): PuttData {
  // TODO: Replace with real hardware sensor data
  const speedMs = Number(rand(1.5, 2.1).toFixed(2));
  // TODO: Replace with real hardware sensor data
  const startLineDeg = Number(rand(0.4, 1.6).toFixed(1));
  // TODO: Replace with real hardware sensor data
  const startLineDirection: "Left" | "Right" = Math.random() < 0.6 ? "Left" : "Right";
  // TODO: Replace with real hardware sensor data
  const breakDeg = Number(rand(0.9, 1.5).toFixed(1));
  const breakDirection: "Left" | "Right" = "Right";
  // TODO: Replace with real hardware sensor data
  const entrySpeedMs = Number((speedMs - rand(0, 0.15)).toFixed(2));
  // TODO: Replace with real hardware sensor data
  const made = Math.random() < 0.65;

  const speedQuality = classify(speedMs - 1.8);
  const startLineQuality = classify(startLineDeg - 0.9);
  const breakQuality = classify(breakDeg - 1.2);

  const madeCoaching = [
    `Nice putt! You were within ${(Math.random() * 0.3 + 0.1).toFixed(1)}° of your line`,
    "Great tempo through impact — kept the face square",
    "Solid roll — pace and line matched the read",
  ];
  const missedCoaching = [
    "You pulled the face slightly left at impact",
    "A touch firm — the ball skipped through the break",
    "Face open at impact pushed the start line right",
  ];
  const coaching = made
    ? madeCoaching[Math.floor(Math.random() * madeCoaching.length)]
    : missedCoaching[Math.floor(Math.random() * missedCoaching.length)];

  // TODO: Replace with real hardware sensor data
  const drift = (startLineDirection === "Left" ? -1 : 1) * startLineDeg * 0.6;
  const pathSamples = Array.from({ length: 8 }, (_, i) => {
    const t = i / 7;
    return drift * t + (Math.random() - 0.5) * 0.25;
  });

  return {
    speedMs,
    speedQuality,
    startLineDeg,
    startLineDirection,
    startLineQuality,
    breakDeg,
    breakDirection,
    breakQuality,
    entrySpeedMs,
    made,
    coaching,
    pathSamples,
  };
}
