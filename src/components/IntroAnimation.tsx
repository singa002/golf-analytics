import { useEffect, useState } from "react";

interface IntroAnimationProps {
  onComplete: () => void;
}

export function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [phase, setPhase] = useState<"drop" | "logo" | "done">("drop");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("logo"), 1500);
    const t2 = setTimeout(() => setPhase("done"), 3200);
    const t3 = setTimeout(() => onComplete(), 3800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-500"
      style={{ opacity: phase === "done" ? 0 : 1 }}
    >
      <style>{`
        @keyframes ballDrop {
          0% { transform: translateY(-320px) rotate(0deg); opacity: 0; }
          15% { opacity: 1; }
          70% { transform: translateY(0) rotate(540deg); opacity: 1; }
          85% { transform: translateY(0) rotate(560deg) scale(0.6); opacity: 0.6; }
          100% { transform: translateY(0) rotate(560deg) scale(0); opacity: 0; }
        }
        @keyframes logoFade {
          0% { opacity: 0; transform: translateY(8px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-4px); }
        }
      `}</style>

      {phase === "drop" && (
        <div className="relative flex items-center justify-center">
          <div
            className="absolute h-6 w-6 rounded-full"
            style={{ backgroundColor: "#0A0A0A", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.8)" }}
          />
          <div
            className="h-6 w-6 rounded-full bg-white shadow-lg"
            style={{
              animation: "ballDrop 1.5s cubic-bezier(0.5, 0, 0.75, 0) forwards",
              boxShadow: "0 4px 12px rgba(255,255,255,0.3)",
            }}
          />
        </div>
      )}

      {phase !== "drop" && (
        <div
          className="flex flex-col items-center gap-2"
          style={{ animation: "logoFade 1.7s ease-in-out forwards" }}
        >
          <h1 className="text-5xl font-bold tracking-tight text-white">Golf Analytics</h1>
          <p className="text-sm font-semibold tracking-[0.25em] uppercase" style={{ color: "#22C55E" }}>
            by Putt Vector
          </p>
        </div>
      )}
    </div>
  );
}

export function useIntroAnimation() {
  const [shown, setShown] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Clean up any older key from prior testing so animation shows.
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
