import { useRef, useState } from "react";
import type { PuttData } from "@/lib/sensorService";

const CARD = "#1C1C1E";
const GREEN = "#22C55E";
const RED = "#EF4444";
const WHITE = "#FFFFFF";
const GRAY = "#9CA3AF";

export interface SessionPutt {
  made: boolean;
  distanceFt: number;
  speedMs: number;
}

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

  const go = (i: number) => setIndex(Math.max(0, Math.min(2, i)));

  const onStart = (x: number) => (startX.current = x);
  const onEnd = (x: number) => {
    if (startX.current === null) return;
    const dx = x - startX.current;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
    startX.current = null;
  };

  return (
    <div
      className="rounded-2xl overflow-hidden select-none"
      style={{ backgroundColor: CARD, height: 180 }}
      onTouchStart={(e) => onStart(e.touches[0].clientX)}
      onTouchEnd={(e) => onEnd(e.changedTouches[0].clientX)}
      onMouseDown={(e) => onStart(e.clientX)}
      onMouseUp={(e) => onEnd(e.clientX)}
    >
      <div
        className="flex h-[140px] transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${index * 100}%)`, width: "300%" }}
      >
        <div className="w-1/3 shrink-0 p-5">
          <div className="text-[10px] uppercase tracking-widest mb-4" style={{ color: GRAY }}>Session</div>
          <div className="flex items-end justify-around">
            <Stat label="Putts" value={putts.toString()} color={WHITE} />
            <Stat label="Made" value={made.toString()} color={GREEN} />
            <Stat label="Streak" value={streak.toString()} color={WHITE} />
          </div>
        </div>

        <div className="w-1/3 shrink-0 p-5">
          <div className="text-[10px] uppercase tracking-widest mb-3" style={{ color: GRAY }}>Recent</div>
          {recent.length === 0 ? (
            <div className="h-[90px] flex items-center justify-center text-sm italic" style={{ color: GRAY }}>
              Hit PUTT NOW to start tracking
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recent.slice(0, 3).map((p, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: p.made ? GREEN : RED }}
                  />
                  <span style={{ color: WHITE }}>{p.distanceFt} ft</span>
                  <span style={{ color: GRAY }}>·</span>
                  <span style={{ color: WHITE }}>{p.speedMs} m/s</span>
                  <span style={{ color: GRAY }}>·</span>
                  <span style={{ color: p.made ? GREEN : RED }} className="font-semibold">
                    {p.made ? "Made" : "Missed"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-1/3 shrink-0 p-5 flex flex-col">
          <div className="text-[10px] uppercase tracking-widest mb-3" style={{ color: GRAY }}>Coaching Tip</div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-base italic text-center leading-relaxed" style={{ color: GREEN }}>
              &ldquo;{tip}&rdquo;
            </p>
          </div>
        </div>
      </div>

      <div className="h-10 flex items-center justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Card ${i + 1}`}
            className="h-2 rounded-full transition-all"
            style={{
              width: i === index ? 20 : 8,
              backgroundColor: i === index ? GREEN : "#3A3A3C",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-3xl font-bold tracking-tight" style={{ color }}>{value}</div>
      <div className="text-[10px] uppercase tracking-widest" style={{ color: GRAY }}>{label}</div>
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
