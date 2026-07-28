export type PrePuttRead = {
  status: "READY";
  distanceFt: number;
  speedMs: number;
  breakDeg: number;
  breakDirection: "Left" | "Right";
  startLineDeg: number;
  startLineDirection: "Left" | "Right";
  stimp: number;
  aimPointFt: number;
  aimPointDirection: "Left" | "Right";
  coaching: string;
};

export function getPrePuttRead(): PrePuttRead {
  // TODO: Replace with real read from the backend once the putt preview schema
  // is in place. Keep the return shape stable so the Preview tab can swap
  // data sources without changing its UI.
  return {
    status: "READY",
    distanceFt: 21.4,
    speedMs: 1.8,
    breakDeg: 1.2,
    breakDirection: "Right",
    startLineDeg: 0.9,
    startLineDirection: "Left",
    stimp: 10.5,
    aimPointFt: 2.1,
    aimPointDirection: "Left",
    coaching:
      "This putt is 21.4 feet. It breaks right to left and is slightly downhill. Favor the high side and stroke the putt firmly at 1.8 meters per second. Aim 2.1 feet left of center.",
  };
}
