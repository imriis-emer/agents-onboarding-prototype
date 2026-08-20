import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AgentsView = "home" | "manage" | "feed";

interface AgentsViewContextValue {
  view: AgentsView;
  setView: (view: AgentsView) => void;
  /** First-time agents landing: empty composer and no existing agents in the pane. */
  isFirstVisit: boolean;
}

const AgentsViewContext = createContext<AgentsViewContextValue | null>(null);

export function AgentsViewProvider({
  children,
  initialView = "home",
  onViewChange,
  isFirstVisit = false,
}: {
  children: ReactNode;
  initialView?: AgentsView;
  onViewChange?: (view: AgentsView) => void;
  isFirstVisit?: boolean;
}) {
  const [view, setViewState] = useState<AgentsView>(initialView);

  const setView = useCallback(
    (next: AgentsView) => {
      setViewState(next);
      onViewChange?.(next);
    },
    [onViewChange],
  );

  const value = useMemo(
    () => ({ view, setView, isFirstVisit }),
    [view, setView, isFirstVisit],
  );

  return (
    <AgentsViewContext.Provider value={value}>
      {children}
    </AgentsViewContext.Provider>
  );
}

export function useAgentsView(): AgentsViewContextValue {
  const context = useContext(AgentsViewContext);
  if (!context) {
    throw new Error("useAgentsView must be used within AgentsViewProvider");
  }
  return context;
}
