import { useEffect, useState } from "react";

interface IntroAnimationProps {
  onComplete: () => void;
}

const GREEN = "#22C55E";

export function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [phase, setPhase] = useState<"scene" | "logo" | "done">("scene");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("logo"), 2600);
    const t2 = setTimeout(() => setPhase("done"), 4200);
    const t3 = setTimeout(() => onComplete(), 4300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden bg-black"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      <style>{`
        @keyframes pv-ball-roll {
          0% {
            offset-distance: 0%;
            opacity: 0;
            transform: scale(1);
          }
          8% { opacity: 1; }
          75% {
            offset-distance: 100%;
            opacity: 1;
            transform: scale(1);
          }
          88% {
            offset-distance: 100%;
            opacity: 1;
            transform: scale(0.35) translateY(6px);
          }
          100% {
            offset-distance: 100%;
            opacity: 0;
            transform: scale(0) translateY(10px);
          }
        }
        @keyframes pv-ripple {
          0% { transform: scale(0.2); opacity: 0; }
          20% { opacity: 0.9; }
          100% { transform: scale(6); opacity: 0; }
        }
        @keyframes pv-zoom {
          0% { transform: scale(1); opacity: 1; }
          60% { transform: scale(3.5); opacity: 1; }
          100% { transform: scale(9); opacity: 0; }
        }
        @keyframes pv-scene-fade {
          0%, 80% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes pv-logo-in {
          0% { opacity: 0; transform: translateY(8px) scale(0.98); }
          15% { opacity: 1; transform: translateY(0) scale(1); }
          85% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-4px) scale(1); }
        }
      `}</style>

      {phase === "scene" && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            animation: "pv-zoom 800ms cubic-bezier(0.7, 0, 0.84, 0) 1.6s forwards, pv-scene-fade 400ms ease-out 2.2s forwards",
            transformOrigin: "50% 50%",
          }}
        >
          <svg
            viewBox="0 0 800 800"
            className="w-[90vmin] h-[90vmin]"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <radialGradient id="pv-green-grad" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#1F6B3A" />
                <stop offset="70%" stopColor="#134523" />
                <stop offset="100%" stopColor="#0B2A16" />
              </radialGradient>
              <filter id="pv-ball-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" />
              </filter>
            </defs>

            {/* Green */}
            <circle cx="400" cy="400" r="360" fill="url(#pv-green-grad)" stroke="#0F3A1E" strokeWidth="2" />

            {/* Subtle contour lines */}
            {[0.35, 0.55, 0.78].map((r, i) => (
              <ellipse
                key={i}
                cx="400"
                cy="400"
                rx={360 * r}
                ry={360 * r * 0.95}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 8"
              />
            ))}

            {/* Hole */}
            <circle cx="400" cy="400" r="14" fill="#050505" stroke="#000" strokeWidth="2" />

            {/* Ripple */}
            <circle
              cx="400"
              cy="400"
              r="14"
              fill="none"
              stroke={GREEN}
              strokeWidth="3"
              style={{
                transformOrigin: "400px 400px",
                animation: "pv-ripple 700ms ease-out 1.4s both",
              }}
            />

            {/* Flag */}
            <line x1="400" y1="400" x2="400" y2="290" stroke="#F5F5F5" strokeWidth="3" />
            <path d="M 400 290 L 448 302 L 400 314 Z" fill={GREEN} />

            {/* Ball path (hidden) — used for offset-path */}
            <path
              id="pv-ball-path"
              d="M 120 700 C 220 620, 260 520, 340 460 S 400 400, 400 400"
              fill="none"
              stroke="none"
            />

            {/* Ball */}
            <g
              style={{
                offsetPath: "path('M 120 700 C 220 620, 260 520, 340 460 S 400 400, 400 400')",
                offsetRotate: "0deg",
                animation: "pv-ball-roll 1.6s cubic-bezier(0.55, 0.05, 0.35, 1) forwards",
                transformBox: "fill-box",
              }}
            >
              <circle r="16" fill="#000" opacity="0.35" filter="url(#pv-ball-shadow)" cy="4" />
              <circle r="14" fill="#FFFFFF" stroke="#DDDDDD" strokeWidth="1" />
            </g>
          </svg>
        </div>
      )}

      {phase === "logo" && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: "#000" }}
        >
          <div
            className="flex flex-col items-center gap-2"
            style={{ animation: "pv-logo-in 1.6s ease-in-out forwards" }}
          >
            <h1 className="text-6xl font-bold tracking-tight text-white">Golf Analytics</h1>
            <p className="text-sm font-semibold tracking-[0.28em] uppercase" style={{ color: GREEN }}>
              by Putt Vector
            </p>
          </div>
        </div>
      )}

      {phase === "done" && <div className="absolute inset-0 bg-black" />}
    </div>
  );
}

export function useIntroAnimation() {
  const [shown, setShown] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("pv_intro_shown");
    const seen = window.localStorage.getItem("pv_intro_shown_v2");
    setShown(seen === "1");
  }, []);

  const complete = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("pv_intro_shown_v2", "1");
    }
    setShown(true);
  };

  return { shown, complete };
}
