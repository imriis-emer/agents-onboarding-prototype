import React from "react";
import { useWorkspaceBoards } from "../context/WorkspaceBoardsContext";
import { WorkspaceHomePage } from "./WorkspaceHomePage";

export function WorkspaceRouter({ children }: { children: React.ReactNode }) {
  const { liveBoardReady, workspaceEntryMode } = useWorkspaceBoards();
  const showHome = liveBoardReady && workspaceEntryMode === "home";

  return (
    <>
      {showHome && <WorkspaceHomePage />}
      {!showHome && children}
    </>
  );
}
