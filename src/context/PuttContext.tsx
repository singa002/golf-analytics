import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { generatePuttData, type PuttData } from "@/lib/sensorService";

interface PuttContextValue {
  currentPutt: PuttData;
  generateNewPutt: () => PuttData;
}

const PuttContext = createContext<PuttContextValue | null>(null);

export function PuttProvider({ children }: { children: ReactNode }) {
  const [currentPutt, setCurrentPutt] = useState<PuttData>(() => generatePuttData());

  const generateNewPutt = useCallback(() => {
    const next = generatePuttData();
    setCurrentPutt(next);
    return next;
  }, []);

  return (
    <PuttContext.Provider value={{ currentPutt, generateNewPutt }}>
      {children}
    </PuttContext.Provider>
  );
}

export function usePutt() {
  const ctx = useContext(PuttContext);
  if (!ctx) throw new Error("usePutt must be used within a PuttProvider");
  return ctx;
}
