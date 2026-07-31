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

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function getPrePuttRead(): PrePuttRead {
  // TODO: Replace with real read from the backend once the putt preview schema
  // is in place. Keep the return shape stable so the Ready state can swap
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

/**
 * A fresh predicted read for the next putt.
 * TODO: Replace with real hardware/sensor read.
 */
export function generatePrePuttRead(): PrePuttRead {
  const distanceFt = Number(rand(6, 28).toFixed(1));
  const speedMs = Number(rand(1.3, 2.3).toFixed(2));
  const breakDeg = Number(rand(0.4, 2.4).toFixed(1));
  const breakDirection: "Left" | "Right" = Math.random() < 0.5 ? "Left" : "Right";
  const startLineDeg = Number(rand(0.3, 1.6).toFixed(1));
  const startLineDirection: "Left" | "Right" = breakDirection === "Right" ? "Left" : "Right";
  const stimp = Number(rand(9, 12).toFixed(1));
  const aimPointFt = Number((breakDeg * rand(1.4, 2.0)).toFixed(1));
  const aimPointDirection = startLineDirection;

  const slope = Math.random() < 0.5 ? "slightly downhill" : "slightly uphill";
  const highSide = breakDirection === "Right" ? "left" : "right";

  return {
    status: "READY",
    distanceFt,
    speedMs,
    breakDeg,
    breakDirection,
    startLineDeg,
    startLineDirection,
    stimp,
    aimPointFt,
    aimPointDirection,
    coaching: `This putt is ${distanceFt} feet. It breaks ${breakDirection.toLowerCase()} to ${highSide} and is ${slope}. Favor the high side and stroke the putt at ${speedMs} meters per second. Aim ${aimPointFt} feet ${aimPointDirection.toLowerCase()} of center.`,
  };
}
