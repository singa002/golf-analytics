import { createContext, useContext, useState, type ReactNode } from "react";

// TODO: This is a UI-only toggle for demo purposes. Later this will be driven by
// the signed-in user's actual role from Supabase (golfer vs coach), not local state.

export type ViewMode = "golfer" | "coach";

type ViewModeContextValue = {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
  toggleMode: () => void;
};

const ViewModeContext = createContext<ViewModeContextValue | null>(null);

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ViewMode>("golfer");
  const toggleMode = () => setMode((m) => (m === "golfer" ? "coach" : "golfer"));

  return (
    <ViewModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const ctx = useContext(ViewModeContext);
  if (!ctx) throw new Error("useViewMode must be used within a ViewModeProvider");
  return ctx;
}
