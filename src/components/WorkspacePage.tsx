import React from "react";
import { Box, Heading, Text } from "@vibe/core";
import { useWorkspaceBoards } from "../context/WorkspaceBoardsContext";
import { MondayMulticolorMark } from "./ProductLogos";
import styles from "./WorkspacePage.module.scss";

export function WorkspacePage({ children }: { children: React.ReactNode }) {
  const { workspaceEntryMode } = useWorkspaceBoards();
  const showIntroBanner = workspaceEntryMode === "home";

  return (
    <Box className={styles.root}>
      {showIntroBanner && (
        <section
          className={styles.introBanner}
          aria-labelledby="workspace-intro-title"
        >
          <div className={styles.introCopy}>
            <Heading
              id="workspace-intro-title"
              type="h2"
              weight="bold"
              className={styles.introTitle}
            >
              This is your workspace
            </Heading>
            <Text
              type="text1"
              color="secondary"
              ellipsis={false}
              className={styles.introDescription}
            >
              It&apos;s where your team keeps all their work together — boards,
              docs, dashboards, and more, all in one place.
            </Text>
          </div>
          <div className={styles.introLogoWrap} aria-hidden="true">
            <MondayMulticolorMark />
          </div>
        </section>
      )}
      <div className={styles.workspaceContent}>{children}</div>
    </Box>
  );
}
