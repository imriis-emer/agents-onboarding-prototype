import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  Avatar,
  Button,
  Icon,
  IconButton,
  Dropdown,
  Menu,
  MenuItem,
  Search,
  type DropdownOption,
  type AvatarProps,
} from "@vibe/core";
import {
  Apps,
  ActivityLog,
  Add,
  AgentsLogo,
  Board,
  DashboardTemplate,
  Doc,
  DropdownChevronDown,
  Edit,
  Favorite,
  Home,
  Info,
  Menu as MenuIcon,
  MondayVibeLogo,
  Search as SearchIcon,
  SidebarCollapsed,
  Widgets,
  WorkspaceHome,
} from "@mondaydotcomorg/icons";
import {
  DEFAULT_EXPANDED_FOLDERS,
  DEFAULT_SELECTED_NAV_ID,
  WORKSPACE_NAV_TREE,
  type NavItemIcon,
  type NavTreeNode,
} from "../data/workspaceNavTree";
import type { AgentsView } from "../context/AgentsViewContext";
import { useAgentsView } from "../context/AgentsViewContext";
import { useSidekickView } from "../context/SidekickViewContext";
// Deep import (not the package barrel) — the barrel pulls chat-client → trident-runtime
// (monolith-only) which breaks the Vite build. AgentAvatar only needs @vibe/core.
import AgentAvatar from "@mondaydotcomorg/monday-ui-components/dist/esm/monday-ui-components/src/components/AgentAvatar/AgentAvatar.js";
import type { RailItemId } from "./NavigationRail";
import { SIDEKICK_CHATS } from "../data/sidekickChats";
import { useAgentFlow } from "../context/AgentFlowContext";
import { useWorkspaceBoards } from "../context/WorkspaceBoardsContext";
import { GlassAgentTile, type GlassAgentTileVariant } from "./GlassAgentTile";
import styles from "./LeftPaneContent.module.scss";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyIcon = React.FC<any>;

const NAV_ITEM_ICONS: Record<NavItemIcon, AnyIcon> = {
  home: Home,
  board: Board,
  doc: Doc,
  apps: Board,
};

type WorkspaceOption = DropdownOption<{
  avatarText: string;
  customBackgroundColor?: string;
  backgroundColor?: NonNullable<AvatarProps["backgroundColor"]>;
}>;

const WORKSPACE_AVATAR = {
  avatarText: "O",
  customBackgroundColor: "#ff5ac4",
} as const;

type UtilityPanelId = Exclude<RailItemId, "workspace">;

interface InlinePanelIconProps {
  className?: string;
}

interface UtilityPanelRow {
  label: string;
  /** Leading icon for nav-button rows (Vibe Button leftIcon). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  leftIcon?: React.FC<any>;
  meta?: string;
  badge?: string;
  avatarText?: string;
  /** Circular profile image (e.g. agent photo). */
  image?: string;
  /** Tint behind agent portrait tiles (Glaze agent rows). */
  avatarBg?: string;
  /** When set, renders a coded glass agent tile instead of an image avatar. */
  glassVariant?: GlassAgentTileVariant;
  /** Show a green presence dot on the avatar. */
  online?: boolean;
  /** CSS gradient for the app-tile icon (Vibe apps). */
  iconGradient?: string;
  indicator?:
    | "conversation"
    | "prompt"
    | "agent"
    | "app"
    | "meeting"
    | "favorite"
    | "tool";
  trailing?: string;
  selected?: boolean;
  /** Agents panel nav — switches main content view when clicked. */
  navAction?: AgentsView;
  /** Sidekick chat list — opens the chat surface for this scenario when clicked. */
  chatId?: string;
}

interface UtilityPanelSection {
  title?: string;
  action?: string;
  rows: UtilityPanelRow[];
  /** Render rows as plain single-line items (no icon, meta, or border) — e.g. chat history. */
  simpleList?: boolean;
  /** Render rows as full-width tertiary buttons matching the panel's primary action. */
  navButtons?: boolean;
}

interface UtilityHero {
  eyebrow?: string;
  title: string;
  description: string;
  primaryAction?: string;
  chips?: string[];
  metrics?: UtilityHeroMetric[];
}

interface UtilityHeroMetric {
  label: string;
  value: string;
}

interface UtilityPanelState {
  title: string;
  menuLabel: string;
  primaryAction: string;
  primaryActionIcon?: "edit" | "plus";
  searchPlaceholder?: string;
  navSections: UtilityPanelSection[];
  hero?: UtilityHero;
  contentSections: UtilityPanelSection[];
  footerActions: string[];
}

const UTILITY_PANEL_STATES: Record<UtilityPanelId, UtilityPanelState> = {
  sidekick: {
    title: "Sidekick",
    menuLabel: "Sidekick menu",
    primaryAction: "New chat",
    primaryActionIcon: "edit",
    searchPlaceholder: "Search Sidekick history",
    navSections: [
      {
        title: "All chats",
        simpleList: true,
        rows: SIDEKICK_CHATS.map((chat) => ({
          label: chat.title,
          chatId: chat.id,
        })),
      },
    ],
    contentSections: [],
    footerActions: ["Get Sidekick on mobile", "Settings", "Give feedback"],
  },
  agents: {
    title: "Agents",
    menuLabel: "Agents menu",
    primaryAction: "New agent",
    navSections: [
      {
        navButtons: true,
        rows: [
          { label: "Manage agents", navAction: "manage", leftIcon: AgentsLogo },
          { label: "Feed", navAction: "feed", leftIcon: ActivityLog },
        ],
      },
    ],
    contentSections: [
      {
        title: "My agents",
        rows: [
          {
            label: "Elena",
            meta: "Response Triage & Cohort Router",
            glassVariant: 1,
            indicator: "agent",
          },
          {
            label: "Fiona",
            meta: "Response Triage & Cohort Router",
            glassVariant: 2,
            indicator: "agent",
          },
          {
            label: "Sarah",
            meta: "Sprint Intake Triage Lead",
            glassVariant: 3,
            indicator: "agent",
          },
          {
            label: "Brittany",
            meta: "Leave Status Agent",
            glassVariant: 4,
            online: true,
            indicator: "agent",
          },
        ],
      },
    ],
    footerActions: ["Skill hub", "Give us feedback"],
  },
  vibe: {
    title: "Vibe",
    menuLabel: "Vibe menu",
    primaryAction: "New Vibe app",
    navSections: [
      {
        navButtons: true,
        rows: [
          { label: "My apps", leftIcon: Favorite },
          { label: "Templates", leftIcon: Widgets },
        ],
      },
    ],
    contentSections: [
      {
        title: "Recent apps",
        rows: [
          {
            label: "Onboarding Progress",
            meta: "Published",
            iconGradient: "linear-gradient(135deg, #ffcb00 0%, #ff9a3d 100%)",
            indicator: "app",
          },
          {
            label: "Vibe Activity",
            meta: "Published",
            iconGradient: "linear-gradient(135deg, #ff9a3d 0%, #ff7b9c 100%)",
            indicator: "app",
          },
          {
            label: "Design System Feed",
            meta: "Draft",
            iconGradient: "linear-gradient(135deg, #ff8a5c 0%, #ff5fa8 100%)",
            indicator: "app",
          },
          {
            label: "Workshop Insights",
            meta: "Published",
            iconGradient: "linear-gradient(135deg, #ff6fa5 0%, #d65cff 100%)",
            indicator: "app",
          },
          {
            label: "Code Progress",
            meta: "Draft",
            iconGradient: "linear-gradient(135deg, #e85cff 0%, #b15cff 100%)",
            indicator: "app",
          },
        ],
      },
    ],
    footerActions: ["Give us feedback"],
  },
  workflows: {
    title: "Workflows",
    menuLabel: "Workflows menu",
    primaryAction: "New workflow",
    primaryActionIcon: "plus",
    navSections: [
      {
        navButtons: true,
        rows: [{ label: "All workflows", leftIcon: ActivityLog }],
      },
    ],
    contentSections: [
      {
        title: "Recent workflows",
        rows: [
          {
            label: "New Workflow",
            meta: "Draft",
            indicator: "tool",
          },
          {
            label: "Status changes",
            meta: "Runs when an item status changes",
            indicator: "tool",
          },
          {
            label: "[Partner] Time Reporting Workflow",
            meta: "Weekly reminder automation",
            indicator: "tool",
          },
          {
            label: "Board Force Migration",
            meta: "Moves board data between workspaces",
            indicator: "tool",
          },
          {
            label: "Time reporting - IO change",
            meta: "Updates reporting fields automatically",
            indicator: "tool",
          },
        ],
      },
    ],
    footerActions: ["Learn more", "Give us feedback"],
  },
  notetaker: {
    title: "AI Notetaker",
    menuLabel: "Notetaker menu",
    primaryAction: "Invite via URL",
    navSections: [],
    contentSections: [
      {
        title: "Upcoming",
        rows: [
          {
            label: "Lunch break",
            meta: "Now, today at 12:00 pm",
            badge: "Next",
            indicator: "meeting",
          },
          {
            label: "Weekly 1:1",
            meta: "Today at 2:00 pm",
            indicator: "meeting",
          },
          {
            label: "Team Weekly Sync",
            meta: "Today at 3:00 pm",
            indicator: "meeting",
          },
          {
            label: "Candidate Interview",
            meta: "Today at 4:00 pm",
            indicator: "meeting",
          },
        ],
      },
      {
        title: "Meeting summaries",
        rows: [
          {
            label: "Product Sync",
            meta: "Recorded · 36m 48s",
            indicator: "meeting",
          },
          {
            label: "Design Review",
            meta: "Recorded · 35m 40s",
            indicator: "meeting",
          },
          {
            label: "Engineering Sync",
            meta: "Recorded · 46m 20s",
            indicator: "meeting",
          },
        ],
      },
    ],
    footerActions: ["Learn more", "Give feedback", "Settings"],
  },
  favorites: {
    title: "Favorites",
    menuLabel: "Favorites menu",
    primaryAction: "Add favorite",
    navSections: [],
    contentSections: [
      {
        title: "Favorites",
        rows: [
          {
            label: "Design request form",
            meta: "Board",
            indicator: "favorite",
          },
          {
            label: "Component guidelines",
            meta: "Doc",
            indicator: "favorite",
          },
          {
            label: "Approval workflow",
            meta: "Board",
            indicator: "favorite",
          },
        ],
      },
    ],
    footerActions: ["Manage favorites"],
  },
  more: {
    title: "More",
    menuLabel: "More tools menu",
    primaryAction: "Browse tools",
    navSections: [],
    hero: {
      title: "More workspace tools",
      description:
        "Templates, dashboards, marketplace apps, imports, and admin tools.",
    },
    contentSections: [
      {
        title: "Common tools",
        rows: [
          {
            label: "Dashboards",
            meta: "Visualize workspace data",
            indicator: "tool",
          },
          {
            label: "Apps marketplace",
            meta: "Extend your workflow",
            badge: "Popular",
            indicator: "tool",
          },
          { label: "Trash", meta: "Restore deleted work", indicator: "tool" },
        ],
      },
    ],
    footerActions: ["Open marketplace"],
  },
};

const PANEL_TONE_CLASSES: Record<UtilityPanelId, string> = {
  sidekick: styles.panelToneSidekick,
  agents: styles.panelToneAgents,
  vibe: styles.panelToneVibe,
  workflows: styles.panelToneWorkflows,
  notetaker: styles.panelToneNotetaker,
  favorites: styles.panelToneFavorites,
  more: styles.panelToneMore,
};

const ROW_INDICATOR_CLASSES: Record<
  NonNullable<UtilityPanelRow["indicator"]>,
  string
> = {
  conversation: styles.productRowIconConversation,
  prompt: styles.productRowIconPrompt,
  agent: styles.productRowIconAgent,
  app: styles.productRowIconApp,
  meeting: styles.productRowIconMeeting,
  favorite: styles.productRowIconFavorite,
  tool: styles.productRowIconTool,
};

function workspaceOptionRow(option: WorkspaceOption) {
  return (
    <Flex align="center" gap="xs" className={styles.workspaceDropdownValue}>
      <Avatar
        className={styles.workspaceAvatar}
        size="xs"
        type="text"
        text={option.avatarText}
        square
        backgroundColor={option.backgroundColor}
        customBackgroundColor={option.customBackgroundColor}
        role="img"
        aria-label={option.label}
      />
      <Text
        type="text2"
        weight="normal"
        color="primary"
        className={styles.workspaceDropdownValueLabel}
      >
        {option.label}
      </Text>
    </Flex>
  );
}

function PanelBackground() {
  return (
    <div aria-hidden="true" className={styles.panelBg}>
      <div className={`${styles.panelBgLayer} ${styles.panelBgLayerBase}`} />
      <div className={`${styles.panelBgLayer} ${styles.panelBgLayerSheen}`} />
    </div>
  );
}

function PanelEllipsisIcon({ className }: InlinePanelIconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <circle cx="5.25" cy="10" r="1.15" />
      <circle cx="10" cy="10" r="1.15" />
      <circle cx="14.75" cy="10" r="1.15" />
    </svg>
  );
}

function PanelSearchIcon({ className }: InlinePanelIconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        d="M9.083 14.167a5.083 5.083 0 1 0 0-10.167 5.083 5.083 0 0 0 0 10.167Z"
        stroke="currentColor"
        strokeWidth="1.45"
      />
      <path
        d="m12.75 12.75 3.25 3.25"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PanelPlusIcon({ className }: InlinePanelIconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M10 2.25C10.4142 2.25 10.75 2.58579 10.75 3V9.25H17C17.4142 9.25 17.75 9.58579 17.75 10C17.75 10.4142 17.4142 10.75 17 10.75H10.75V17C10.75 17.4142 10.4142 17.75 10 17.75C9.58579 17.75 9.25 17.4142 9.25 17V10.75H3C2.58579 10.75 2.25 10.4142 2.25 10C2.25 9.58579 2.58579 9.25 3 9.25H9.25V3C9.25 2.58579 9.58579 2.25 10 2.25Z" />
    </svg>
  );
}

function PanelIconButton({
  label,
  children,
  onClick,
  className,
  testId,
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  testId?: string;
}) {
  return (
    <button
      type="button"
      className={`${styles.panelIconButton}${className ? ` ${className}` : ""}`}
      aria-label={label}
      data-testid={testId}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Chevron({
  isExpanded,
  variant = "section",
}: {
  isExpanded: boolean;
  variant?: "section" | "tree";
}) {
  if (variant === "tree") {
    return (
      <span
        aria-hidden="true"
        className={`${styles.chevron} ${styles.treeChevron}`}
      >
        <svg
          viewBox="0 0 16 16"
          width="16"
          height="16"
          fill="currentColor"
          focusable="false"
        >
          <path d={isExpanded ? "M4 6h8l-4 4-4-4Z" : "M6 4l4 4-4 4V4Z"} />
        </svg>
      </span>
    );
  }

  return (
    <span aria-hidden="true" className={styles.chevron}>
      <svg
        viewBox="0 0 20 20"
        width="12"
        height="12"
        fill="currentColor"
        focusable="false"
      >
        <path
          d={
            isExpanded
              ? "M9.442 12.76a.77.77 0 0 0 1.116 0l4.21-4.363a.84.84 0 0 0 0-1.157.77.77 0 0 0-1.116 0L10 11.025 6.348 7.24a.77.77 0 0 0-1.117 0 .84.84 0 0 0 0 1.157l4.21 4.363Z"
              : "M12.76 10.56a.77.77 0 0 0 0-1.116L8.397 5.233a.84.84 0 0 0-1.157 0 .77.77 0 0 0 0 1.116l3.785 3.653-3.785 3.652a.77.77 0 0 0 0 1.117.84.84 0 0 0 1.157 0l4.363-4.211Z"
          }
        />
      </svg>
    </span>
  );
}

function PanelHeader({
  title,
  menuLabel,
  onCloseNavigation,
}: {
  title: string;
  menuLabel: string;
  onCloseNavigation: () => void;
}) {
  return (
    <div className={styles.panelHeader}>
      <Text
        type="text2"
        weight="normal"
        color="secondary"
        className={styles.panelTitle}
      >
        {title}
      </Text>
      <Flex gap="xs" align="center" className={styles.panelHeaderActions}>
        <IconButton
          icon={MenuIcon}
          kind="tertiary"
          size="small"
          className={styles.panelHeaderIconButton}
          iconClassName={styles.panelIcon}
          aria-label={menuLabel}
          data-testid="menu-button_workspace-panel-menu"
        />
        <IconButton
          icon={SearchIcon}
          kind="tertiary"
          size="small"
          className={styles.panelHeaderIconButton}
          iconClassName={styles.panelIcon}
          aria-label="Search"
        />
        <IconButton
          icon={SidebarCollapsed}
          kind="tertiary"
          size="small"
          className={styles.panelHeaderIconButton}
          iconClassName={styles.panelIcon}
          aria-label="Close navigation"
          data-testid="collapse-leftpane-button-workspace"
          onClick={onCloseNavigation}
        />
      </Flex>
    </div>
  );
}

function WorkspacePanelContent({
  onCloseNavigation,
}: {
  onCloseNavigation: () => void;
}) {
  const { liveBoardReady } = useWorkspaceBoards();

  return (
    <div className={styles.workspacePanel}>
      <div className={styles.workspaceTopPart}>
        <PanelHeader
          title="Workspace"
          menuLabel="Workspace menu"
          onCloseNavigation={onCloseNavigation}
        />
        <WorkspaceSelector />
      </div>
      <div className={styles.workspaceMenuItems}>
        {!liveBoardReady && <WorkspaceAgentsSection />}
        <WorkspaceContentBoardsSection />
      </div>
    </div>
  );
}

function UtilityPanelContent({
  activePanel,
  onCloseNavigation,
}: {
  activePanel: UtilityPanelId;
  onCloseNavigation: () => void;
}) {
  const {
    view: agentsView,
    setView: setAgentsView,
    isFirstVisit,
  } = useAgentsView();
  const {
    view: sidekickView,
    chatTitle: sidekickChatTitle,
    openChat: openSidekickChat,
    goHome: goSidekickHome,
  } = useSidekickView();
  const state =
    activePanel === "agents" && isFirstVisit
      ? {
          ...UTILITY_PANEL_STATES.agents,
          contentSections: [{ title: "My agents", rows: [] }],
        }
      : UTILITY_PANEL_STATES[activePanel];
  const isSidekick = activePanel === "sidekick";

  return (
    <>
      <PanelHeader
        title={state.title}
        menuLabel={state.menuLabel}
        onCloseNavigation={onCloseNavigation}
      />
      <div
        className={`${styles.utilityPanelContent} ${styles.productPanelContent} ${PANEL_TONE_CLASSES[activePanel]}`}
      >
        {(() => {
          const [firstNav, ...restNav] = state.navSections;
          const inlineNav = firstNav?.navButtons ? firstNav : undefined;
          const otherNav = inlineNav ? restNav : state.navSections;
          return (
            <>
              <div className={styles.productNavList}>
                <Button
                  kind="tertiary"
                  color="primary"
                  size="small"
                  leftIcon={state.primaryActionIcon === "edit" ? Edit : Add}
                  className={styles.productPrimaryAction}
                  onClick={
                    activePanel === "agents"
                      ? () => setAgentsView("home")
                      : isSidekick
                        ? () => goSidekickHome()
                        : undefined
                  }
                >
                  {state.primaryAction}
                </Button>
                {inlineNav?.rows.map((row) => {
                  const isActive = row.navAction
                    ? agentsView === row.navAction
                    : !!row.selected;
                  return (
                    <Button
                      key={row.label}
                      kind="tertiary"
                      color="primary"
                      size="small"
                      active={isActive}
                      leftIcon={row.leftIcon}
                      className={styles.productPrimaryAction}
                      onClick={
                        row.navAction && activePanel === "agents"
                          ? () => setAgentsView(row.navAction!)
                          : undefined
                      }
                    >
                      {row.label}
                    </Button>
                  );
                })}
              </div>

              {state.searchPlaceholder && (
                <Search
                  size="small"
                  placeholder={state.searchPlaceholder}
                  aria-label={state.searchPlaceholder}
                  className={styles.productSearch}
                />
              )}

              {otherNav.map((section) => (
                <UtilityPanelSectionView
                  key={getUtilitySectionKey(section, "nav")}
                  section={section}
                  compact
                  onNavAction={
                    activePanel === "agents" ? setAgentsView : undefined
                  }
                  activeNavAction={
                    activePanel === "agents" ? agentsView : undefined
                  }
                  onChatOpen={isSidekick ? openSidekickChat : undefined}
                  activeChatTitle={
                    isSidekick && sidekickView === "chat"
                      ? sidekickChatTitle
                      : undefined
                  }
                />
              ))}
            </>
          );
        })()}

        {state.hero && <UtilityPanelHero hero={state.hero} />}

        {state.contentSections.map((section) => (
          <UtilityPanelSectionView
            key={getUtilitySectionKey(section, "content")}
            section={section}
          />
        ))}

        <div className={styles.productPanelFooter}>
          {state.footerActions.map((action) => (
            <button
              key={action}
              type="button"
              className={styles.productFooterAction}
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function getUtilitySectionKey(section: UtilityPanelSection, fallback: string) {
  return (
    section.title ??
    `${fallback}-${section.rows.map((row) => row.label).join("-")}`
  );
}

function UtilityPanelHero({ hero }: { hero: UtilityHero }) {
  return (
    <section className={styles.productHero}>
      {hero.eyebrow && (
        <Text
          element="span"
          type="text3"
          weight="medium"
          color="secondary"
          className={styles.productHeroEyebrow}
        >
          {hero.eyebrow}
        </Text>
      )}
      <Heading
        type="h3"
        weight="medium"
        color="primary"
        className={styles.productHeroTitle}
      >
        {hero.title}
      </Heading>
      <Text
        type="text3"
        color="secondary"
        maxLines={3}
        className={styles.productHeroDescription}
      >
        {hero.description}
      </Text>
      {hero.metrics && (
        <div className={styles.productHeroMetrics}>
          {hero.metrics.map((metric) => (
            <div key={metric.label} className={styles.productHeroMetric}>
              <Text
                element="span"
                type="text3"
                weight="medium"
                color="primary"
                className={styles.productHeroMetricValue}
              >
                {metric.value}
              </Text>
              <Text
                element="span"
                type="text3"
                color="secondary"
                className={styles.productHeroMetricLabel}
              >
                {metric.label}
              </Text>
            </div>
          ))}
        </div>
      )}
      {hero.primaryAction && (
        <Button
          kind="primary"
          size="small"
          className={styles.productHeroAction}
        >
          {hero.primaryAction}
        </Button>
      )}
      {hero.chips && (
        <div className={styles.productChips}>
          {hero.chips.map((chip) => (
            <Text
              key={chip}
              element="span"
              type="text3"
              color="secondary"
              className={styles.productChip}
            >
              {chip}
            </Text>
          ))}
        </div>
      )}
    </section>
  );
}

function UtilityPanelSectionView({
  section,
  compact = false,
  onNavAction,
  activeNavAction,
  onChatOpen,
  activeChatTitle,
}: {
  section: UtilityPanelSection;
  compact?: boolean;
  onNavAction?: (action: AgentsView) => void;
  activeNavAction?: AgentsView;
  onChatOpen?: (chatId: string, chatTitle: string) => void;
  activeChatTitle?: string;
}) {
  return (
    <section className={styles.productSection}>
      {(section.title || section.action) && (
        <div className={styles.productSectionHeader}>
          {section.title && (
            <Text
              element="span"
              type="text3"
              weight="medium"
              color="secondary"
              className={styles.productSectionTitle}
            >
              {section.title}
            </Text>
          )}
          {section.action && (
            <button type="button" className={styles.productSectionAction}>
              {section.action}
            </button>
          )}
        </div>
      )}
      {section.navButtons ? (
        <div className={styles.productNavList}>
          {section.rows.map((row) => {
            const isActive = row.navAction
              ? activeNavAction === row.navAction
              : !!row.selected;
            return (
              <Button
                key={row.label}
                kind="tertiary"
                color="primary"
                size="small"
                active={isActive}
                leftIcon={row.leftIcon}
                className={styles.productPrimaryAction}
                onClick={
                  row.navAction && onNavAction
                    ? () => onNavAction(row.navAction!)
                    : undefined
                }
              >
                {row.label}
              </Button>
            );
          })}
        </div>
      ) : section.simpleList ? (
        <Menu className={styles.productMenu}>
          {section.rows.map((row) => (
            <MenuItem
              key={row.label}
              title={row.label}
              selected={
                row.navAction
                  ? activeNavAction === row.navAction
                  : row.chatId && onChatOpen
                    ? activeChatTitle === row.label
                    : row.selected
              }
              onClick={
                row.navAction && onNavAction
                  ? () => onNavAction(row.navAction!)
                  : row.chatId && onChatOpen
                    ? () => onChatOpen(row.chatId!, row.label)
                    : undefined
              }
            />
          ))}
        </Menu>
      ) : (
        <div className={styles.productRows}>
          {section.rows.map((row) => (
            <UtilityPanelRowButton
              key={row.label}
              row={row}
              compact={compact}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function UtilityPanelRowButton({
  row,
  compact,
}: {
  row: UtilityPanelRow;
  compact: boolean;
}) {
  const indicator = row.indicator ?? "tool";

  return (
    <button
      type="button"
      className={`${styles.productRow}${row.indicator === "agent" ? ` ${styles.productRowAgent}` : ""}${compact ? ` ${styles.productRowCompact}` : ""}${row.selected ? ` ${styles.productRowSelected}` : ""}`}
    >
      {row.glassVariant ? (
        <span className={styles.productRowGlass}>
          <GlassAgentTile
            variant={row.glassVariant}
            size={40}
            ariaLabel={row.label}
          />
          {row.online && (
            <span className={styles.productRowOnline} aria-hidden="true" />
          )}
        </span>
      ) : row.image ? (
        <span
          className={styles.productRowAvatar}
          style={
            row.avatarBg
              ? ({ backgroundColor: row.avatarBg } as React.CSSProperties)
              : undefined
          }
        >
          <AgentAvatar size="small" src={row.image} aria-label={row.label} />
          {row.online && (
            <span className={styles.productRowOnline} aria-hidden="true" />
          )}
        </span>
      ) : row.iconGradient ? (
        <span
          className={styles.productRowAppIcon}
          style={{ background: row.iconGradient }}
          aria-hidden="true"
        >
          <Icon
            icon={MondayVibeLogo}
            size={20}
            className={styles.productRowAppGlyph}
          />
        </span>
      ) : row.avatarText ? (
        <span className={styles.productRowAvatar}>
          <Avatar
            size="small"
            type="text"
            text={row.avatarText}
            backgroundColor="dark_purple"
            aria-label={row.label}
          />
        </span>
      ) : (
        <span
          className={`${styles.productRowIcon} ${ROW_INDICATOR_CLASSES[indicator]}`}
          aria-hidden="true"
        >
          {getRowIndicatorLabel(indicator, row.label)}
        </span>
      )}
      <span className={styles.productRowText}>
        <Text
          element="span"
          type="text3"
          weight={compact ? "normal" : "medium"}
          color="primary"
          ellipsis
          className={styles.productRowLabel}
        >
          {row.label}
        </Text>
        {row.meta && (
          <Text
            element="span"
            type="text3"
            color="secondary"
            ellipsis
            className={styles.productRowMeta}
          >
            {row.meta}
          </Text>
        )}
      </span>
      {row.trailing && (
        <Text
          element="span"
          type="text3"
          color="secondary"
          className={styles.productRowTrailing}
        >
          {row.trailing}
        </Text>
      )}
      {row.badge && (
        <Text
          element="span"
          type="text3"
          weight="medium"
          color="primary"
          className={styles.productBadge}
        >
          {row.badge}
        </Text>
      )}
    </button>
  );
}

function getRowIndicatorLabel(
  indicator: NonNullable<UtilityPanelRow["indicator"]>,
  fallback: string,
) {
  const indicatorLabels: Record<
    NonNullable<UtilityPanelRow["indicator"]>,
    string
  > = {
    conversation: "S",
    prompt: "AI",
    agent: "A",
    app: "V",
    meeting: "N",
    favorite: "*",
    tool: fallback.charAt(0),
  };

  return indicatorLabels[indicator];
}

function WorkspaceSelector() {
  const flow = useAgentFlow();
  const { liveBoardReady, highlightedTarget } = useWorkspaceBoards();
  const workspaceOptions = useMemo(
    (): WorkspaceOption[] =>
      liveBoardReady
        ? [
            {
              value: "main-workspace",
              label: "Main workspace",
              avatarText: "M",
              customBackgroundColor: "#ffcb00",
            },
          ]
        : [
            {
              value: flow.id === "lia" ? "ohads-space" : "ohads-hiring",
              label: flow.workspaceLabel,
              ...WORKSPACE_AVATAR,
            },
          ],
    [flow.id, flow.workspaceLabel, liveBoardReady],
  );
  const [workspace, setWorkspace] = useState<WorkspaceOption>(
    workspaceOptions[0],
  );

  useEffect(() => {
    setWorkspace(workspaceOptions[0]);
  }, [workspaceOptions]);

  return (
    <div
      className={`${styles.workspaceCard} ${
        highlightedTarget === "workspace-selector" ? styles.tourHighlight : ""
      }`}
      data-tour-target="workspace-selector"
    >
      <Dropdown<WorkspaceOption>
        id="left-pane-workspace"
        className={styles.workspaceDropdownWrap}
        aria-label="Workspace"
        menuAriaLabel="Workspaces"
        size="small"
        clearable={false}
        searchable
        options={workspaceOptions}
        value={workspace}
        onChange={(option) => {
          if (option) setWorkspace(option);
        }}
        valueRenderer={(option) => workspaceOptionRow(option)}
        optionRenderer={(option) => workspaceOptionRow(option)}
      />
      <IconButton
        icon={Add}
        kind="secondary"
        size="medium"
        aria-label="Add item to workspace"
        className={styles.workspaceAddButtonVibe}
      />
    </div>
  );
}

function WorkspaceAgentsSection() {
  const flow = useAgentFlow();
  const { highlightedTarget } = useWorkspaceBoards();
  const [expanded, setExpanded] = useState(true);

  return (
    <section className={styles.agentsSection}>
      <div className={styles.agentsSectionHeader}>
        <button
          type="button"
          className={styles.agentsSectionToggle}
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
        >
          <span className={styles.sectionLabel}>My workspace agents</span>
          <Icon
            icon={DropdownChevronDown}
            size={12}
            className={styles.agentsSectionChevron}
          />
        </button>
        <IconButton
          icon={Info}
          kind="tertiary"
          size="xxs"
          aria-label="About workspace agents"
          className={styles.agentsSectionInfo}
        />
      </div>
      {expanded && (
        <div className={styles.agentList}>
          <button
            type="button"
            className={`${styles.agentListItem} ${
              highlightedTarget === "agent" ? styles.tourHighlight : ""
            }`}
            data-tour-target="agent"
          >
            <span className={styles.agentAvatar}>
              <img
                className={styles.agentAvatarImage}
                src={flow.assets.avatar}
                alt=""
                aria-hidden="true"
              />
            </span>
            <span className={styles.agentListText}>
              <span className={styles.agentListName}>{flow.agentName}</span>
              <span className={styles.agentListRole}>{flow.agentRole}</span>
            </span>
          </button>
        </div>
      )}
    </section>
  );
}

function WorkspaceHomeNavSection() {
  const { workspaceEntryMode, setWorkspaceEntryMode } = useWorkspaceBoards();
  const [expanded, setExpanded] = useState(true);

  return (
    <section className={styles.contentBoardsSection}>
      <button
        type="button"
        className={styles.contentBoardsHeader}
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <span className={styles.sectionLabel}>Content</span>
      </button>
      {expanded && (
        <div className={styles.contentBoardList}>
          <button
            type="button"
            className={`${styles.contentBoardItem} ${
              workspaceEntryMode === "home" ? styles.contentBoardItemActive : ""
            }`}
            onClick={() => setWorkspaceEntryMode("home")}
          >
            <Icon
              icon={WorkspaceHome}
              size={20}
              className={styles.contentBoardIcon}
            />
            <span className={styles.contentBoardLabel}>Manage workspace</span>
          </button>
          <button
            type="button"
            className={`${styles.contentBoardItem} ${
              workspaceEntryMode === "board"
                ? styles.contentBoardItemActive
                : ""
            }`}
            onClick={() => setWorkspaceEntryMode("board")}
          >
            <Icon icon={Board} size={20} className={styles.contentBoardIcon} />
            <span className={styles.contentBoardLabel}>My first project</span>
          </button>
          <button type="button" className={styles.contentBoardItem}>
            <Icon
              icon={DashboardTemplate}
              size={20}
              className={styles.contentBoardIcon}
            />
            <span className={styles.contentBoardLabel}>
              Dashboard and reporting
            </span>
          </button>
        </div>
      )}
    </section>
  );
}

function WorkspaceContentBoardsSection() {
  const {
    boards,
    highlightedTarget,
    boardHandoffActive,
    activateFocusBoard,
    liveBoardReady,
  } = useWorkspaceBoards();
  const flow = useAgentFlow();
  const [expanded, setExpanded] = useState(true);

  if (liveBoardReady) {
    return <WorkspaceHomeNavSection />;
  }

  if (boards.length === 0) return null;

  return (
    <section className={styles.contentBoardsSection}>
      <button
        type="button"
        className={`${styles.contentBoardsHeader} ${
          highlightedTarget === "content-section" ? styles.tourHighlight : ""
        }`}
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        data-tour-target="content-section"
      >
        <span className={styles.sectionLabel}>Content</span>
      </button>
      {expanded && (
        <div className={styles.contentBoardList}>
          {boards.map((board) => {
            const isFocusBoard = board === flow.boardLabels.focusBoard;
            const isHandoffTarget = isFocusBoard && boardHandoffActive;
            return (
              <button
                key={board}
                type="button"
                className={`${styles.contentBoardItem} ${
                  isFocusBoard && highlightedTarget === "focus-board"
                    ? styles.tourHighlight
                    : ""
                }`}
                data-tour-target={isFocusBoard ? "focus-board" : undefined}
                onClick={isHandoffTarget ? activateFocusBoard : undefined}
              >
                <Icon
                  icon={Board}
                  size={20}
                  className={styles.contentBoardIcon}
                />
                <span className={styles.contentBoardLabel}>{board}</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

function NavTreeItemRow({
  label,
  icon: ItemIcon,
  depth,
  selected,
  onSelect,
}: {
  label: string;
  icon: AnyIcon;
  depth: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.treeRow}${selected ? ` ${styles.treeRowSelected}` : ""}`}
      style={
        {
          "--tree-depth": depth,
          "--tree-indent": `calc(${depth} * (var(--space-20) + var(--space-2)))`,
        } as React.CSSProperties
      }
      onClick={onSelect}
      aria-current={selected ? "page" : undefined}
    >
      <Icon icon={ItemIcon} size={16} className={styles.treeRowIcon} />
      <span className={styles.treeRowLabel}>{label}</span>
    </button>
  );
}

function NavTreeNodes({
  nodes,
  depth,
  selectedItem,
  expandedFolders,
  onSelect,
  onToggleFolder,
}: {
  nodes: NavTreeNode[];
  depth: number;
  selectedItem: string;
  expandedFolders: Record<string, boolean>;
  onSelect: (id: string) => void;
  onToggleFolder: (folderId: string) => void;
}) {
  return (
    <>
      {nodes.map((node) => {
        if (node.type === "folder") {
          const isExpanded = !!expandedFolders[node.id];
          return (
            <div key={node.id} className={styles.folderGroup}>
              <button
                type="button"
                className={`${styles.treeRow} ${styles.treeRowFolder}`}
                style={
                  {
                    "--tree-depth": depth,
                    "--tree-indent": `calc(${depth} * (var(--space-20) + var(--space-2)))`,
                    "--folder-color": node.color,
                  } as React.CSSProperties
                }
                onClick={() => onToggleFolder(node.id)}
                aria-expanded={isExpanded}
                aria-label={`Toggle ${node.label} folder`}
              >
                <Chevron isExpanded={isExpanded} variant="tree" />
                <span className={styles.treeRowLabel}>{node.label}</span>
              </button>
              {isExpanded && node.children.length > 0 && (
                <NavTreeNodes
                  nodes={node.children}
                  depth={depth + 1}
                  selectedItem={selectedItem}
                  expandedFolders={expandedFolders}
                  onSelect={onSelect}
                  onToggleFolder={onToggleFolder}
                />
              )}
            </div>
          );
        }

        return (
          <NavTreeItemRow
            key={node.id}
            label={node.label}
            icon={NAV_ITEM_ICONS[node.icon]}
            depth={depth}
            selected={selectedItem === node.id}
            onSelect={() => onSelect(node.id)}
          />
        );
      })}
    </>
  );
}

function ContentSection({
  selectedItem,
  onSelect,
}: {
  selectedItem: string;
  onSelect: (id: string) => void;
}) {
  const [contentExpanded, setContentExpanded] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState(
    DEFAULT_EXPANDED_FOLDERS,
  );

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  }, []);

  return (
    <div className={styles.contentSection}>
      <button
        type="button"
        className={styles.sectionRow}
        onClick={() => setContentExpanded((prev) => !prev)}
        aria-expanded={contentExpanded}
        aria-label="Toggle Content"
      >
        <span className={styles.sectionLabelGroup}>
          <span className={styles.sectionLabel}>Content</span>
          <Chevron isExpanded={contentExpanded} />
        </span>
      </button>
      {contentExpanded && (
        <div className={styles.navTree} role="tree" aria-label="Workspace">
          <NavTreeNodes
            nodes={WORKSPACE_NAV_TREE}
            depth={0}
            selectedItem={selectedItem}
            expandedFolders={expandedFolders}
            onSelect={onSelect}
            onToggleFolder={toggleFolder}
          />
        </div>
      )}
    </div>
  );
}

export interface LeftPaneContentProps {
  activePanel: RailItemId;
  onCloseNavigation: () => void;
}

export default function LeftPaneContent({
  activePanel,
  onCloseNavigation,
}: LeftPaneContentProps) {
  return (
    <Flex
      direction="column"
      align="stretch"
      className={styles.root}
      data-name={`${activePanel} panel`}
      aria-label={
        activePanel === "workspace"
          ? "Workspace"
          : UTILITY_PANEL_STATES[activePanel].title
      }
    >
      <Box className={styles.panel}>
        <PanelBackground />
        <div className={styles.panelInner}>
          {activePanel === "workspace" ? (
            <WorkspacePanelContent onCloseNavigation={onCloseNavigation} />
          ) : (
            <UtilityPanelContent
              activePanel={activePanel}
              onCloseNavigation={onCloseNavigation}
            />
          )}
        </div>
      </Box>
    </Flex>
  );
}
