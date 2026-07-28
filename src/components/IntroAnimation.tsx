import { useEffect, useState } from "react";

interface IntroAnimationProps {
  onComplete: () => void;
}

const GREEN = "#22C55E";

type Phase = "rolling" | "dropping" | "zooming";

export function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [phase, setPhase] = useState<Phase>("rolling");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("dropping"), 1400);
    const t2 = setTimeout(() => setPhase("zooming"), 1800);
    const t3 = setTimeout(() => onComplete(), 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  const zooming = phase === "zooming";

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none"
      style={{
        backgroundColor: "#0A0A0A",
        opacity: zooming ? 0 : 1,
        transition: "opacity 600ms ease-out",
      }}
    >
      <style>{`
        @keyframes pv-ball-roll {
          0%   { transform: translate(-42vw, 28vh) rotate(0deg); opacity: 0; }
          10%  { opacity: 1; }
          100% { transform: translate(0, 0) rotate(720deg); opacity: 1; }
        }
        @keyframes pv-ball-drop {
          0%   { transform: translate(0,0) scale(1); opacity: 1; }
          60%  { transform: translate(0,4px) scale(0.5); opacity: 0.9; }
          100% { transform: translate(0,8px) scale(0); opacity: 0; }
        }
        @keyframes pv-ripple {
          0%   { transform: translate(-50%, -50%) scale(0.4); opacity: 0; }
          20%  { opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
        }
        @keyframes pv-zoom {
          0%   { transform: scale(1); opacity: 1; }
          100% { transform: scale(12); opacity: 0; }
        }
      `}</style>

      <div
        className="absolute inset-0"
        style={{
          transformOrigin: "50% 50%",
          animation: zooming ? "pv-zoom 800ms cubic-bezier(0.7, 0, 0.84, 0) forwards" : undefined,
        }}
      >
        {/* Golf green — full screen */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, #1F6B3A 0%, #134523 55%, #0B2A16 100%)",
            boxShadow: "inset 0 0 200px rgba(0,0,0,0.7)",
          }}
        >
          {/* Contour rings */}
          {[0.4, 0.6, 0.82].map((r) => (
            <div
              key={r}
              className="absolute left-1/2 top-1/2"
              style={{
                width: `${r * 100}%`,
                height: `${r * 100}%`,
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                border: "1px dashed rgba(255,255,255,0.06)",
              }}
            />
          ))}

          {/* Hole */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: 24,
              height: 24,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              backgroundColor: "#050505",
              boxShadow: "inset 0 3px 6px rgba(0,0,0,0.9), 0 0 0 2px #000",
            }}
          />

          {/* Flag */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: 2,
              height: 90,
              transform: "translate(-50%, -100%)",
              backgroundColor: "#F5F5F5",
            }}
          />
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              transform: "translate(0, calc(-100% - 76px))",
              width: 0,
              height: 0,
              borderTop: "8px solid transparent",
              borderBottom: "8px solid transparent",
              borderLeft: `18px solid ${GREEN}`,
            }}
          />

          {/* Ripple */}
          {phase === "dropping" && (
            <div
              className="absolute left-1/2 top-1/2"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: `3px solid ${GREEN}`,
                animation: "pv-ripple 700ms ease-out forwards",
              }}
            />
          )}

          {/* Ball */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: 20,
              height: 20,
              marginLeft: -10,
              marginTop: -10,
              borderRadius: "50%",
              backgroundColor: "#FFFFFF",
              boxShadow: "0 4px 10px rgba(0,0,0,0.5), inset -2px -3px 4px rgba(0,0,0,0.15)",
              animation:
                phase === "rolling"
                  ? "pv-ball-roll 1.4s cubic-bezier(0.45, 0.05, 0.35, 1) forwards"
                  : phase === "dropping"
                    ? "pv-ball-drop 400ms ease-in forwards"
                    : "none",
              opacity: phase === "zooming" ? 0 : 1,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function useIntroAnimation() {
  const [shown, setShown] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("pv_intro_shown");
    window.localStorage.removeItem("pv_intro_shown_v2");
    const seen = window.localStorage.getItem("pv_intro_v3");
    setShown(seen === "1");
  }, []);

  const complete = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("pv_intro_v3", "1");
    }
    setShown(true);
  };

  return { shown, complete };
}
