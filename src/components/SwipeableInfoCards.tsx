import { useRef, useState } from "react";
import type { PuttData } from "@/lib/sensorService";

const CARD = "#1C1C1E";
const ACCENT = "#22C55E"; // --golf-accent
const RED = "#EF4444";
const WHITE = "#FFFFFF";

export interface SessionPutt {
  made: boolean;
  distanceFt: number;
  speedMs: number;
}

/** Fallback recent putts when the live session hasn't started yet */
const MOCK_RECENT: SessionPutt[] = [
  { made: true, distanceFt: 8, speedMs: 1.2 },
  { made: false, distanceFt: 12, speedMs: 1.5 },
  { made: true, distanceFt: 6, speedMs: 0.9 },
];

interface Props {
  putts: number;
  made: number;
  streak: number;
  recent: SessionPutt[];
  tip: string;
}

export function SwipeableInfoCards({ putts, made, streak, recent, tip }: Props) {
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const displayRecent = recent.length > 0 ? recent : MOCK_RECENT;

  const go = (i: number) => setIndex(Math.max(0, Math.min(2, i)));

  const onStart = (x: number) => {
    startX.current = x;
  };

  const onEnd = (x: number) => {
    if (startX.current === null) return;
    const dx = x - startX.current;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
    startX.current = null;
  };

  const onCancel = () => {
    startX.current = null;
  };

  return (
    <div
      className="rounded-2xl overflow-hidden select-none shrink-0"
      style={{ backgroundColor: CARD, height: 148 }}
      onTouchStart={(e) => onStart(e.touches[0].clientX)}
      onTouchEnd={(e) => onEnd(e.changedTouches[0].clientX)}
      onTouchCancel={onCancel}
      onMouseDown={(e) => onStart(e.clientX)}
      onMouseUp={(e) => onEnd(e.clientX)}
      onMouseLeave={onCancel}
    >
      {/* Track is 300% wide; each panel is 1/3 of the track (= 100% of the viewport).
          translateX percentages are relative to the track itself, so move by index * (100/3)%. */}
      <div
        className="flex h-[112px] transition-transform duration-300 ease-out"
        style={{
          width: "300%",
          transform: `translateX(-${(index * 100) / 3}%)`,
        }}
      >
        <div className="w-1/3 shrink-0 px-4 py-3">
          <div className="golf-label mb-2">
            Session
          </div>
          <div className="flex items-end justify-around">
            <Stat label="Putts" value={putts.toString()} color={WHITE} />
            <Stat label="Made" value={made.toString()} color={ACCENT} />
            <Stat label="Streak" value={streak.toString()} color={WHITE} />
          </div>
        </div>

        <div className="w-1/3 shrink-0 px-4 py-3">
          <div className="golf-label mb-2">
            Recent
          </div>
          <div className="flex flex-col gap-1.5">
            {displayRecent.slice(0, 3).map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: p.made ? ACCENT : RED }}
                />
                <span style={{ color: WHITE }}>{p.distanceFt} ft</span>
                <span className="golf-text-secondary">·</span>
                <span style={{ color: WHITE }}>{p.speedMs} m/s</span>
                <span className="golf-text-secondary">·</span>
                <span style={{ color: p.made ? ACCENT : RED }} className="font-semibold">
                  {p.made ? "Made" : "Missed"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-1/3 shrink-0 px-4 py-3 flex flex-col">
          <div className="golf-label mb-2">
            Coaching Tip
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm italic text-center leading-relaxed" style={{ color: ACCENT }}>
              &ldquo;{tip}&rdquo;
            </p>
          </div>
        </div>
      </div>

      <div className="h-9 flex items-center justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(i);
            }}
            aria-label={`Card ${i + 1}`}
            className="h-2 rounded-full transition-all"
            style={{
              width: i === index ? 20 : 8,
              backgroundColor: i === index ? ACCENT : "#3A3A3C",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="golf-display text-2xl tracking-tight" style={{ color }}>
        {value}
      </div>
      <div className="golf-label-sm">
        {label}
      </div>
    </div>
  );
}

export const COACHING_TIPS = [
  "Focus on keeping your putter face square through impact",
  "Accelerate through the ball — never decelerate at impact",
  "Read the grain direction before committing to a line",
  "Match your backswing length to your follow through",
  "Keep your eyes over the ball at address",
  "Commit to your read — doubt causes pulled putts",
];

export type _Unused = PuttData;
