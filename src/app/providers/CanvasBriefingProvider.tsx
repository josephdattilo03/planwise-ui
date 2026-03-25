'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type CanvasAiBriefing = {
  text: string;
  proposed_actions: unknown[];
};

type Ctx = {
  briefing: CanvasAiBriefing | null;
  /** Increments when a new briefing is set (remount chat with a fresh opening message). */
  briefingNonce: number;
  setCanvasBriefing: (b: CanvasAiBriefing | null) => void;
};

const CanvasBriefingContext = createContext<Ctx | null>(null);

export function CanvasBriefingProvider({ children }: { children: ReactNode }) {
  const [briefing, setBriefing] = useState<CanvasAiBriefing | null>(null);
  const [briefingNonce, setBriefingNonce] = useState(0);
  const setCanvasBriefing = useCallback((b: CanvasAiBriefing | null) => {
    setBriefing(b);
    if (b) {
      setBriefingNonce((n) => n + 1);
    }
  }, []);
  const value = useMemo(
    () => ({ briefing, briefingNonce, setCanvasBriefing }),
    [briefing, briefingNonce, setCanvasBriefing],
  );
  return (
    <CanvasBriefingContext.Provider value={value}>
      {children}
    </CanvasBriefingContext.Provider>
  );
}

export function useCanvasBriefing(): Ctx {
  const ctx = useContext(CanvasBriefingContext);
  if (!ctx) {
    throw new Error(
      'useCanvasBriefing must be used within CanvasBriefingProvider',
    );
  }
  return ctx;
}
