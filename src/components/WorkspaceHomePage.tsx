import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  TabsContext,
  Text,
} from "@vibe/core";
import {
  AgentsLogo,
  Board,
  CustomerFeedback,
  DashboardTemplate,
  DropdownChevronDown,
  Info,
  Search as SearchIcon,
  TeamColored,
  WorkspaceHome,
} from "@mondaydotcomorg/icons";
import { MondayMulticolorMark } from "./ProductLogos";
import { useWorkspaceBoards } from "../context/WorkspaceBoardsContext";
import styles from "./WorkspaceHomePage.module.scss";

const ASSETS = [
  {
    id: "my-first-project",
    name: "My first project",
    icon: Board,
    creator: "MV",
    creatorColor: "#e2445c",
    created: "Jul 27, 2026",
    modified: "Jul 27, 2026",
    opensBoard: true,
  },
  {
    id: "dashboard-reporting",
    name: "Dashboard and reporting",
    icon: DashboardTemplate,
    creator: "MV",
    creatorColor: "#e2445c",
    created: "Jul 27, 2026",
    modified: "Jul 27, 2026",
    opensBoard: false,
  },
] as const;

const TABS: Array<{
  id: string;
  label: string;
  locked?: boolean;
}> = [
  { id: "recents", label: "Recents" },
  { id: "content", label: "Content" },
  { id: "collaborators", label: "Collaborators" },
  { id: "permissions", label: "Permissions", locked: true },
];

function WorkspaceAvatar({ size }: { size: "large" | "small" }) {
  return (
    <span
      className={
        size === "large"
          ? styles.workspaceAvatarLarge
          : styles.workspaceAvatarSmall
      }
      aria-hidden="true"
    >
      <span className={styles.workspaceAvatarLetter}>M</span>
      <span className={styles.workspaceAvatarBadge}>
        <Icon icon={WorkspaceHome} size={size === "large" ? 14 : 10} />
      </span>
    </span>
  );
}

export function WorkspaceHomePage() {
  const { setWorkspaceEntryMode } = useWorkspaceBoards();
  const [activeTab, setActiveTab] = useState(1);
  const [cleanupMode, setCleanupMode] = useState(false);

  const openBoard = () => {
    setWorkspaceEntryMode("board");
  };

  return (
    <Box className={styles.root}>
      <header className={styles.header}>
        <Flex align="start" gap="medium" className={styles.headerIdentity}>
          <WorkspaceAvatar size="large" />
          <div className={styles.headerCopy}>
            <Flex align="center" gap="xs" className={styles.titleRow}>
              <Heading type="h1" weight="bold" className={styles.title}>
                Main workspace
              </Heading>
              <Icon
                icon={DropdownChevronDown}
                size={20}
                className={styles.titleChevron}
              />
            </Flex>
            <button type="button" className={styles.descriptionLink}>
              Add workspace description
            </button>
          </div>
        </Flex>

        <Flex align="center" gap="small" className={styles.headerActions}>
          <Button
            kind="tertiary"
            size="small"
            leftIcon={CustomerFeedback}
            className={styles.headerActionButton}
          >
            Feedback
          </Button>
          <Button
            kind="tertiary"
            size="small"
            leftIcon={AgentsLogo}
            className={styles.headerActionButton}
          >
            Agents
          </Button>
          <Button
            kind="secondary"
            size="small"
            leftIcon={TeamColored}
            className={styles.membersButton}
          >
            Members
          </Button>
        </Flex>
      </header>

      <TabsContext activeTabId={activeTab}>
        <TabList
          activeTabId={activeTab}
          onTabChange={setActiveTab}
          aria-label="Workspace views"
          className={styles.tabList}
        >
          {TABS.map((tab, index) => (
            <Tab key={tab.id} value={index} disabled={tab.locked}>
              <Flex align="center" gap="xs">
                {tab.label}
                {tab.locked && (
                  <span className={styles.lockBadge} aria-hidden="true">
                    🔒
                  </span>
                )}
              </Flex>
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          {TABS.map((tab) => (
            <TabPanel key={tab.id}>
              {tab.id === "content" ? (
                <>
                  <Flex
                    align="center"
                    justify="space-between"
                    className={styles.toolbar}
                  >
                    <Flex align="center" gap="small">
                      <button type="button" className={styles.toolbarButton}>
                        <Icon icon={SearchIcon} size={16} />
                        Search
                      </button>
                      <button type="button" className={styles.toolbarButton}>
                        Filters
                      </button>
                    </Flex>

                    <Flex
                      align="center"
                      gap="small"
                      className={styles.cleanupWrap}
                    >
                      <label className={styles.cleanupLabel}>
                        <input
                          type="checkbox"
                          className={styles.cleanupToggle}
                          checked={cleanupMode}
                          onChange={(event) =>
                            setCleanupMode(event.target.checked)
                          }
                        />
                        <span
                          className={styles.cleanupTrack}
                          aria-hidden="true"
                        >
                          <span className={styles.cleanupThumb} />
                        </span>
                        <span className={styles.cleanupText}>Cleanup mode</span>
                      </label>
                      <Flex
                        align="center"
                        gap="xs"
                        className={styles.cleanupHint}
                      >
                        <MondayMulticolorMark />
                        <Text type="text2" color="secondary" ellipsis={false}>
                          No cleanup suggestions found
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>

                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Asset name</th>
                          <th>
                            <Flex align="center" gap="xs">
                              AI summary
                              <Icon icon={Info} size={14} />
                            </Flex>
                          </th>
                          <th>Creator</th>
                          <th>Creation date</th>
                          <th>Last modified</th>
                          <th>Folder</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ASSETS.map((asset) => (
                          <tr key={asset.id}>
                            <td>
                              <button
                                type="button"
                                className={styles.assetButton}
                                onClick={
                                  asset.opensBoard ? openBoard : undefined
                                }
                              >
                                <Icon
                                  icon={asset.icon}
                                  size={20}
                                  className={styles.assetIcon}
                                />
                                <span>{asset.name}</span>
                              </button>
                            </td>
                            <td>
                              <span
                                className={styles.aiSummaryBadge}
                                aria-label="Generate AI summary"
                              />
                            </td>
                            <td>
                              <Avatar
                                size="small"
                                type="text"
                                text={asset.creator}
                                aria-label={asset.creator}
                                customBackgroundColor={asset.creatorColor}
                              />
                            </td>
                            <td>{asset.created}</td>
                            <td>{asset.modified}</td>
                            <td />
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <Box className={styles.placeholderPanel}>
                  <Text type="text1" color="secondary">
                    {tab.label} view
                  </Text>
                </Box>
              )}
            </TabPanel>
          ))}
        </TabPanels>
      </TabsContext>

      <button type="button" className={styles.helpFab}>
        <MondayMulticolorMark />
        How can I help?
      </button>
    </Box>
  );
}
