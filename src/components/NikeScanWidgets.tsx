import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Button, Checkbox, Icon, IconButton, Toggle } from "@vibe/core";
import {
  Add,
  AddUpdate,
  Board,
  CreateItem,
  DropdownChevronDown,
  Email,
  EnterArrow,
  Filter,
  Group,
  Hide,
  Link,
  Check,
  Menu,
  OpenInTab,
  Person,
  Play,
  Search,
  Sort,
  Status,
  Versioning,
  Work,
  Workspace,
} from "@mondaydotcomorg/icons";
import { StepPlan } from "./StepPlan";
import {
  REFINED_CANDIDATE_ROWS,
  type AgentJobIcon,
  type BoardTableGroup,
} from "../data/nikeScanFlow";
import { ROLE_LINK_THINKING_STEPS } from "../data/roleLinkFlow";
import { useAgentFlow } from "../context/AgentFlowContext";
import { useWorkspaceBoards } from "../context/WorkspaceBoardsContext";
import {
  DEMO_AVATAR_1,
  DEMO_AVATAR_2,
  DEMO_AVATAR_3,
  DEMO_AVATAR_4,
  DEMO_AVATAR_5,
} from "../demo/demoPeople";
import styles from "./AgentsOnboardingView.module.scss";

const INVITE_AVATARS = [
  { src: DEMO_AVATAR_1, background: "#dce8ff" },
  { src: DEMO_AVATAR_2, background: "#fcddec" },
  { src: DEMO_AVATAR_3, background: "#d7f0e3" },
  { src: DEMO_AVATAR_4, background: "#d6ebff" },
  { src: DEMO_AVATAR_5, background: "#fff3b0" },
] as const;

type ThinkingStep = { id: string; label: string };

const PLAN_CARD_DELAY_MS = 450;
const PLAN_FIRST_STEP_DELAY_MS = 1000;
const PLAN_STEP_INTERVAL_MS = 1600;

export function PlanInActionThinking({
  steps,
  avatar,
}: {
  steps: readonly ThinkingStep[];
  avatar: string;
}) {
  const [showCard, setShowCard] = useState(false);
  const [visibleStepCount, setVisibleStepCount] = useState(0);

  useEffect(() => {
    const timers: number[] = [];

    timers.push(window.setTimeout(() => setShowCard(true), PLAN_CARD_DELAY_MS));

    steps.forEach((_, index) => {
      timers.push(
        window.setTimeout(
          () => setVisibleStepCount((count) => Math.max(count, index + 1)),
          PLAN_FIRST_STEP_DELAY_MS + index * PLAN_STEP_INTERVAL_MS,
        ),
      );
    });

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [steps]);

  return (
    <div className={styles.planThinkingBlock}>
      <div className={styles.planThinkingStatus}>
        <span className={styles.planThinkingAvatarWrap} aria-hidden="true">
          <img className={styles.planThinkingAvatar} src={avatar} alt="" />
        </span>
        <span className={styles.planThinkingLabel}>Thinking...</span>
      </div>

      {showCard && (
        <div className={styles.planCard}>
          <div className={styles.planCardHeader}>
            <span className={styles.planCardHeaderTitle}>
              Plan in action...
            </span>
            <Icon
              icon={DropdownChevronDown}
              size={16}
              className={styles.planCardChevronUp}
            />
          </div>
          {visibleStepCount > 0 && (
            <div className={styles.planCardSteps}>
              {steps.slice(0, visibleStepCount).map((step, index) => (
                <div
                  key={step.id}
                  className={styles.planStep}
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <Icon
                    icon={Check}
                    size={16}
                    className={styles.planStepCheck}
                  />
                  <span className={styles.planStepLabel}>{step.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function PlanInActionCard() {
  const flow = useAgentFlow();

  return (
    <StepPlan
      summary={flow.scanFlow.plan.summary}
      steps={flow.scanFlow.plan.steps}
    />
  );
}

type OpenRoleRow = {
  name: string;
  location: string;
  level: string;
};

type BoardAccent = "purple" | "blue";

function BoardArtifactHeader({ title }: { title: string }) {
  return (
    <div className={styles.boardArtifactHeader}>
      <div className={styles.boardArtifactTitleRow}>
        <Icon icon={Board} size={20} className={styles.boardArtifactIcon} />
        <span className={styles.boardArtifactTitle}>{title}</span>
      </div>
      <div className={styles.boardArtifactHeaderActions}>
        <button type="button" className={styles.boardArtifactPreview}>
          <span className={styles.boardArtifactPreviewIcon} aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M6 2.5C3.5 2.5 1.44 4.23 0.75 6.5c0.69 2.27 2.75 4 5.25 4s4.56-1.73 5.25-4C10.56 4.23 8.5 2.5 6 2.5Z"
                stroke="currentColor"
                strokeWidth="1.1"
              />
              <circle
                cx="6"
                cy="6.5"
                r="1.6"
                stroke="currentColor"
                strokeWidth="1.1"
              />
            </svg>
          </span>
          Preview
        </button>
        <button
          type="button"
          className={styles.boardArtifactExpand}
          aria-label="Expand board"
        >
          <Icon icon={OpenInTab} size={16} />
        </button>
      </div>
    </div>
  );
}

export function CandidatesThinkingCard() {
  const flow = useAgentFlow();
  return (
    <PlanInActionThinking
      steps={flow.scanFlow.contentSteps}
      avatar={flow.assets.avatar}
    />
  );
}

export function RoleLinkThinkingCard() {
  const flow = useAgentFlow();
  return (
    <PlanInActionThinking
      steps={ROLE_LINK_THINKING_STEPS}
      avatar={flow.assets.avatar}
    />
  );
}

type BoardArtifactColumn = {
  id: string;
  label: string;
  isPerson?: boolean;
};

function BoardArtifactTable({
  title,
  groupTitle,
  columns,
  rows,
  accent = "purple",
  artifact = false,
  getRowKey,
  getRowCheckboxId,
  getCellValue,
}: {
  title: string;
  groupTitle: string;
  columns: readonly BoardArtifactColumn[];
  rows: readonly Record<string, string>[];
  accent?: BoardAccent;
  artifact?: boolean;
  getRowKey: (row: Record<string, string>) => string;
  getRowCheckboxId: (row: Record<string, string>) => string;
  getCellValue: (row: Record<string, string>, columnId: string) => string;
}) {
  const accentClass =
    accent === "blue"
      ? styles.boardArtifactAccentBlue
      : styles.boardArtifactAccentPurple;
  const wideTable = columns.length > 4;

  return (
    <div
      className={`${styles.boardArtifact} ${accentClass} ${
        artifact ? styles.embeddedTableArtifact : ""
      }`}
    >
      <BoardArtifactHeader title={title} />

      <div className={styles.boardArtifactBody}>
        <button
          type="button"
          className={styles.boardGroupHeader}
          aria-expanded="true"
        >
          <Icon
            icon={DropdownChevronDown}
            size={16}
            className={styles.boardGroupChevron}
          />
          <span className={styles.boardGroupTitle}>{groupTitle}</span>
        </button>

        <div className={styles.boardTableScroll}>
          <div
            className={`${styles.boardTable} ${
              wideTable ? styles.boardTableWide : ""
            }`}
          >
            <div className={styles.boardTableHeaderRow}>
              <div className={styles.boardCellCheckboxHead}>
                <span className={styles.boardStripe} aria-hidden="true" />
              </div>
              {columns.map((column) => (
                <div
                  key={column.id}
                  className={
                    column.isPerson
                      ? styles.boardCellPersonHead
                      : column.id === "name"
                        ? styles.boardCellNameHead
                        : styles.boardCellDataHead
                  }
                >
                  {column.label}
                </div>
              ))}
            </div>

            {rows.map((row) => (
              <div key={getRowKey(row)} className={styles.boardTableRow}>
                <div className={styles.boardCellCheckbox}>
                  <span className={styles.boardStripe} aria-hidden="true" />
                  <Checkbox
                    id={getRowCheckboxId(row)}
                    separateLabel
                    checked={false}
                    aria-label={`Select ${getRowKey(row)}`}
                  />
                </div>
                {columns.map((column) => {
                  if (column.isPerson) {
                    return (
                      <div key={column.id} className={styles.boardCellPerson}>
                        <span className={styles.boardPersonAvatar}>
                          <Icon icon={Person} size={16} />
                        </span>
                      </div>
                    );
                  }

                  if (column.id === "name") {
                    return (
                      <div key={column.id} className={styles.boardCellName}>
                        <span className={styles.boardCellNameText}>
                          {getCellValue(row, column.id)}
                        </span>
                        <Icon
                          icon={AddUpdate}
                          size={20}
                          className={styles.boardCellUpdateIcon}
                        />
                      </div>
                    );
                  }

                  return (
                    <div key={column.id} className={styles.boardCellData}>
                      {getCellValue(row, column.id)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SimpleInlineTable({
  columns,
  rows,
  getRowKey,
  getCellValue,
  linkColumnId,
  getRowHref,
}: {
  columns: readonly BoardArtifactColumn[];
  rows: readonly Record<string, string>[];
  getRowKey: (row: Record<string, string>) => string;
  getCellValue: (row: Record<string, string>, columnId: string) => string;
  linkColumnId?: string;
  getRowHref?: (row: Record<string, string>, index: number) => string;
}) {
  const dataColumns = columns.filter((column) => !column.isPerson);

  return (
    <div className={styles.simpleTable}>
      <table className={styles.simpleTableEl}>
        <thead>
          <tr>
            {dataColumns.map((column) => (
              <th key={column.id} className={styles.simpleTableTh} scope="col">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={getRowKey(row)} className={styles.simpleTableTr}>
              {dataColumns.map((column) => {
                if (linkColumnId && column.id === linkColumnId) {
                  const href =
                    getRowHref?.(row, index) ?? "https://www.linkedin.com/";
                  return (
                    <td key={column.id} className={styles.simpleTableTd}>
                      <a
                        className={styles.simpleTableLink}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View profile
                        <Icon
                          icon={OpenInTab}
                          size={14}
                          className={styles.simpleTableLinkIcon}
                        />
                      </a>
                    </td>
                  );
                }

                return (
                  <td key={column.id} className={styles.simpleTableTd}>
                    {getCellValue(row, column.id)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const OPEN_ROLES_COLUMNS = [
  { id: "name", label: "Name" },
  { id: "person", label: "Person", isPerson: true },
  { id: "level", label: "Level" },
  { id: "location", label: "Location" },
] as const;

const CANDIDATES_COLUMNS = [
  { id: "name", label: "Name" },
  { id: "person", label: "Person", isPerson: true },
  { id: "location", label: "Location" },
  { id: "level", label: "Level" },
  { id: "role", label: "Current Role" },
] as const;

const LINKEDIN_COLUMN = { id: "linkedin", label: "LinkedIn" } as const;

const DEMO_LINKEDIN_URL = "https://www.linkedin.com/in/emilycarter132/";

function getLinkedInHref(_row: Record<string, string>, index: number) {
  return index === 0 ? DEMO_LINKEDIN_URL : "https://www.linkedin.com/";
}

export function OpenRolesTable({
  rows,
  artifact = false,
}: {
  rows?: readonly OpenRoleRow[];
  artifact?: boolean;
}) {
  const flow = useAgentFlow();
  const tableRows = (rows ?? flow.scanFlow.campaignRows).map((row) => ({
    name: row.name,
    level: row.level,
    location: row.location,
  }));

  if (artifact) {
    return (
      <SimpleInlineTable
        columns={[...OPEN_ROLES_COLUMNS, LINKEDIN_COLUMN]}
        rows={tableRows}
        getRowKey={(row) => row.name}
        getCellValue={(row, columnId) => row[columnId] ?? ""}
        linkColumnId={LINKEDIN_COLUMN.id}
        getRowHref={getLinkedInHref}
      />
    );
  }

  return (
    <BoardArtifactTable
      title={flow.boardLabels.openItemsBoard}
      groupTitle={flow.boardLabels.openItemsBoard}
      columns={OPEN_ROLES_COLUMNS}
      rows={tableRows}
      accent="purple"
      artifact={artifact}
      getRowKey={(row) => row.name}
      getRowCheckboxId={(row) =>
        `open-role-${row.name.replace(/\s+/g, "-").toLowerCase()}`
      }
      getCellValue={(row, columnId) => row[columnId] ?? ""}
    />
  );
}

export function CandidatesTable({
  artifact = false,
  groupTitle,
}: {
  artifact?: boolean;
  groupTitle?: string;
}) {
  const flow = useAgentFlow();
  const tableRows = flow.scanFlow.postRows.map((row) => ({
    name: row.name,
    location: row.location,
    level: row.level,
    role: row.role,
  }));

  if (artifact) {
    return (
      <SimpleInlineTable
        columns={[...CANDIDATES_COLUMNS, LINKEDIN_COLUMN]}
        rows={tableRows}
        getRowKey={(row) => row.name}
        getCellValue={(row, columnId) => row[columnId] ?? ""}
        linkColumnId={LINKEDIN_COLUMN.id}
        getRowHref={getLinkedInHref}
      />
    );
  }

  return (
    <BoardArtifactTable
      title={flow.boardLabels.resultsTitle}
      groupTitle={groupTitle ?? flow.boardLabels.resultsGroupTitle}
      columns={CANDIDATES_COLUMNS}
      rows={tableRows}
      accent="blue"
      artifact={artifact}
      getRowKey={(row) => row.name}
      getRowCheckboxId={(row) =>
        `candidate-${row.name.replace(/\s+/g, "-").toLowerCase()}`
      }
      getCellValue={(row, columnId) => row[columnId] ?? ""}
    />
  );
}

const REFINED_CANDIDATE_COLUMNS = [
  { id: "name", label: "Candidate" },
  { id: "company", label: "Current Company" },
  { id: "linkedin", label: "LinkedIn" },
] as const;

export function RefinedCandidatesTable() {
  const rows = REFINED_CANDIDATE_ROWS.map((row) => ({
    name: row.name,
    company: row.company,
  }));

  return (
    <SimpleInlineTable
      columns={REFINED_CANDIDATE_COLUMNS}
      rows={rows}
      getRowKey={(row) => row.name}
      getCellValue={(row, columnId) => row[columnId] ?? ""}
      linkColumnId="linkedin"
      getRowHref={(_row, index) =>
        REFINED_CANDIDATE_ROWS[index]?.linkedin ?? "https://www.linkedin.com/"
      }
    />
  );
}

const AGENT_JOB_ICONS = {
  createItem: CreateItem,
  versioning: Versioning,
  status: Status,
} as const;

export function AgentJobCard({
  icon,
  schedule,
  title,
  description,
  enabled,
  onEnabledChange,
  showRunNow = true,
  showMenu = true,
}: {
  icon: AgentJobIcon;
  schedule: string;
  title: string;
  description: string;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  showRunNow?: boolean;
  showMenu?: boolean;
}) {
  return (
    <div className={styles.agentJobCard}>
      <div className={styles.agentJobCardTopRow}>
        <div className={styles.agentJobCardTrigger}>
          <div className={styles.agentJobCardIconWrap}>
            <div className={styles.agentJobCardIconInner}>
              <Icon icon={AGENT_JOB_ICONS[icon]} size={20} />
            </div>
          </div>
          <p className={styles.agentJobCardSchedule}>{schedule}</p>
        </div>
        <div className={styles.agentJobCardActions}>
          <Toggle
            areLabelsHidden
            isSelected={enabled}
            onChange={onEnabledChange}
            aria-label={`Enable ${title}`}
            size="small"
          />
          {showMenu && (
            <IconButton
              icon={Menu}
              kind="tertiary"
              size="xs"
              aria-label={`${title} options`}
            />
          )}
        </div>
      </div>

      <div className={styles.agentJobCardBody}>
        <p className={styles.agentJobCardTitle}>{title}</p>
        <p className={styles.agentJobCardDescription}>{description}</p>
      </div>

      {showRunNow && (
        <div className={styles.agentJobCardFooter}>
          <button type="button" className={styles.agentJobCardRunButton}>
            <Icon icon={Play} size={16} />
            Run now
          </button>
        </div>
      )}
    </div>
  );
}

export function DailyTriggerCard() {
  const flow = useAgentFlow();
  const job = flow.scanFlow.dailyTriggerJob;

  return (
    <div className={styles.dailyTriggerArtifact}>
      <button
        type="button"
        className={styles.dailyTriggerThoughtHeader}
        aria-expanded="true"
      >
        <span className={styles.dailyTriggerThoughtLabel}>Thought process</span>
        <Icon
          icon={DropdownChevronDown}
          size={16}
          className={styles.dailyTriggerThoughtChevron}
        />
      </button>

      <p className={styles.dailyTriggerSummary}>
        Great! Added <strong>{job.name}</strong> to your Jobs — runs every
        morning at 8:00.
      </p>

      <div className={styles.jobSetupCard}>
        <div className={styles.jobSetupCardTagRow}>
          <span className={styles.jobSetupCardTagIcon}>
            <Icon icon={Work} size={14} />
          </span>
          <span className={styles.jobSetupCardTag}>My job</span>
        </div>
        <p className={styles.jobSetupCardTitle}>{job.title}</p>
        <p className={styles.jobSetupCardDescription}>{job.description}</p>

        <div className={styles.jobSetupCardBoardRow}>
          <div className={styles.jobSetupCardBoardInfo}>
            <span className={styles.jobSetupCardBoardIcon}>
              <Icon icon={Board} size={20} />
            </span>
            <div className={styles.jobSetupCardBoardText}>
              <p className={styles.jobSetupCardBoardName}>
                {flow.boardLabels.mainBoard}
              </p>
              <span className={styles.jobSetupCardBoardWorkspace}>
                <Icon icon={Workspace} size={12} />
                {job.workspaceName}
              </span>
            </div>
          </div>
          <Button kind="tertiary" size="xs" rightIcon={DropdownChevronDown}>
            Full access
          </Button>
        </div>
      </div>

      <p className={styles.jobSetupReadyText}>
        Ready to run now, or I'll start tomorrow at 08:00
      </p>

      <div className={styles.jobSetupActions}>
        <Button kind="primary" color="fixed-dark" size="small" leftIcon={Play}>
          Run now
        </Button>
        <Button kind="secondary" size="small" leftIcon={EnterArrow}>
          Start tomorrow
        </Button>
      </div>
    </div>
  );
}

export function JobsTriggersList() {
  const flow = useAgentFlow();
  const [enabledById, setEnabledById] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      flow.scanFlow.agentJobs.map((job) => [job.id, job.enabled]),
    ),
  );

  return (
    <div className={styles.jobsList}>
      {flow.scanFlow.agentJobs.map((job) => (
        <AgentJobCard
          key={job.id}
          icon={job.icon}
          schedule={job.schedule}
          title={job.title}
          description={job.description}
          enabled={enabledById[job.id] ?? job.enabled}
          onEnabledChange={(enabled) =>
            setEnabledById((prev) => ({ ...prev, [job.id]: enabled }))
          }
        />
      ))}
    </div>
  );
}

function BoardTableGroupView({ group }: { group: BoardTableGroup }) {
  const { highlightedTarget, enteringBoardRowNames } = useWorkspaceBoards();
  const personTourActive = highlightedTarget === "board-person-column";

  return (
    <section className={styles.boardGroup}>
      <button
        type="button"
        className={styles.boardGroupTitleButton}
        style={{ color: group.color }}
      >
        <Icon
          icon={DropdownChevronDown}
          size={16}
          className={styles.boardGroupChevron}
        />
        <span>{group.title}</span>
      </button>

      <div
        className={`${styles.boardGrid}${
          group.variant === "pipeline" ? ` ${styles.boardGridPipeline}` : ""
        }`}
      >
        <div className={styles.boardGridHeader}>
          <div className={styles.boardCellCheckboxHead}>
            <span
              className={styles.boardStripe}
              style={{ backgroundColor: group.color }}
            />
          </div>
          <div className={styles.boardCellHead}>
            {group.variant === "pipeline" ? "Candidate" : "Item"}
          </div>
          {group.variant === "pipeline" ? (
            <div className={styles.boardCellHead}>Current Stage</div>
          ) : null}
          <div className={styles.boardCellHead}>
            {group.variant === "pipeline" ? "Assigned" : "Person"}
          </div>
          {group.variant === "pipeline" ? null : (
            <div className={styles.boardCellHead}>Status</div>
          )}
          {group.variant === "pipeline" ? null : (
            <div className={styles.boardCellHead}>Location</div>
          )}
          {group.lastColumnLabel ? (
            <div className={styles.boardCellHead}>{group.lastColumnLabel}</div>
          ) : (
            <div className={styles.boardCellHead} aria-hidden="true" />
          )}
        </div>

        {group.rows.map((row, index) => (
          <div
            key={row.name}
            className={`${styles.boardGridRow}${
              enteringBoardRowNames.includes(row.name)
                ? ` ${styles.boardGridRowEnter}`
                : ""
            }`}
          >
            <div className={styles.boardCellCheckbox}>
              <span
                className={styles.boardStripe}
                style={{ backgroundColor: group.color }}
              />
              <span
                className={styles.embeddedTableCheckbox}
                aria-hidden="true"
              />
            </div>
            <div className={styles.boardCellItem}>
              <span className={styles.boardCellItemName}>
                {row.starred ? <span aria-hidden="true">⭐ </span> : null}
                {row.name}
              </span>
              <Icon
                icon={AddUpdate}
                size={24}
                className={styles.boardCellItemAction}
              />
            </div>
            {group.variant === "pipeline" ? (
              <div className={styles.boardCellStatus}>
                <span
                  className={styles.boardStatusPill}
                  style={{ backgroundColor: row.stageColor ?? "#ecedf5" }}
                >
                  {row.stage}
                </span>
              </div>
            ) : null}
            <div
              className={`${styles.boardCellPerson} ${
                row.personActive ? styles.boardCellPersonActive : ""
              } ${
                personTourActive
                  ? index === 0
                    ? styles.boardColumnTourHighlight
                    : styles.boardColumnTourTint
                  : ""
              }`}
              data-tour-target={index === 0 ? "board-person-column" : undefined}
            >
              <span className={styles.boardPersonAvatar} aria-hidden="true">
                <Icon icon={Person} size={16} />
              </span>
            </div>
            {group.variant === "pipeline" ? null : (
              <div className={styles.boardCellStatus}>
                <span className={styles.boardStatusPill} aria-hidden="true" />
              </div>
            )}
            {group.variant === "pipeline" ? null : (
              <div className={styles.boardCellText}>{row.location}</div>
            )}
            <div className={styles.boardCellText}>
              {row.email ?? row.company ?? row.timeline}
            </div>
          </div>
        ))}

        <div className={styles.boardGridRowAdd}>
          <div className={styles.boardCellCheckbox}>
            <span
              className={styles.boardStripe}
              style={{ backgroundColor: group.color }}
            />
          </div>
          <button type="button" className={styles.boardAddItemButton}>
            <Icon icon={Add} size={16} />
            Add item
          </button>
        </div>
      </div>
    </section>
  );
}

function BoardChromeShell({
  boardTitle,
  children,
}: {
  boardTitle: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.boardChrome} data-tour-target="live-board">
      <div className={styles.boardChromeTitleRow}>
        <button type="button" className={styles.boardChromeTitle}>
          <span>{boardTitle}</span>
          <Icon icon={DropdownChevronDown} size={16} />
        </button>
      </div>

      <div className={styles.boardChromeTabs}>
        <button
          type="button"
          className={styles.boardChromeTab}
          data-active="true"
        >
          Main table
        </button>
        <button
          type="button"
          className={styles.boardChromeTabIcon}
          aria-label="View options"
        >
          <Icon icon={Menu} size={16} />
        </button>
        <button
          type="button"
          className={styles.boardChromeTabIcon}
          aria-label="Add view"
        >
          <Icon icon={Add} size={16} />
        </button>
      </div>

      <div className={styles.boardChromeToolbar}>
        <div className={styles.boardNewItemButton}>
          <button type="button" className={styles.boardNewItemPrimary}>
            New item
          </button>
          <button
            type="button"
            className={styles.boardNewItemChevron}
            aria-label="New item options"
          >
            <Icon icon={DropdownChevronDown} size={16} />
          </button>
        </div>
        <button type="button" className={styles.boardChromeToolButton}>
          <Icon icon={Search} size={16} />
          Search
        </button>
        <button type="button" className={styles.boardChromeToolButton}>
          <Icon icon={Person} size={16} />
          Person
        </button>
        <button type="button" className={styles.boardChromeToolButton}>
          <Icon icon={Filter} size={16} />
          Filter
          <Icon icon={DropdownChevronDown} size={16} />
        </button>
        <button type="button" className={styles.boardChromeToolButton}>
          <Icon icon={Sort} size={16} />
          Sort
        </button>
        <button type="button" className={styles.boardChromeToolButton}>
          <Icon icon={Hide} size={16} />
          Hide
        </button>
        <button type="button" className={styles.boardChromeToolButton}>
          <Icon icon={Group} size={16} />
          Group by
        </button>
        <button
          type="button"
          className={styles.boardChromeToolIcon}
          aria-label="More board tools"
        >
          <Icon icon={Menu} size={16} />
        </button>
      </div>

      <div className={styles.boardChromeTableWrap}>{children}</div>
    </div>
  );
}

export function CandidatesBoardView() {
  const flow = useAgentFlow();
  const { appendedBoardRows } = useWorkspaceBoards();
  const groups = useMemo(
    () =>
      flow.scanFlow.boardTableGroups.map((group, index) =>
        index === 0 && appendedBoardRows.length > 0
          ? { ...group, rows: [...appendedBoardRows, ...group.rows] }
          : group,
      ),
    [appendedBoardRows, flow.scanFlow.boardTableGroups],
  );

  return (
    <BoardChromeShell boardTitle={flow.boardLabels.mainBoard}>
      {groups.map((group) => (
        <BoardTableGroupView key={group.id} group={group} />
      ))}
    </BoardChromeShell>
  );
}

export function InviteMembersCard() {
  return (
    <div className={styles.inviteCard}>
      <div className={styles.inviteAvatarStack} aria-hidden="true">
        {INVITE_AVATARS.map((avatar) => (
          <span
            key={avatar.src}
            className={styles.inviteAvatar}
            style={{ backgroundColor: avatar.background }}
          >
            <img src={avatar.src} alt="" />
          </span>
        ))}
      </div>

      <p className={styles.inviteTitle}>Share your workspace with your team</p>

      <div className={styles.inviteActions}>
        <button type="button" className={styles.inviteButton}>
          <Icon icon={Email} size={16} />
          Invite by email
        </button>
        <button type="button" className={styles.inviteButton}>
          <Icon icon={Link} size={16} />
          Copy invite link
        </button>
      </div>
    </div>
  );
}
