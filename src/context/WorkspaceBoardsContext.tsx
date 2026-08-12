import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type WorkspaceEntryMode = "home" | "board" | "conversation";

interface WorkspaceBoardsContextValue {
  boards: string[];
  setBoards: (boards: string[]) => void;
  clearBoards: () => void;
  highlightedTarget: string | null;
  setHighlightedTarget: (target: string | null) => void;
  /** When true, MainLayout forces the workspace side panel open. */
  panelForceOpen: boolean;
  setPanelForceOpen: (open: boolean) => void;
  /** When true, the user is viewing the live board stage (not the chat). */
  boardStageActive: boolean;
  setBoardStageActive: (active: boolean) => void;
  /** When true, the agent has created a live board the user can return to. */
  liveBoardReady: boolean;
  setLiveBoardReady: (ready: boolean) => void;
  /** Workspace nav shows the board; the return pill reopens onboarding chat. */
  workspaceEntryMode: WorkspaceEntryMode;
  setWorkspaceEntryMode: (mode: WorkspaceEntryMode) => void;
  resetWorkspaceSession: () => void;
  /** When true, the focus board in the sidebar is a clickable spotlight target. */
  boardHandoffActive: boolean;
  setBoardHandoffActive: (active: boolean) => void;
  /** Register the callback fired when the spotlighted focus board is clicked. */
  registerFocusBoardActivate: (handler: (() => void) | null) => void;
  /** Invoke the registered focus-board activation handler. */
  activateFocusBoard: () => void;
}

const WorkspaceBoardsContext = createContext<WorkspaceBoardsContextValue>({
  boards: [],
  setBoards: () => {},
  clearBoards: () => {},
  highlightedTarget: null,
  setHighlightedTarget: () => {},
  panelForceOpen: false,
  setPanelForceOpen: () => {},
  boardStageActive: false,
  setBoardStageActive: () => {},
  liveBoardReady: false,
  setLiveBoardReady: () => {},
  workspaceEntryMode: "conversation",
  setWorkspaceEntryMode: () => {},
  resetWorkspaceSession: () => {},
  boardHandoffActive: false,
  setBoardHandoffActive: () => {},
  registerFocusBoardActivate: () => {},
  activateFocusBoard: () => {},
});

export function WorkspaceBoardsProvider({ children }: { children: ReactNode }) {
  const [boards, setBoardsState] = useState<string[]>([]);
  const [highlightedTarget, setHighlightedTarget] = useState<string | null>(
    null,
  );
  const [panelForceOpen, setPanelForceOpen] = useState(false);
  const [boardStageActive, setBoardStageActive] = useState(false);
  const [liveBoardReady, setLiveBoardReady] = useState(false);
  const [workspaceEntryMode, setWorkspaceEntryModeState] =
    useState<WorkspaceEntryMode>("conversation");
  const [boardHandoffActive, setBoardHandoffActive] = useState(false);
  const focusBoardActivateRef = useRef<(() => void) | null>(null);

  const setWorkspaceEntryMode = useCallback((mode: WorkspaceEntryMode) => {
    setWorkspaceEntryModeState(mode);
  }, []);

  const resetWorkspaceSession = useCallback(() => {
    setBoardsState([]);
    setLiveBoardReady(false);
    setWorkspaceEntryModeState("conversation");
    setBoardStageActive(false);
    setBoardHandoffActive(false);
    setPanelForceOpen(false);
    setHighlightedTarget(null);
  }, []);

  const setBoards = useCallback((nextBoards: string[]) => {
    setBoardsState(nextBoards);
  }, []);

  const clearBoards = useCallback(() => {
    setBoardsState([]);
  }, []);

  const registerFocusBoardActivate = useCallback(
    (handler: (() => void) | null) => {
      focusBoardActivateRef.current = handler;
    },
    [],
  );

  const activateFocusBoard = useCallback(() => {
    focusBoardActivateRef.current?.();
  }, []);

  return (
    <WorkspaceBoardsContext.Provider
      value={{
        boards,
        setBoards,
        clearBoards,
        highlightedTarget,
        setHighlightedTarget,
        panelForceOpen,
        setPanelForceOpen,
        boardStageActive,
        setBoardStageActive,
        liveBoardReady,
        setLiveBoardReady,
        workspaceEntryMode,
        setWorkspaceEntryMode,
        resetWorkspaceSession,
        boardHandoffActive,
        setBoardHandoffActive,
        registerFocusBoardActivate,
        activateFocusBoard,
      }}
    >
      {children}
    </WorkspaceBoardsContext.Provider>
  );
}

export function useWorkspaceBoards() {
  return useContext(WorkspaceBoardsContext);
}
