import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { Button, Icon, TextField } from "@vibe/core";
import {
  Add,
  Attach,
  CloseSmall,
  Doc,
  DropdownChevronDown,
  Edit,
  Globe,
  Info,
  MoveArrowUp,
  SidebarCollapsed,
  Board,
} from "@mondaydotcomorg/icons";
import gptModelIcon from "../assets/agents-onboarding/gpt-model.png";
import mondayLoaderGif from "../assets/recruiting-onboarding/monday-loader.gif";
import toolGmail from "../assets/tools/gmail.png";
import toolSlack from "../assets/tools/slack.png";
import toolGoogleCalendar from "../assets/tools/google-calendar.png";
import { MondayMulticolorMark } from "./ProductLogos";
import { ResponseStream, useTextStream } from "./ResponseStream";
import {
  ROLE_LINK_MESSAGES,
  ROLE_LINK_OPEN_ROLES_ROWS,
  ROLE_LINK_ROLE_NAME,
  ROLE_LINK_SCRIPT,
  ROLE_LINK_USER_MESSAGE,
} from "../data/roleLinkFlow";
import {
  buildRoleSearchScript,
  findMatchingOpenRole,
  ROLE_SEARCH_USER_MESSAGE,
  TEAMMATE_1_PLACEHOLDER,
  TEAMMATE_2_PLACEHOLDER,
  TEAM_INVITE_SKIP_LABEL,
  TOUR_BUTTON_LABEL,
  TOUR_SKIP_LABEL,
  TOUR_TOOLTIPS,
  CANDIDATE_FEEDBACK_MESSAGE,
  CANDIDATE_FEEDBACK_OPTIONS,
  CANDIDATE_FEEDBACK_POSITIVE,
  type BoardTourStep,
} from "../data/nikeScanFlow";
import {
  LIA_BRAND_VOICE_SKIP,
  LIA_DRAFT_MESSAGES,
  LIA_POST_SAVE_OPTIONS,
  LIA_POST_SUGGESTION_OPTIONS,
  LIA_TOPIC_OPTIONS,
  LIA_TOPIC_TITLE,
  LIA_TOPIC_UNSURE_MESSAGE,
  LIA_TOUR_TOOLTIPS,
} from "../data/liaSocialFlow";
import {
  BrandVoiceCard,
  LiaBrandResearchCard,
  LiaChipCard,
  LiaDraftingCard,
  LinkedInPostCard,
  PostSaveActionsCard,
} from "./LiaSocialWidgets";
import { useAgentFlow } from "../context/AgentFlowContext";
import { useWorkspaceBoards } from "../context/WorkspaceBoardsContext";
import {
  CandidatesBoardView,
  CandidatesTable,
  CandidatesThinkingCard,
  RefinedCandidatesTable,
  RoleLinkThinkingCard,
  DailyTriggerCard,
  InviteMembersCard,
  JobsTriggersList,
  OpenRolesTable,
  PlanInActionCard,
} from "./NikeScanWidgets";
import {
  ENTRY_PROTOTYPE_STEP_COUNT,
  getPrototypeStepState,
} from "../data/agentsOnboardingPrototypeSteps";
import type { AgentFlowScriptMessage } from "../data/agentFlows";
import styles from "./AgentsOnboardingView.module.scss";

/** Stable fallback — `?? []` would allocate every render and reset the convo. */
const EMPTY_BOARD_CHAT_INTRO_MESSAGES: readonly AgentFlowScriptMessage[] = [];

type MessageVariant = "paragraph" | "heading" | "list-item";

interface ScriptMessage {
  id: string;
  text: string;
  variant?: MessageVariant;
  listIndex?: number;
  paragraphActions?: Record<number, string>;
  paragraphIllustrations?: Record<number, string>;
  paragraphBoardChips?: Record<number, string>;
}

type HiringFlow = "nike-scan" | "role-link" | "role-search" | "lia-draft";

type FlowScriptMessage = {
  id: string;
  text: string;
  paragraphActions?: Record<number, string>;
  paragraphIllustrations?: Record<number, string>;
  paragraphBoardChips?: Record<number, string>;
};

const HERO_SKELETON_MIN_MS = 900;
const HERO_INTRO_DELAY_AFTER_REVEAL_MS = 700;
const HERO_EXIT_DURATION_MS = 420;
const TYPING_MIN_MS = 400;
const TYPING_MAX_MS = 800;
const PAUSE_MIN_MS = 450;
const PAUSE_MAX_MS = 750;
// Board handoff: a brief lazy-load skeleton (like production board loads), then
// Jade's side chat slides in a beat later so the transition feels natural.
const BOARD_LOAD_MS = 1300;
const BOARD_CHAT_REVEAL_DELAY_MS = 1400;
const LIA_BOARD_CHAT_REVEAL_MIN_MS = 2000;
const LIA_BOARD_CHAT_REVEAL_MAX_MS = 3000;
// Real research/search/setup actions (scanning a career page, sourcing
// candidates, configuring automations) should feel like Jade is actually
// doing the work, not resolving instantly.
const SEARCH_ACTION_MIN_MS = 2800;
const SEARCH_ACTION_MAX_MS = 4000;
const THINKING_ACTION_MIN_MS = 6500;
const THINKING_ACTION_MAX_MS = 8500;
const AUTOMATION_SETUP_MIN_MS = 2500;
const AUTOMATION_SETUP_MAX_MS = 3800;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

const CANDIDATE_FEEDBACK_SCRIPT_MESSAGE: ScriptMessage = {
  id: "candidate-feedback-ask",
  text: CANDIDATE_FEEDBACK_MESSAGE,
};

function createBoardSaveScriptMessage(text: string): ScriptMessage {
  return {
    id: "board-save-offer",
    text,
  };
}

function isBeforeOpenRolesTableMessage(
  messageId: string,
  flow: HiringFlow | null,
): boolean {
  return flow === "nike-scan" && messageId === "n1";
}

function isBetweenOpenRolesAndCandidatesMessage(
  messageId: string,
  flow: HiringFlow | null,
): boolean {
  if (flow === "nike-scan") {
    return messageId === "n2" || messageId === "n3" || messageId === "n4";
  }
  if (flow === "role-link") {
    return false;
  }
  return false;
}

function isAfterCandidatesTableMessage(
  messageId: string,
  flow: HiringFlow | null,
): boolean {
  if (flow === "nike-scan") {
    // n5 (candidates-done line) now renders above the table, so only n6 follows it.
    return messageId === "n6";
  }
  if (flow === "role-link") {
    return messageId === "l5" || messageId === "l6";
  }
  if (flow === "role-search") {
    // rq4 (candidates-done line) now renders above the table, so only rq5 follows it.
    return messageId === "rq5";
  }
  return false;
}

const NIKE_AFTER_DAILY_TRIGGER_IDS = [
  "n7",
  "n8",
  "n9",
  "n10",
  "n11",
  "n12",
  "n13",
];
const ROLE_LINK_AFTER_DAILY_TRIGGER_IDS = [
  "l7",
  "l8",
  "l9",
  "l10",
  "l11",
  "l12",
  "l13",
];
const ROLE_SEARCH_AFTER_DAILY_TRIGGER_IDS = [
  "rq6",
  "rq7",
  "rq8",
  "rq9",
  "rq10",
  "rq11",
  "rq12",
];

const LIA_AFTER_DAILY_TRIGGER_IDS = [
  "l8",
  "l9",
  "l10",
  "l11",
  "l12",
  "l13",
  "l14",
];

function isAfterDailyTriggerMessage(
  messageId: string,
  flow: HiringFlow | null,
): boolean {
  if (flow === "nike-scan") {
    return NIKE_AFTER_DAILY_TRIGGER_IDS.includes(messageId);
  }
  if (flow === "role-link") {
    return ROLE_LINK_AFTER_DAILY_TRIGGER_IDS.includes(messageId);
  }
  if (flow === "role-search") {
    return ROLE_SEARCH_AFTER_DAILY_TRIGGER_IDS.includes(messageId);
  }
  if (flow === "lia-draft") {
    return LIA_AFTER_DAILY_TRIGGER_IDS.includes(messageId);
  }
  return false;
}

function lastMessageBeforeDailyTrigger(flow: HiringFlow | null): string | null {
  if (flow === "nike-scan") return "n6";
  if (flow === "role-link") return "l6";
  if (flow === "role-search") return "rq5";
  if (flow === "lia-draft") return "l7";
  return null;
}

const TOUR_STEP_MESSAGE_IDS: Record<HiringFlow, [string, string, string]> = {
  "nike-scan": ["n10", "n11", "n12"],
  "role-link": ["l10", "l11", "l12"],
  "role-search": ["rq9", "rq10", "rq11"],
  "lia-draft": ["l11", "l12", "l13"],
};

function getTourMessageId(
  flow: HiringFlow | null,
  step: 0 | 1 | 2,
): string | null {
  if (!flow) return null;
  return TOUR_STEP_MESSAGE_IDS[flow][step];
}

function splitScanMessagesForArtifacts(
  messages: ScriptMessage[],
  flow: HiringFlow | null,
  showOpenRolesTable: boolean,
  showCandidatesTable: boolean,
) {
  if (flow === "role-link") {
    return {
      beforeOpenRolesTable: messages.filter(
        (message) =>
          message.id === "l1" ||
          message.id === "l2" ||
          message.id === "l3" ||
          message.id === "l4",
      ),
      betweenOpenRolesAndCandidates: [] as ScriptMessage[],
      roleLinkCandidatesDone: messages.filter((message) => message.id === "l5"),
      afterCandidatesTable: showCandidatesTable
        ? messages.filter((message) => message.id === "l6")
        : [],
      afterDailyTrigger: showCandidatesTable
        ? messages.filter((message) =>
            isAfterDailyTriggerMessage(message.id, flow),
          )
        : [],
    };
  }

  if (flow === "role-search") {
    return {
      beforeOpenRolesTable: messages.filter(
        (message) =>
          message.id === "rq1" || message.id === "rq2" || message.id === "rq3",
      ),
      betweenOpenRolesAndCandidates: [] as ScriptMessage[],
      roleLinkCandidatesDone: messages.filter(
        (message) => message.id === "rq4",
      ),
      afterCandidatesTable: showCandidatesTable
        ? messages.filter((message) => message.id === "rq5")
        : [],
      afterDailyTrigger: showCandidatesTable
        ? messages.filter((message) =>
            isAfterDailyTriggerMessage(message.id, flow),
          )
        : [],
    };
  }

  if (flow === "lia-draft") {
    return {
      beforeOpenRolesTable: [] as ScriptMessage[],
      betweenOpenRolesAndCandidates: [] as ScriptMessage[],
      roleLinkCandidatesDone: [] as ScriptMessage[],
      afterCandidatesTable: showCandidatesTable
        ? messages.filter((message) => message.id === "l7")
        : [],
      afterDailyTrigger: showCandidatesTable
        ? messages.filter((message) =>
            isAfterDailyTriggerMessage(message.id, flow),
          )
        : [],
    };
  }

  if (!showOpenRolesTable || !flow) {
    return {
      beforeOpenRolesTable: messages,
      betweenOpenRolesAndCandidates: [] as ScriptMessage[],
      roleLinkCandidatesDone: [] as ScriptMessage[],
      afterCandidatesTable: [] as ScriptMessage[],
      afterDailyTrigger: [] as ScriptMessage[],
    };
  }

  return {
    beforeOpenRolesTable: messages.filter((message) =>
      isBeforeOpenRolesTableMessage(message.id, flow),
    ),
    betweenOpenRolesAndCandidates: messages.filter((message) =>
      isBetweenOpenRolesAndCandidatesMessage(message.id, flow),
    ),
    roleLinkCandidatesDone:
      flow === "nike-scan"
        ? messages.filter((message) => message.id === "n5")
        : ([] as ScriptMessage[]),
    afterCandidatesTable: showCandidatesTable
      ? messages.filter((message) =>
          isAfterCandidatesTableMessage(message.id, flow),
        )
      : [],
    afterDailyTrigger: showCandidatesTable
      ? messages.filter((message) =>
          isAfterDailyTriggerMessage(message.id, flow),
        )
      : [],
  };
}

function getLiaDraftStreamingMessageId(
  scanActive: ScriptMessage | null,
  scanPendingMessageId: string | null,
): string | null {
  return scanActive?.id ?? scanPendingMessageId;
}

function isLiaDraftStreamingTurn(
  streamingMessageId: string | null,
  messageId: string,
  scanTyping: boolean,
  scanActive: ScriptMessage | null,
): boolean {
  return (
    streamingMessageId === messageId && (scanTyping || scanActive !== null)
  );
}

function isScanTurnBeforeOpenRolesTable(
  flow: HiringFlow | null,
  showOpenRolesTable: boolean,
  showCandidatesThinking: boolean,
  showCandidatesTable: boolean,
  scanActive: ScriptMessage | null,
  scanTyping: boolean,
) {
  if (!flow) return false;
  if (flow === "lia-draft") {
    return false;
  }
  if (flow === "role-link" || flow === "role-search") {
    if (showCandidatesThinking || showCandidatesTable) return false;
    return scanTyping || scanActive !== null;
  }
  if (showOpenRolesTable) return false;
  return scanTyping || scanActive !== null;
}

function isScanTurnAfterCandidatesTable(
  flow: HiringFlow | null,
  showCandidatesTable: boolean,
  scanCompleted: ScriptMessage[],
  scanActive: ScriptMessage | null,
  scanTyping: boolean,
) {
  if (!flow || !showCandidatesTable) return false;
  if (flow === "lia-draft") {
    if (scanActive) return scanActive.id === "l7";
    return (
      scanTyping &&
      scanCompleted.some((message) => message.id === "l6") &&
      !scanCompleted.some((message) => message.id === "l7")
    );
  }
  if (flow === "role-link") {
    if (scanActive) return scanActive.id === "l6";
    return (
      scanTyping &&
      scanCompleted.some((message) => message.id === "l5") &&
      !scanCompleted.some((message) => message.id === "l6")
    );
  }
  if (flow === "nike-scan") {
    // n5 now renders above the table; n6 is the message that follows it.
    if (scanActive) return scanActive.id === "n6";
    return (
      scanTyping &&
      scanCompleted.some((message) => message.id === "n5") &&
      !scanCompleted.some((message) => message.id === "n6")
    );
  }
  if (flow === "role-search") {
    // rq4 now renders above the table; rq5 is the message that follows it.
    if (scanActive) return scanActive.id === "rq5";
    return (
      scanTyping &&
      scanCompleted.some((message) => message.id === "rq4") &&
      !scanCompleted.some((message) => message.id === "rq5")
    );
  }
  if (scanActive) return isAfterCandidatesTableMessage(scanActive.id, flow);
  const lastBeforeDailyTrigger = lastMessageBeforeDailyTrigger(flow);
  return (
    scanTyping &&
    (!lastBeforeDailyTrigger ||
      !scanCompleted.some((message) => message.id === lastBeforeDailyTrigger))
  );
}

function isScanTurnAfterDailyTrigger(
  flow: HiringFlow | null,
  showCandidatesTable: boolean,
  scanCompleted: ScriptMessage[],
  scanActive: ScriptMessage | null,
  scanTyping: boolean,
) {
  if (!flow || !showCandidatesTable) return false;
  if (flow === "lia-draft") {
    if (scanActive) return LIA_AFTER_DAILY_TRIGGER_IDS.includes(scanActive.id);
    return scanTyping && scanCompleted.some((message) => message.id === "l7");
  }
  if (flow === "role-link") {
    if (scanActive)
      return ROLE_LINK_AFTER_DAILY_TRIGGER_IDS.includes(scanActive.id);
    return scanTyping && scanCompleted.some((message) => message.id === "l6");
  }
  if (scanActive) return isAfterDailyTriggerMessage(scanActive.id, flow);
  const lastBeforeDailyTrigger = lastMessageBeforeDailyTrigger(flow);
  return (
    scanTyping &&
    !!lastBeforeDailyTrigger &&
    scanCompleted.some((message) => message.id === lastBeforeDailyTrigger)
  );
}

function isScanTurnRoleLinkCandidatesDone(
  flow: HiringFlow | null,
  showCandidatesTable: boolean,
  scanCompleted: ScriptMessage[],
  scanActive: ScriptMessage | null,
  scanTyping: boolean,
) {
  if (!showCandidatesTable) return false;
  const candidatesDoneId =
    flow === "role-link"
      ? "l5"
      : flow === "nike-scan"
        ? "n5"
        : flow === "role-search"
          ? "rq4"
          : null;
  if (!candidatesDoneId) return false;
  if (scanActive?.id === candidatesDoneId) return true;
  return (
    scanTyping &&
    !scanActive &&
    !scanCompleted.some((message) => message.id === candidatesDoneId)
  );
}

function isScanTurnBetweenOpenRolesAndCandidates(
  flow: HiringFlow | null,
  showOpenRolesTable: boolean,
  showCandidatesTable: boolean,
  showCandidatesThinking: boolean,
  scanCompleted: ScriptMessage[],
  scanActive: ScriptMessage | null,
  scanTyping: boolean,
) {
  if (flow === "role-link") return false;
  if (!flow || !showOpenRolesTable) return false;
  // The "between" phase ends once the candidates thinking/table appear; after
  // that the candidates-done and after-table turns own any typing indicator.
  if (showCandidatesThinking || showCandidatesTable) return false;
  if (
    isScanTurnAfterCandidatesTable(
      flow,
      showCandidatesTable,
      scanCompleted,
      scanActive,
      scanTyping,
    )
  ) {
    return false;
  }
  if (scanActive) {
    return isBetweenOpenRolesAndCandidatesMessage(scanActive.id, flow);
  }
  return scanTyping;
}

function HeroMedia({ onIntroReady }: { onIntroReady: () => void }) {
  const flow = useAgentFlow();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoSrc = flow.assets.videoSrc ?? "";
  const posterSrc = flow.assets.heroIntro;
  const [isMuted, setIsMuted] = useState(true);
  const [mediaReady, setMediaReady] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [useImageFallback, setUseImageFallback] = useState(!videoSrc);
  const introReadyRef = useRef(false);

  useEffect(() => {
    setMediaReady(false);
    setShowSkeleton(true);
    setIsMuted(true);
    setUseImageFallback(!videoSrc);
    introReadyRef.current = false;
  }, [posterSrc, videoSrc]);

  useEffect(() => {
    if (!mediaReady) return;

    const hideSkeletonTimer = window.setTimeout(() => {
      setShowSkeleton(false);
    }, HERO_SKELETON_MIN_MS);

    const introTimer = window.setTimeout(() => {
      if (introReadyRef.current) return;
      introReadyRef.current = true;
      onIntroReady();
    }, HERO_SKELETON_MIN_MS + HERO_INTRO_DELAY_AFTER_REVEAL_MS);

    return () => {
      window.clearTimeout(hideSkeletonTimer);
      window.clearTimeout(introTimer);
    };
  }, [mediaReady, onIntroReady]);

  const handleVideoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node;
      if (!node || !videoSrc || useImageFallback) return;

      node.muted = true;

      const markReady = () => {
        setMediaReady(true);
        void node.play().catch(() => undefined);
      };

      node.onloadeddata = markReady;
      node.onerror = () => setUseImageFallback(true);

      if (node.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        markReady();
      }
    },
    [useImageFallback, videoSrc],
  );

  const replayWithSound = useCallback(() => {
    if (useImageFallback) return;

    setIsMuted(false);
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    // Restart from the beginning so every click plays the full clip with audio.
    video.currentTime = 0;
    void video.play().catch(() => undefined);
  }, [useImageFallback]);

  return (
    <div
      className={styles.heroImageWrap}
      onClick={replayWithSound}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          replayWithSound();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${flow.agentName} introduction video. Click to replay with sound.`}
    >
      {showSkeleton ? (
        <div className={styles.heroSkeleton} aria-hidden="true">
          <span className={styles.heroSkeletonShimmer} />
        </div>
      ) : null}
      {useImageFallback ? (
        <img
          className={`${styles.heroImage} ${styles.heroImageFull} ${styles.heroImageVisible}`}
          src={posterSrc}
          alt=""
          onLoad={() => setMediaReady(true)}
        />
      ) : (
        <video
          ref={handleVideoRef}
          key={videoSrc}
          className={`${styles.heroVideo} ${styles.heroImageFull} ${styles.heroImageVisible}`}
          src={videoSrc}
          poster={posterSrc}
          muted={isMuted}
          playsInline
          preload="auto"
        />
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div
      className={styles.typing}
      aria-live="polite"
      aria-label="Jade is typing"
    >
      <span className={styles.typingDots}>
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
      </span>
    </div>
  );
}

function splitMessageParagraphs(text: string): string[] {
  const paragraphs = text
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
  return paragraphs.length > 0 ? paragraphs : [text];
}

function isParagraphFullyStreamed(
  fullText: string,
  displayedText: string,
  paragraphIndex: number,
): boolean {
  const fullParagraphs = splitMessageParagraphs(fullText);
  const displayedParagraphs = splitMessageParagraphs(displayedText);
  return displayedParagraphs[paragraphIndex] === fullParagraphs[paragraphIndex];
}

function InlineBoardChip({ label }: { label: string }) {
  return (
    <span className={styles.inlineBoardChip}>
      <Icon icon={Board} size={12} className={styles.inlineBoardChipIcon} />
      {label}
    </span>
  );
}

function formatAgentParagraph(
  message: ScriptMessage,
  paragraph: string,
  paragraphIndex: number,
  showFormatted: boolean,
) {
  if (!showFormatted) return paragraph;

  if (
    message.paragraphIllustrations?.[paragraphIndex] &&
    paragraph.includes("Agents tab")
  ) {
    return (
      <>
        You&apos;ll always find me under the <strong>Agents tab.</strong>
      </>
    );
  }

  const boardChipLabel = message.paragraphBoardChips?.[paragraphIndex];
  if (boardChipLabel) {
    return (
      <>
        This is your <InlineBoardChip label={boardChipLabel} /> — where our work
        lives.
      </>
    );
  }

  if (paragraph.includes("These are your boards")) {
    return (
      <>
        These are your <strong>boards</strong> — the place where you, your team,
        and I do the work together. I can read boards, write to boards, and
        update boards as I go.
      </>
    );
  }

  return paragraph;
}

function ParagraphContent({
  paragraph,
  paragraphIndex,
  message,
  showAction = true,
  showFormatted = false,
}: {
  paragraph: string;
  paragraphIndex: number;
  message: ScriptMessage;
  showAction?: boolean;
  showFormatted?: boolean;
}) {
  const actionLabel = message.paragraphActions?.[paragraphIndex];

  return (
    <>
      {formatAgentParagraph(message, paragraph, paragraphIndex, showFormatted)}
      {actionLabel && showAction ? (
        <>
          {" "}
          <button type="button" className={styles.inlineMessageAction}>
            <span aria-hidden="true">→</span> {actionLabel}
          </button>
        </>
      ) : null}
    </>
  );
}

function MessageParagraphBlock({
  paragraph,
  paragraphIndex,
  message,
  showExtras = true,
}: {
  paragraph: string;
  paragraphIndex: number;
  message: ScriptMessage;
  showExtras?: boolean;
}) {
  const illustrationSrc = message.paragraphIllustrations?.[paragraphIndex];

  if (illustrationSrc && showExtras) {
    return (
      <p className={styles.blockParagraph}>
        <ParagraphContent
          paragraph={paragraph}
          paragraphIndex={paragraphIndex}
          message={message}
          showAction={showExtras}
          showFormatted={showExtras}
        />{" "}
        <img
          className={styles.inlineParagraphIllustration}
          src={illustrationSrc}
          alt=""
          aria-hidden="true"
        />
      </p>
    );
  }

  return (
    <p className={styles.blockParagraph}>
      <ParagraphContent
        paragraph={paragraph}
        paragraphIndex={paragraphIndex}
        message={message}
        showAction={showExtras}
        showFormatted={showExtras}
      />
    </p>
  );
}

function StreamingParagraphMessage({
  message,
  streamProps,
  onStreamComplete,
}: {
  message: ScriptMessage;
  streamProps: {
    mode: "fade";
    speed: number;
    fadeDuration: number;
    segmentDelay: number;
  };
  onStreamComplete?: () => void;
}) {
  const { displayedText } = useTextStream({
    textStream: message.text,
    onComplete: onStreamComplete,
    ...streamProps,
  });

  return (
    <div className={styles.messageParagraphGroup}>
      {splitMessageParagraphs(displayedText).map((paragraph, index) => (
        <MessageParagraphBlock
          key={index}
          paragraph={paragraph}
          paragraphIndex={index}
          message={message}
          showExtras={isParagraphFullyStreamed(
            message.text,
            displayedText,
            index,
          )}
        />
      ))}
    </div>
  );
}

function ConversationBlock({
  message,
  streaming,
  onStreamComplete,
}: {
  message: ScriptMessage;
  streaming?: boolean;
  onStreamComplete?: () => void;
}) {
  const variant = message.variant ?? "paragraph";
  const streamProps = {
    mode: "fade" as const,
    speed: 88,
    fadeDuration: 180,
    segmentDelay: 5,
    onComplete: onStreamComplete,
  };

  if (variant === "heading") {
    return (
      <p className={styles.blockHeading}>
        {streaming ? (
          <ResponseStream
            textStream={message.text}
            {...streamProps}
            as="strong"
            className={styles.blockHeadingText}
          />
        ) : (
          <strong className={styles.blockHeadingText}>{message.text}</strong>
        )}
      </p>
    );
  }

  if (variant === "list-item") {
    return (
      <p className={styles.blockListItem}>
        <span className={styles.listIndex}>{message.listIndex}.</span>
        {streaming ? (
          <ResponseStream
            textStream={message.text}
            {...streamProps}
            as="span"
          />
        ) : (
          message.text
        )}
      </p>
    );
  }

  const paragraphs = splitMessageParagraphs(message.text);

  if (streaming) {
    return (
      <StreamingParagraphMessage
        message={message}
        streamProps={streamProps}
        onStreamComplete={onStreamComplete}
      />
    );
  }

  if (paragraphs.length === 1) {
    return (
      <MessageParagraphBlock
        paragraph={message.text}
        paragraphIndex={0}
        message={message}
      />
    );
  }

  return (
    <div className={styles.messageParagraphGroup}>
      {paragraphs.map((paragraph, index) => (
        <MessageParagraphBlock
          key={index}
          paragraph={paragraph}
          paragraphIndex={index}
          message={message}
        />
      ))}
    </div>
  );
}

function UserMessage({ text }: { text: string }) {
  return (
    <div className={styles.userMessage}>
      <div className={styles.userBubble}>
        <p className={styles.userBubbleText}>{text}</p>
      </div>
    </div>
  );
}

function UserLinkMessage({ url }: { url: string }) {
  return <UserMessage text={url} />;
}

function PromptComposer({
  composerRef,
  placeholder,
  message,
  hasMessage,
  onMessageChange,
  onKeyDown,
  onSend,
  ariaLabel,
}: {
  composerRef: RefObject<HTMLTextAreaElement>;
  placeholder: string;
  message: string;
  hasMessage: boolean;
  onMessageChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  ariaLabel: string;
}) {
  return (
    <div className={styles.composer}>
      <div className={styles.composerRow}>
        <div className={styles.actionGroup}>
          <button type="button" className={styles.iconButton} aria-label="Add">
            <Icon icon={Add} size={16} />
          </button>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Attach"
          >
            <Icon icon={Attach} size={16} />
          </button>
        </div>
        <textarea
          ref={composerRef}
          className={styles.composerInput}
          aria-label={ariaLabel}
          placeholder={placeholder}
          rows={1}
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
          onKeyDown={onKeyDown}
        />
        <button
          type="button"
          className={styles.sendButton}
          data-active={hasMessage}
          disabled={!hasMessage}
          aria-label="Send message"
          onClick={onSend}
        >
          <Icon icon={MoveArrowUp} size={16} />
        </button>
      </div>
    </div>
  );
}

function JadeChatPanel({
  messagesRef,
  chatContentRef,
  scrollEndRef,
  composerRef,
  message,
  hasMessage,
  awaitingRoleLink = false,
  awaitingRoleQuery = false,
  className,
  onMessageChange,
  onKeyDown,
  onSend,
  children,
}: {
  messagesRef: RefObject<HTMLDivElement>;
  chatContentRef: RefObject<HTMLDivElement>;
  scrollEndRef: RefObject<HTMLDivElement>;
  composerRef: RefObject<HTMLTextAreaElement>;
  message: string;
  hasMessage: boolean;
  awaitingRoleLink?: boolean;
  awaitingRoleQuery?: boolean;
  className?: string;
  onMessageChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  children: ReactNode;
}) {
  const flow = useAgentFlow();

  return (
    <aside
      className={[styles.jadeChatPanel, className].filter(Boolean).join(" ")}
      aria-label={`Chat with ${flow.agentName}`}
    >
      <div className={styles.jadeChatHeader}>
        <div className={styles.jadeChatHeaderLeft}>
          <span className={styles.jadeChatHeaderAvatar}>
            <img
              className={styles.jadeChatHeaderAvatarImage}
              src={flow.assets.avatar}
              alt=""
              aria-hidden="true"
            />
          </span>
          <button type="button" className={styles.jadeChatHeaderName}>
            {flow.agentName}
            <Icon icon={DropdownChevronDown} size={16} />
          </button>
        </div>
        <div className={styles.jadeChatHeaderActions}>
          <button
            type="button"
            className={styles.jadeChatHeaderIconButton}
            aria-label="New chat"
          >
            <Icon icon={Edit} size={16} />
          </button>
          <button
            type="button"
            className={styles.jadeChatHeaderIconButton}
            aria-label="Panel layout"
          >
            <Icon icon={SidebarCollapsed} size={16} />
          </button>
          <button
            type="button"
            className={styles.jadeChatHeaderIconButton}
            aria-label="Close chat"
          >
            <Icon icon={CloseSmall} size={16} />
          </button>
        </div>
      </div>

      <div ref={messagesRef} className={styles.jadeChatMessages}>
        <div ref={chatContentRef} className={styles.boardChatConversation}>
          {children}
        </div>
        <div
          ref={scrollEndRef}
          className={styles.scrollAnchor}
          aria-hidden="true"
        />
      </div>

      <div className={styles.jadeChatComposer}>
        <PromptComposer
          composerRef={composerRef}
          placeholder={
            awaitingRoleLink
              ? flow.boardLabels.composerRoleLinkPlaceholder
              : awaitingRoleQuery
                ? flow.boardLabels.composerRoleSearchPlaceholder
                : flow.boardLabels.composerPlaceholder
          }
          message={message}
          hasMessage={hasMessage}
          onMessageChange={onMessageChange}
          onKeyDown={onKeyDown}
          onSend={onSend}
          ariaLabel={`Message ${flow.agentName}`}
        />
      </div>
    </aside>
  );
}

function isCustomActionOption(label: string) {
  return /your own words|something else|describe it/i.test(label);
}

function ActionCard({
  title,
  options,
  onSelect,
  onClose,
  customFieldDefaultValue,
}: {
  title?: string;
  options: readonly string[];
  onSelect: (option: string) => void;
  onClose?: () => void;
  customFieldDefaultValue?: string;
}) {
  const lastOption = options[options.length - 1] ?? "";
  const hasCustomOption = isCustomActionOption(lastOption);
  const selectableOptions = hasCustomOption ? options.slice(0, -1) : options;
  const customPlaceholder = hasCustomOption ? lastOption : undefined;
  const [customValue, setCustomValue] = useState("");

  const submitCustomValue = () => {
    const value = customValue.trim();
    if (!value) return;
    onSelect(value);
  };

  const handleCustomFieldFocus = () => {
    if (customFieldDefaultValue && !customValue.trim()) {
      setCustomValue(customFieldDefaultValue);
    }
  };

  return (
    <div className={styles.actionCard}>
      <div className={styles.actionCardHeader}>
        {title ? <p className={styles.actionCardTitle}>{title}</p> : null}
        {onClose ? (
          <button
            type="button"
            className={styles.actionCardClose}
            aria-label="Close"
            onClick={onClose}
          >
            <Icon icon={CloseSmall} size={16} />
          </button>
        ) : null}
      </div>
      <div className={styles.actionCardOptions}>
        {selectableOptions.map((label, index) => (
          <button
            key={label}
            type="button"
            className={styles.actionOption}
            onClick={() => onSelect(label)}
          >
            <span className={styles.actionOptionIndex}>{index + 1}</span>
            <span className={styles.actionOptionLabel}>{label}</span>
          </button>
        ))}
        {customPlaceholder ? (
          <div className={styles.actionCustomRow}>
            <span className={styles.actionOptionIndex}>
              {selectableOptions.length + 1}
            </span>
            <TextField
              className={styles.actionCustomField}
              placeholder={customPlaceholder}
              value={customValue}
              onChange={setCustomValue}
              onFocus={handleCustomFieldFocus}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  submitCustomValue();
                }
              }}
              size="medium"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TeamInviteCard({
  onSubmit,
  onSkip,
}: {
  onSubmit: (teammate1: string, teammate2: string) => void;
  onSkip: () => void;
}) {
  const [teammate1, setTeammate1] = useState("");
  const [teammate2, setTeammate2] = useState("");
  const canSubmit = teammate1.trim().length > 0 || teammate2.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    onSubmit(teammate1, teammate2);
  };

  const handleKeyDown = (event: React.KeyboardEvent<Element>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className={styles.actionCard}>
      <div className={styles.teamInviteFields}>
        <TextField
          className={styles.teamInviteField}
          placeholder={TEAMMATE_1_PLACEHOLDER}
          value={teammate1}
          onChange={setTeammate1}
          onKeyDown={handleKeyDown}
          size="medium"
        />
        <TextField
          className={styles.teamInviteField}
          placeholder={TEAMMATE_2_PLACEHOLDER}
          value={teammate2}
          onChange={setTeammate2}
          onKeyDown={handleKeyDown}
          size="medium"
        />
        <Button
          className={styles.teamInviteSubmit}
          kind="primary"
          size="small"
          onClick={submit}
          disabled={!canSubmit}
        >
          Invite
        </Button>
      </div>
      <button type="button" className={styles.teamInviteSkip} onClick={onSkip}>
        <span aria-hidden="true">→</span> {TEAM_INVITE_SKIP_LABEL}
      </button>
    </div>
  );
}

function TourOfferCard({ onSelect }: { onSelect: (option: string) => void }) {
  return (
    <div className={`${styles.actionCard} ${styles.actionCardQuestionStyle}`}>
      <div className={styles.actionCardOptions}>
        <button
          type="button"
          className={styles.actionOption}
          onClick={() => onSelect(TOUR_BUTTON_LABEL)}
        >
          <span className={styles.actionOptionIndex}>1</span>
          <span className={styles.actionOptionLabel}>{TOUR_BUTTON_LABEL}</span>
        </button>
        <button
          type="button"
          className={styles.actionOption}
          onClick={() => onSelect(TOUR_SKIP_LABEL)}
        >
          <span className={styles.actionOptionIndex}>2</span>
          <span className={styles.actionOptionLabel}>{TOUR_SKIP_LABEL}</span>
        </button>
      </div>
    </div>
  );
}

const TOUR_STEP_TARGETS = ["agent", "content-section", "focus-board"] as const;

const LEFT_PANE_SELECTOR = '[data-testid="leftpane-new-layout"]';
// How far the tooltip's left edge reaches back over the left pane's right
// edge, so the bubble visually sits on top of the pane instead of floating
// beside it.
const TOUR_TOOLTIP_PANE_OVERLAP = 48;

function TourSpotlightTooltip({
  targetSelector,
  text,
  isLastStep,
  onNext,
  onSkip,
}: {
  targetSelector: string;
  text: string;
  isLastStep: boolean;
  onNext: () => void;
  onSkip: () => void;
}) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [paneRight, setPaneRight] = useState<number | null>(null);

  useLayoutEffect(() => {
    let rafId: number;
    let attempts = 0;
    const maxAttempts = 60;

    const update = () => {
      const el = document.querySelector<HTMLElement>(
        `[data-tour-target="${targetSelector}"]`,
      );
      if (!el) {
        // The sidebar content (e.g. boards) can render a beat after this
        // step becomes active — keep retrying for up to ~1s before giving up.
        if (attempts < maxAttempts) {
          attempts += 1;
          rafId = requestAnimationFrame(update);
        }
        return;
      }
      setRect(el.getBoundingClientRect());
      const pane = document.querySelector<HTMLElement>(LEFT_PANE_SELECTOR);
      setPaneRight(pane ? pane.getBoundingClientRect().right : null);
    };

    rafId = requestAnimationFrame(update);
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", update);
    };
  }, [targetSelector]);

  if (!rect) return null;

  const top = Math.max(rect.top - 4, 16);
  const left =
    paneRight !== null
      ? paneRight - TOUR_TOOLTIP_PANE_OVERLAP
      : rect.right + 12;

  // Rendered via a portal so the tooltip's stacking order isn't trapped by
  // the left pane's own transformed stacking context — it needs to sit
  // visually on top of the pane even though it overlaps it.
  return createPortal(
    <div className={styles.tourTooltip} style={{ top, left }}>
      <p className={styles.tourTooltipText}>{text}</p>
      <div className={styles.tourTooltipFooter}>
        <button
          type="button"
          className={styles.tourTooltipSkip}
          onClick={onSkip}
        >
          Skip
        </button>
        <button
          type="button"
          className={styles.tourTooltipNext}
          onClick={onNext}
        >
          {isLastStep ? "Done" : "Next"}
        </button>
      </div>
    </div>,
    document.body,
  );
}

const BOARD_TOUR_TOOLTIP_GAP = 16;
const BOARD_TOUR_TOOLTIP_WIDTH = 320;

// Board-stage walkthrough tooltip: unlike the sidebar tour bubble, this one is
// anchored directly to its target (workspace dropdown, board column, or Jade's
// chat launcher), shows the agent avatar, and streams its copy like a chat
// message so it reads as if the agent is speaking.
function BoardTourTooltip({
  step,
  stepIndex,
  totalSteps,
  avatarSrc,
  agentName,
  isLastStep,
  onNext,
  onSkip,
}: {
  step: BoardTourStep;
  stepIndex: number;
  totalSteps: number;
  avatarSrc: string;
  agentName: string;
  isLastStep: boolean;
  onNext: () => void;
  onSkip: () => void;
}) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    let rafId: number;
    let attempts = 0;
    const maxAttempts = 90;

    const update = () => {
      const el = document.querySelector<HTMLElement>(
        `[data-tour-target="${step.target}"]`,
      );
      if (!el) {
        // Board chrome / sidebar content can mount a beat after the step turns
        // active — keep retrying for ~1.5s before giving up.
        if (attempts < maxAttempts) {
          attempts += 1;
          rafId = requestAnimationFrame(update);
        }
        return;
      }
      setRect(el.getBoundingClientRect());
    };

    rafId = requestAnimationFrame(update);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [step.target]);

  if (!rect) return null;

  const gap = BOARD_TOUR_TOOLTIP_GAP;
  const width = BOARD_TOUR_TOOLTIP_WIDTH;
  let top: number;
  let left: number;

  switch (step.placement) {
    case "left":
      left = rect.left - width - gap;
      top = rect.top - 132;
      break;
    case "bottom":
      left = rect.left - 8;
      top = rect.bottom + gap;
      break;
    case "top":
      left = rect.left;
      top = rect.top - 176;
      break;
    case "right":
    default:
      left = rect.right + gap;
      top = rect.top - 8;
      break;
  }

  // Keep the bubble fully on screen.
  left = Math.max(16, Math.min(left, window.innerWidth - width - 16));
  top = Math.max(16, Math.min(top, window.innerHeight - 190));

  const placementClass =
    step.placement === "left"
      ? styles.boardTourTooltipLeft
      : step.placement === "bottom"
        ? styles.boardTourTooltipBottom
        : step.placement === "top"
          ? styles.boardTourTooltipTop
          : styles.boardTourTooltipRight;

  return createPortal(
    <div
      className={`${styles.boardTourTooltip} ${placementClass}`}
      style={{ top, left, width }}
    >
      <div className={styles.boardTourTooltipHeader}>
        <span className={styles.boardTourTooltipAvatar}>
          <img src={avatarSrc} alt="" aria-hidden="true" />
        </span>
        <span className={styles.boardTourTooltipName}>{agentName}</span>
      </div>
      <div className={styles.boardTourTooltipBody}>
        <ResponseStream
          key={step.target}
          textStream={step.text}
          mode="fade"
          speed={58}
          fadeDuration={220}
          segmentDelay={12}
        />
      </div>
      <div className={styles.boardTourTooltipFooter}>
        <span className={styles.boardTourTooltipProgress}>
          {stepIndex + 1} / {totalSteps}
        </span>
        <div className={styles.boardTourTooltipActions}>
          <button
            type="button"
            className={styles.tourTooltipSkip}
            onClick={onSkip}
          >
            Skip
          </button>
          <button
            type="button"
            className={styles.tourTooltipNext}
            onClick={onNext}
          >
            {isLastStep ? "Open chat" : "Next"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

type AgentTab = "brain" | "jobs" | "channels" | "activity";

const AGENT_TABS: { id: AgentTab; label: string }[] = [
  { id: "brain", label: "Brain" },
  { id: "jobs", label: "Jobs" },
  { id: "channels", label: "Channels" },
  { id: "activity", label: "Activity" },
];

function ImageGeneratorIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={styles.toolRowIconSvg}
    >
      <rect
        x="2"
        y="2"
        width="12"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle cx="5.5" cy="5.5" r="1.2" fill="currentColor" />
      <path
        d="M3 11l3-3 2 2 3-3 2 4H3z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PanelAddAction({
  label,
  onClick,
  trailing,
}: {
  label: string;
  onClick?: () => void;
  trailing?: ReactNode;
}) {
  return (
    <button type="button" className={styles.panelAddAction} onClick={onClick}>
      <span className={styles.panelAddActionInner}>
        <Icon icon={Add} size={16} className={styles.panelAddActionIcon} />
        <span>{label}</span>
      </span>
      {trailing}
    </button>
  );
}

function ToolMetaDot() {
  return <span className={styles.toolMetaDot} aria-hidden="true" />;
}

function BrainSection({
  title,
  infoLabel,
  open,
  onToggle,
  children,
  bodyClassName,
}: {
  title: string;
  infoLabel: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  bodyClassName?: string;
}) {
  return (
    <div className={styles.brainSection}>
      <div className={styles.brainSectionHeader}>
        <button
          type="button"
          className={styles.brainSectionToggleButton}
          onClick={onToggle}
          aria-expanded={open}
        >
          <Icon
            icon={DropdownChevronDown}
            size={16}
            className={`${styles.brainSectionChevron} ${
              open ? "" : styles.brainSectionChevronCollapsed
            }`}
          />
          <span className={styles.brainSectionTitle}>{title}</span>
        </button>
        <Icon
          icon={Info}
          size={16}
          className={styles.brainSectionInfo}
          aria-label={infoLabel}
        />
      </div>
      {open && (
        <div className={`${styles.sectionBody} ${bodyClassName ?? ""}`}>
          {children}
        </div>
      )}
    </div>
  );
}

function AgentSidePanel({
  activeTab,
  onTabChange,
  knowledgeBoards,
  jobCount = 0,
  collapsed,
  onCollapsedChange,
}: {
  activeTab: AgentTab;
  onTabChange: (tab: AgentTab) => void;
  knowledgeBoards: string[];
  jobCount?: number;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}) {
  const flow = useAgentFlow();
  const [instructionsOpen, setInstructionsOpen] = useState(true);
  const [knowledgeOpen, setKnowledgeOpen] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(true);
  const [skillsOpen, setSkillsOpen] = useState(true);
  const [modelOpen, setModelOpen] = useState(true);
  const hasKnowledgeBoards = knowledgeBoards.length > 0;

  const getTabLabel = (tab: (typeof AGENT_TABS)[number]) => {
    if (tab.id === "jobs") return `Jobs / ${jobCount}`;
    return tab.label;
  };

  return (
    <aside
      className={`${styles.agentPanel} ${
        collapsed ? styles.agentPanelCollapsed : ""
      }`}
      aria-label={`${flow.agentName} agent details`}
    >
      {collapsed ? (
        <button
          type="button"
          className={styles.agentPanelExpandButton}
          onClick={() => onCollapsedChange(false)}
          aria-label="Expand agent panel"
        >
          <span className={styles.agentPanelExpandAvatar}>
            <img src={flow.assets.agentFull} alt="" />
          </span>
        </button>
      ) : (
        <div className={styles.agentPanelInner}>
          <button
            type="button"
            className={styles.agentPanelCollapseButton}
            onClick={() => onCollapsedChange(true)}
            aria-label="Collapse agent panel"
          >
            <Icon icon={SidebarCollapsed} size={16} />
          </button>
          <div className={styles.agentPanelHeader}>
            <div className={styles.agentProfileCard}>
              <div className={styles.agentProfileAvatarLarge}>
                <img src={flow.assets.agentFull} alt="" />
              </div>
              <div className={styles.agentProfileCopy}>
                <div className={styles.agentProfileIntro}>
                  <div className={styles.agentProfileNameRow}>
                    <span className={styles.agentProfileName}>
                      {flow.agentName}
                    </span>
                    <span
                      className={styles.agentStatusDot}
                      aria-hidden="true"
                    />
                  </div>
                  <p className={styles.agentProfileRole}>{flow.agentRole}</p>
                </div>
                <div className={styles.agentProfileTools}>
                  <span className={styles.agentProfileToolsLabel}>Tools</span>
                  <div
                    className={styles.agentProfileToolsRow}
                    aria-hidden="true"
                  >
                    <span className={styles.agentProfileToolBadge}>
                      <img src={toolGmail} alt="" />
                    </span>
                    <span className={styles.agentProfileToolBadge}>
                      <img src={toolSlack} alt="" />
                    </span>
                    <span className={styles.agentProfileSkillBadgePink} />
                    <span className={styles.agentProfileSkillBadge} />
                    <span className={styles.agentProfileSkillBadgeYellow} />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.agentTabs} role="tablist">
              {AGENT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`${styles.agentTab} ${
                    activeTab === tab.id ? styles.agentTabActive : ""
                  }`}
                  onClick={() => onTabChange(tab.id)}
                >
                  <span className={styles.agentTabLabel}>
                    {getTabLabel(tab)}
                  </span>
                  <span
                    className={styles.agentTabUnderline}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
          </div>

          {activeTab === "brain" && (
            <div className={styles.agentPanelBody}>
              <BrainSection
                title="Instructions"
                infoLabel="About instructions"
                open={instructionsOpen}
                onToggle={() => setInstructionsOpen((open) => !open)}
                bodyClassName={styles.instructionsBody}
              >
                <div className={styles.instructionsScroll}>
                  <div className={styles.instructionsRichText}>
                    <p className={styles.instructionsHeading}>
                      <span aria-hidden="true">📝 </span>
                      <strong>Overview</strong>
                    </p>
                    <p>
                      You are a recruiting agent. You help identify and source
                      top candidates for open roles
                    </p>
                    <p className={styles.instructionsSpacer} aria-hidden="true">
                      &nbsp;
                    </p>
                    <p className={styles.instructionsHeading}>
                      <span aria-hidden="true">🔗 </span>
                      <strong>Key Resources</strong>
                    </p>
                    <ul className={styles.instructionsList}>
                      <li>
                        Career page:{" "}
                        <a
                          href="https://monday.com/careers"
                          target="_blank"
                          rel="noreferrer"
                        >
                          https://monday.com/careers
                        </a>{" "}
                        — use the Browser tool to scrape all open roles
                      </li>
                      <li>
                        Open Roles board (ID: 18420444453) — tracks all open
                        positions with fields: Name, Person, Status, Date
                      </li>
                      <li>
                        Sourced Candidates board — stores sourced candidates
                        linked to their role
                      </li>
                    </ul>
                    <p className={styles.instructionsSpacer} aria-hidden="true">
                      &nbsp;
                    </p>
                    <p className={styles.instructionsHeading}>
                      <span aria-hidden="true">🗂️ </span>
                      <strong>Workflow</strong>
                    </p>
                    <p>1. Listing Open Roles</p>
                    <p>When asked to list or refresh open roles:</p>
                    <ol className={styles.instructionsList}>
                      <li>
                        Use the Browser tool to visit{" "}
                        <a
                          href="https://monday.com/careers"
                          target="_blank"
                          rel="noreferrer"
                        >
                          https://monday.com/careers
                        </a>
                      </li>
                      <li>
                        Extract all open roles including: job title, location,
                        team/department, seniority level, and any other relevant
                        details
                      </li>
                      <li>
                        Create or update items on the Open Roles board — one
                        item per role
                      </li>
                      <li>
                        Include location, seniority, and team in the item&apos;s
                        update/comment for reference
                      </li>
                    </ol>
                    <p>
                      2. Sourcing Candidates (triggered when assigned to a role)
                    </p>
                    <p>
                      When you are assigned to an item on the Open Roles board:
                    </p>
                    <ol className={styles.instructionsList}>
                      <li>
                        Read the role details from the item (title, location,
                        seniority, requirements)
                      </li>
                    </ol>
                  </div>
                  <div className={styles.instructionsFade} aria-hidden="true" />
                </div>
              </BrainSection>

              <BrainSection
                title="Knowledge and access"
                infoLabel="About knowledge and access"
                open={knowledgeOpen}
                onToggle={() => setKnowledgeOpen((open) => !open)}
                bodyClassName={styles.knowledgeBody}
              >
                <div className={styles.knowledgeSourceRow}>
                  <MondayMulticolorMark />
                  <span>monday.com</span>
                </div>
                {hasKnowledgeBoards ? (
                  <div className={styles.knowledgeIndented}>
                    {knowledgeBoards.map((board) => (
                      <div key={board} className={styles.knowledgeBoardRow}>
                        <Icon
                          icon={Doc}
                          size={16}
                          className={styles.knowledgeIcon}
                        />
                        <span className={styles.knowledgeBoardLabel}>
                          {board}
                        </span>
                        <button
                          type="button"
                          className={styles.knowledgeAccess}
                        >
                          Editor
                          <Icon icon={DropdownChevronDown} size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className={styles.knowledgeIndented}>
                  <PanelAddAction label="Add board" />
                </div>
                <div className={styles.sectionDivider} />
                <div className={styles.knowledgeFilesRow}>
                  <Icon
                    icon={Attach}
                    size={20}
                    className={styles.knowledgeIcon}
                  />
                  <span>Files</span>
                </div>
                <div className={styles.knowledgeIndented}>
                  <PanelAddAction label="Add file" />
                </div>
              </BrainSection>

              <BrainSection
                title="Tools"
                infoLabel="About tools"
                open={toolsOpen}
                onToggle={() => setToolsOpen((open) => !open)}
                bodyClassName={styles.toolsBody}
              >
                <div className={styles.toolSimpleRow}>
                  <Icon icon={Globe} size={16} className={styles.toolRowIcon} />
                  <span>Web search</span>
                </div>
                <div className={styles.toolSimpleRow}>
                  <ImageGeneratorIcon />
                  <span>Image generator</span>
                </div>
                <div className={styles.toolConnectionRow}>
                  <img
                    src={toolSlack}
                    alt=""
                    className={styles.toolConnectionIcon}
                  />
                  <span>Slack</span>
                  <ToolMetaDot />
                  <span className={styles.toolMetaMuted}>2 tools</span>
                  <ToolMetaDot />
                  <span className={styles.toolMetaMuted}>annasol</span>
                </div>
                <div className={styles.toolConnectionRow}>
                  <img
                    src={toolGoogleCalendar}
                    alt=""
                    className={styles.toolConnectionIcon}
                  />
                  <span>Google Calendar</span>
                  <ToolMetaDot />
                  <span className={styles.toolMetaMuted}>1 tool</span>
                  <ToolMetaDot />
                  <span className={styles.toolMetaMuted}>
                    annasol@gmail.com
                  </span>
                </div>
                <div className={styles.toolConnectionRow}>
                  <img
                    src={toolGmail}
                    alt=""
                    className={styles.toolConnectionIcon}
                  />
                  <span>Gmail</span>
                  <ToolMetaDot />
                  <span className={styles.toolMetaMuted}>0 tools</span>
                  <ToolMetaDot />
                  <button type="button" className={styles.connectAccountButton}>
                    Connect account
                  </button>
                </div>
                <PanelAddAction
                  label="Add tool"
                  trailing={
                    <span
                      className={styles.integrationIcons}
                      aria-hidden="true"
                    >
                      <span className={styles.integrationIconBadge}>
                        <img src={toolGmail} alt="" />
                      </span>
                      <span className={styles.integrationIconBadge}>
                        <img src={toolGoogleCalendar} alt="" />
                      </span>
                      <span className={styles.integrationIconBadge}>
                        <img src={toolSlack} alt="" />
                      </span>
                    </span>
                  }
                />
              </BrainSection>

              <BrainSection
                title="Skills"
                infoLabel="About skills"
                open={skillsOpen}
                onToggle={() => setSkillsOpen((open) => !open)}
                bodyClassName={styles.skillsBody}
              >
                <PanelAddAction label="Add skill" />
              </BrainSection>

              <BrainSection
                title="Model"
                infoLabel="About model"
                open={modelOpen}
                onToggle={() => setModelOpen((open) => !open)}
                bodyClassName={styles.modelBody}
              >
                <button type="button" className={styles.modelPicker}>
                  <span className={styles.modelPickerLabel}>
                    <img
                      src={gptModelIcon}
                      alt=""
                      className={styles.modelPickerIcon}
                    />
                    GPT 5.4
                  </span>
                  <Icon icon={DropdownChevronDown} size={16} />
                </button>
              </BrainSection>
            </div>
          )}

          {activeTab === "jobs" && (
            <div
              className={`${styles.agentPanelBody} ${styles.agentPanelBodyJobs}`}
            >
              <JobsTriggersList />
            </div>
          )}

          <div className={styles.agentPanelFooter}>
            <PanelAddAction label="Add job" />
          </div>
        </div>
      )}
    </aside>
  );
}

interface AgentsOnboardingViewProps {
  prototypeStepIndex: number;
}

export function AgentsOnboardingView({
  prototypeStepIndex,
}: AgentsOnboardingViewProps) {
  const agentFlow = useAgentFlow();
  const boardTourSteps = agentFlow.boardHandoff.tourSteps;
  const boardChatIntroMessages =
    agentFlow.boardHandoff.chatIntroMessages ?? EMPTY_BOARD_CHAT_INTRO_MESSAGES;
  const boardSaveScriptMessage = createBoardSaveScriptMessage(
    agentFlow.boardHandoff.saveMessage,
  );
  const {
    setBoards: setWorkspaceBoards,
    setHighlightedTarget,
    setPanelForceOpen,
    setBoardStageActive,
    setBoardHandoffActive,
    setLiveBoardReady,
    workspaceEntryMode,
    setWorkspaceEntryMode,
    liveBoardReady,
    registerFocusBoardActivate,
  } = useWorkspaceBoards();
  const onboardingScript = agentFlow.onboardingScript;
  const sourcingScript = agentFlow.sourcingScript;

  const [message, setMessage] = useState("");
  const [composerMessages, setComposerMessages] = useState<string[]>([]);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [completedMessages, setCompletedMessages] = useState<ScriptMessage[]>(
    [],
  );
  const [activeMessage, setActiveMessage] = useState<ScriptMessage | null>(
    null,
  );
  const [isTyping, setIsTyping] = useState(false);
  const [showActionCard, setShowActionCard] = useState(false);
  const [firstActionTitleVisible, setFirstActionTitleVisible] = useState(false);
  const [userSelection, setUserSelection] = useState<string | null>(null);
  const [isHeroExiting, setIsHeroExiting] = useState(false);
  const [showAgentPanel, setShowAgentPanel] = useState(false);
  const [followUpCompleted, setFollowUpCompleted] = useState<ScriptMessage[]>(
    [],
  );
  const [followUpActive, setFollowUpActive] = useState<ScriptMessage | null>(
    null,
  );
  const [followUpTyping, setFollowUpTyping] = useState(false);
  const [showGetStartedCard, setShowGetStartedCard] = useState(false);
  const [getStartedTitleVisible, setGetStartedTitleVisible] = useState(false);
  const [getStartedSelection, setGetStartedSelection] = useState<string | null>(
    null,
  );
  const [panelTab, setPanelTab] = useState<AgentTab>("brain");
  const [agentPanelCollapsed, setAgentPanelCollapsed] = useState(false);
  const [knowledgeBoards, setKnowledgeBoards] = useState<string[]>([]);
  const [scanCompleted, setScanCompleted] = useState<ScriptMessage[]>([]);
  const [scanActive, setScanActive] = useState<ScriptMessage | null>(null);
  const [scanPendingMessageId, setScanPendingMessageId] = useState<
    string | null
  >(null);
  const [scanTyping, setScanTyping] = useState(false);
  const [showPlanCard, setShowPlanCard] = useState(false);
  const [showOpenRolesTable, setShowOpenRolesTable] = useState(false);
  const [showRolePickCard, setShowRolePickCard] = useState(false);
  const [rolePickSelection, setRolePickSelection] = useState<string | null>(
    null,
  );
  const [showSourcingProgress, setShowSourcingProgress] = useState(false);
  const [showCandidatesThinking, setShowCandidatesThinking] = useState(false);
  const [showCandidatesTable, setShowCandidatesTable] = useState(false);
  const [showAutomationCard, setShowAutomationCard] = useState(false);
  const [automationSelection, setAutomationSelection] = useState<string | null>(
    null,
  );
  const [showTeamInviteCard, setShowTeamInviteCard] = useState(false);
  const [teamInviteSelection, setTeamInviteSelection] = useState<string | null>(
    null,
  );
  const [showTourOfferCard, setShowTourOfferCard] = useState(false);
  const [tourOfferSelection, setTourOfferSelection] = useState<string | null>(
    null,
  );
  const [tourStep, setTourStep] = useState<0 | 1 | 2 | null>(null);
  const [showDailyTrigger, setShowDailyTrigger] = useState(false);
  // Candidate feedback + live-board handoff (nike-scan). Rendered after the
  // candidates table, independent of the linear script so the "adjust" branch
  // can loop.
  const [feedbackAsk1Visible, setFeedbackAsk1Visible] = useState(false);
  const [feedbackChoice1, setFeedbackChoice1] = useState<string | null>(null);
  const [refineThinking, setRefineThinking] = useState(false);
  const [refinedTableVisible, setRefinedTableVisible] = useState(false);
  const [feedbackAsk2Visible, setFeedbackAsk2Visible] = useState(false);
  const [feedbackChoice2, setFeedbackChoice2] = useState<string | null>(null);
  const [showFeedbackCard, setShowFeedbackCard] = useState(false);
  const [feedbackCardRound, setFeedbackCardRound] = useState<1 | 2>(1);
  const [boardSaveVisible, setBoardSaveVisible] = useState(false);
  const [boardSaveTyping, setBoardSaveTyping] = useState(false);
  const [boardSaveStreamed, setBoardSaveStreamed] = useState(false);
  const boardNavStartedRef = useRef(false);
  const boardChatIntroIndexRef = useRef(0);
  const boardChatIntroStartedRef = useRef(false);
  const prevWorkspaceEntryModeRef = useRef(workspaceEntryMode);
  const boardModeInitializedRef = useRef(false);
  const [showBoardOfferCard, setShowBoardOfferCard] = useState(false);
  const [boardOfferChoice, setBoardOfferChoice] = useState<string | null>(null);
  const [showBoardHandoffTooltip, setShowBoardHandoffTooltip] = useState(false);
  const [showBoardView, setShowBoardView] = useState(false);
  const [boardLoading, setBoardLoading] = useState(false);
  const [boardChatRevealed, setBoardChatRevealed] = useState(false);
  const [boardChatIntroCompleted, setBoardChatIntroCompleted] = useState<
    ScriptMessage[]
  >([]);
  const [boardChatIntroActive, setBoardChatIntroActive] =
    useState<ScriptMessage | null>(null);
  const [boardChatIntroTyping, setBoardChatIntroTyping] = useState(false);
  // Board-stage walkthrough step (index into BOARD_TOUR_STEPS) or null when the
  // walkthrough isn't running.
  const [boardTourStep, setBoardTourStep] = useState<number | null>(null);
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [activeFlow, setActiveFlow] = useState<HiringFlow | null>(null);
  const activeFlowRef = useRef<HiringFlow | null>(null);
  const [roleLinkUrl, setRoleLinkUrl] = useState<string | null>(null);
  const [awaitingRoleLink, setAwaitingRoleLink] = useState(false);
  const [roleQuery, setRoleQuery] = useState<string | null>(null);
  const [awaitingRoleQuery, setAwaitingRoleQuery] = useState(false);
  const roleQueryRef = useRef("");
  const [showBrandVoiceCard, setShowBrandVoiceCard] = useState(false);
  const [brandVoiceSelection, setBrandVoiceSelection] = useState<string | null>(
    null,
  );
  const [showBrandVoiceResearch, setShowBrandVoiceResearch] = useState(false);
  const [showTopicCard, setShowTopicCard] = useState(false);
  const [topicSelection, setTopicSelection] = useState<string | null>(null);
  const [showPostSuggestionCard, setShowPostSuggestionCard] = useState(false);
  const [postSuggestionSelection, setPostSuggestionSelection] = useState<
    string | null
  >(null);
  const [showDraftingProgress, setShowDraftingProgress] = useState(false);
  const [showLinkedInPost, setShowLinkedInPost] = useState(false);
  const [showPostSaveActions, setShowPostSaveActions] = useState(false);
  const [postSaveSelection, setPostSaveSelection] = useState<string | null>(
    null,
  );
  const [liaTourSkipMessage, setLiaTourSkipMessage] = useState<string | null>(
    null,
  );
  const flowScripts: Record<HiringFlow, readonly FlowScriptMessage[]> = {
    "nike-scan": agentFlow.id === "jade" ? agentFlow.scanFlow.script : [],
    "role-link": ROLE_LINK_SCRIPT,
    "role-search": [],
    "lia-draft": agentFlow.id === "lia" ? agentFlow.scanFlow.script : [],
  };
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const flowIndexRef = useRef(0);
  const scriptIndexRef = useRef(0);
  const followUpIndexRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatContentRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const actionCardDockRef = useRef<HTMLDivElement>(null);
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const shouldFollowScrollRef = useRef(true);
  const isHeroExitingRef = useRef(false);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const timersRef = useRef<number[]>([]);
  const introStartedRef = useRef(false);
  const hasMessage = message.trim().length > 0;

  const automationCardTitle =
    activeFlow === "role-link"
      ? ROLE_LINK_MESSAGES.automationAsk
      : activeFlow === "lia-draft"
        ? LIA_DRAFT_MESSAGES.automationAsk
        : (agentFlow.scanFlow.script[5]?.text ??
          agentFlow.scanFlow.messages.automationAsk);
  const invitePanelTitle =
    activeFlow === "role-link"
      ? ROLE_LINK_MESSAGES.inviteDone
      : agentFlow.scanFlow.messages.inviteDone;
  const showPromptActionCard =
    showActionCard ||
    showGetStartedCard ||
    showBrandVoiceCard ||
    showTopicCard ||
    showPostSuggestionCard ||
    showPostSaveActions ||
    showRolePickCard ||
    showAutomationCard ||
    showFeedbackCard ||
    showBoardOfferCard ||
    showTeamInviteCard ||
    showTourOfferCard;

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (!shouldFollowScrollRef.current || isHeroExitingRef.current) return;

    const runScroll = () => {
      const container = scrollRef.current;
      const anchor = scrollEndRef.current;
      if (!container) return;

      if (anchor) {
        anchor.scrollIntoView({ block: "end", behavior });
        return;
      }

      container.scrollTo({
        top: container.scrollHeight - container.clientHeight,
        behavior,
      });
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(runScroll);
    });
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      shouldFollowScrollRef.current = distanceFromBottom < 96;
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const targets: Element[] = [];
    if (chatContentRef.current) targets.push(chatContentRef.current);
    if (innerRef.current) targets.push(innerRef.current);
    if (actionCardDockRef.current) targets.push(actionCardDockRef.current);

    if (targets.length === 0) return;

    const observer = new ResizeObserver(() => {
      if (!shouldFollowScrollRef.current || isHeroExitingRef.current) return;
      scrollToBottom("smooth");
    });

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [scrollToBottom, showPromptActionCard]);

  useLayoutEffect(() => {
    if (isHeroExitingRef.current) return;
    scrollToBottom("auto");
  }, [showPromptActionCard, scrollToBottom]);

  // Tell the layout when the live board stage is showing so the nav rail can
  // highlight "Workspace" (instead of "Agents") while the board is open.
  useEffect(() => {
    setBoardStageActive(showBoardView);
  }, [showBoardView, setBoardStageActive]);

  useEffect(() => {
    if (showBoardView) {
      setLiveBoardReady(true);
      if (
        !boardModeInitializedRef.current &&
        workspaceEntryMode === "conversation"
      ) {
        boardModeInitializedRef.current = true;
        setWorkspaceEntryMode("board");
      }
    }
  }, [
    showBoardView,
    setLiveBoardReady,
    workspaceEntryMode,
    setWorkspaceEntryMode,
  ]);

  useEffect(() => {
    if (!liveBoardReady) return;
    if (prevWorkspaceEntryModeRef.current === workspaceEntryMode) return;
    prevWorkspaceEntryModeRef.current = workspaceEntryMode;

    if (workspaceEntryMode === "home") {
      return;
    }

    if (workspaceEntryMode === "board") {
      setShowBoardView(true);
      setBoardLoading(false);
      setBoardChatRevealed(false);
      setBoardTourStep(null);
      setPanelForceOpen(true);
      setShowBoardHandoffTooltip(false);
      setBoardHandoffActive(false);
      return;
    }

    setShowBoardView(true);
    setBoardLoading(false);
    setBoardChatRevealed(true);
    setBoardTourStep(null);
    setPanelForceOpen(false);
    setShowBoardHandoffTooltip(false);
    setBoardHandoffActive(false);
    if (boardChatIntroMessages.length > 0) {
      setBoardChatIntroCompleted([...boardChatIntroMessages]);
      setBoardChatIntroActive(null);
      setBoardChatIntroTyping(false);
      boardChatIntroIndexRef.current = boardChatIntroMessages.length;
      boardChatIntroStartedRef.current = true;
    }
  }, [
    workspaceEntryMode,
    liveBoardReady,
    boardChatIntroMessages,
    setBoardHandoffActive,
    setPanelForceOpen,
  ]);

  // When Jade's chat opens over the board, jump to the most recent exchange so
  // the user sees the last thing she and the user said (not the top of history).
  useEffect(() => {
    if (!boardChatRevealed) return;
    shouldFollowScrollRef.current = true;
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollEndRef.current?.scrollIntoView({ block: "end" });
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [boardChatRevealed]);

  useEffect(() => {
    scrollToBottom();
  }, [
    completedMessages,
    activeMessage,
    isTyping,
    conversationStarted,
    showActionCard,
    userSelection,
    followUpCompleted,
    followUpActive,
    followUpTyping,
    showGetStartedCard,
    getStartedSelection,
    scanCompleted,
    scanActive,
    scanTyping,
    showPlanCard,
    showOpenRolesTable,
    showRolePickCard,
    rolePickSelection,
    showSourcingProgress,
    showCandidatesThinking,
    showCandidatesTable,
    showAutomationCard,
    automationSelection,
    showTeamInviteCard,
    teamInviteSelection,
    showTourOfferCard,
    tourOfferSelection,
    tourStep,
    showDailyTrigger,
    showBoardView,
    boardChatIntroCompleted,
    boardChatIntroActive,
    boardChatIntroTyping,
    showInvitePanel,
    roleLinkUrl,
    isVideoPlaying,
    showPromptActionCard,
    composerMessages,
    scrollToBottom,
  ]);

  const schedule = useCallback((fn: () => void, delay: number) => {
    const id = window.setTimeout(fn, delay);
    timersRef.current.push(id);
  }, []);

  const showTypingThenMessage = useCallback(() => {
    const next = onboardingScript[scriptIndexRef.current];
    if (!next) return;

    setIsTyping(true);
    schedule(
      () => {
        setIsTyping(false);
        setActiveMessage(next);
        scriptIndexRef.current += 1;
      },
      randomBetween(TYPING_MIN_MS, TYPING_MAX_MS),
    );
  }, [onboardingScript, schedule]);

  const showFollowUpTypingThenMessage = useCallback(() => {
    const next = sourcingScript[followUpIndexRef.current];
    if (!next) return;

    setFollowUpTyping(true);
    schedule(
      () => {
        setFollowUpTyping(false);
        setFollowUpActive(next);
        followUpIndexRef.current += 1;
      },
      randomBetween(TYPING_MIN_MS, TYPING_MAX_MS),
    );
  }, [schedule, sourcingScript]);

  const handleStreamComplete = useCallback(() => {
    if (!activeMessage) return;

    setCompletedMessages((prev) => [...prev, activeMessage]);
    setActiveMessage(null);

    if (scriptIndexRef.current < onboardingScript.length) {
      schedule(
        () => showTypingThenMessage(),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    schedule(
      () => {
        setIsTyping(true);
        schedule(
          () => {
            setIsTyping(false);
            setShowActionCard(true);
          },
          randomBetween(TYPING_MIN_MS, TYPING_MAX_MS),
        );
      },
      randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
    );
  }, [activeMessage, onboardingScript.length, schedule, showTypingThenMessage]);

  const handleFollowUpStreamComplete = useCallback(() => {
    if (!followUpActive) return;

    setFollowUpCompleted((prev) => [...prev, followUpActive]);
    setFollowUpActive(null);

    if (followUpIndexRef.current < sourcingScript.length) {
      schedule(
        () => showFollowUpTypingThenMessage(),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    if (agentFlow.id === "lia") {
      schedule(
        () => setShowBrandVoiceCard(true),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    schedule(
      () => {
        setFollowUpTyping(true);
        schedule(
          () => {
            setFollowUpTyping(false);
            setShowGetStartedCard(true);
          },
          randomBetween(TYPING_MIN_MS, TYPING_MAX_MS),
        );
      },
      randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
    );
  }, [
    followUpActive,
    agentFlow.id,
    schedule,
    showFollowUpTypingThenMessage,
    sourcingScript.length,
  ]);

  const showFlowTypingThenMessage = useCallback(() => {
    const activeHiringFlow = activeFlowRef.current;
    if (!activeHiringFlow) return;

    const script =
      activeHiringFlow === "role-search"
        ? buildRoleSearchScript(roleQueryRef.current)
        : flowScripts[activeHiringFlow];
    const next = script[flowIndexRef.current];
    if (!next) return;

    setScanPendingMessageId(next.id);
    setScanTyping(true);
    schedule(
      () => {
        setScanTyping(false);
        setScanPendingMessageId(null);
        setScanActive(next);
        flowIndexRef.current += 1;
      },
      randomBetween(TYPING_MIN_MS, TYPING_MAX_MS),
    );
  }, [flowScripts, schedule]);

  const handleComposerSend = useCallback(() => {
    const text = message.trim();
    if (!text) return;

    if (awaitingRoleLink && activeFlowRef.current === "role-link") {
      setRoleLinkUrl(text);
      setAwaitingRoleLink(false);
      setMessage("");
      schedule(
        () => showFlowTypingThenMessage(),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      requestAnimationFrame(() => scrollToBottom("smooth"));
      return;
    }

    if (awaitingRoleQuery && activeFlowRef.current === "role-search") {
      roleQueryRef.current = text;
      setRoleQuery(text);
      setAwaitingRoleQuery(false);
      setMessage("");
      schedule(
        () => showFlowTypingThenMessage(),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      requestAnimationFrame(() => scrollToBottom("smooth"));
      return;
    }

    setComposerMessages((prev) => [...prev, text]);
    setMessage("");
    setConversationStarted(true);
    requestAnimationFrame(() => scrollToBottom("smooth"));
  }, [
    awaitingRoleLink,
    awaitingRoleQuery,
    message,
    schedule,
    scrollToBottom,
    showFlowTypingThenMessage,
  ]);

  const handleComposerKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleComposerSend();
    }
  };

  const resetHiringFlowUi = useCallback(() => {
    flowIndexRef.current = 0;
    activeFlowRef.current = null;
    setActiveFlow(null);
    setScanCompleted([]);
    setScanActive(null);
    setScanPendingMessageId(null);
    setScanTyping(false);
    setShowPlanCard(false);
    setShowOpenRolesTable(false);
    setShowRolePickCard(false);
    setRolePickSelection(null);
    setShowSourcingProgress(false);
    setShowCandidatesThinking(false);
    setShowCandidatesTable(false);
    setShowAutomationCard(false);
    setAutomationSelection(null);
    setShowTeamInviteCard(false);
    setTeamInviteSelection(null);
    setShowTourOfferCard(false);
    setTourOfferSelection(null);
    setTourStep(null);
    setShowDailyTrigger(false);
    setFeedbackAsk1Visible(false);
    setFeedbackChoice1(null);
    setRefineThinking(false);
    setRefinedTableVisible(false);
    setFeedbackAsk2Visible(false);
    setFeedbackChoice2(null);
    setShowFeedbackCard(false);
    setFeedbackCardRound(1);
    setBoardSaveVisible(false);
    setBoardSaveTyping(false);
    setBoardSaveStreamed(false);
    boardNavStartedRef.current = false;
    setShowBoardOfferCard(false);
    setBoardOfferChoice(null);
    setShowBoardHandoffTooltip(false);
    setBoardHandoffActive(false);
    setPanelForceOpen(false);
    setShowBoardView(false);
    setBoardLoading(false);
    setBoardChatRevealed(false);
    setBoardTourStep(null);
    setBoardChatIntroCompleted([]);
    setBoardChatIntroActive(null);
    setBoardChatIntroTyping(false);
    boardChatIntroIndexRef.current = 0;
    boardChatIntroStartedRef.current = false;
    setShowInvitePanel(false);
    setPanelTab("brain");
    setKnowledgeBoards([]);
    setRoleLinkUrl(null);
    setAwaitingRoleLink(false);
    setRoleQuery(null);
    setAwaitingRoleQuery(false);
    roleQueryRef.current = "";
    setShowBrandVoiceCard(false);
    setBrandVoiceSelection(null);
    setShowBrandVoiceResearch(false);
    setShowTopicCard(false);
    setTopicSelection(null);
    setShowPostSuggestionCard(false);
    setPostSuggestionSelection(null);
    setShowDraftingProgress(false);
    setShowLinkedInPost(false);
    setShowPostSaveActions(false);
    setPostSaveSelection(null);
    setLiaTourSkipMessage(null);
    setComposerMessages([]);
  }, [setBoardHandoffActive, setPanelForceOpen]);

  const clearScheduledTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const applyPrototypeStep = useCallback(
    (stepIndex: number) => {
      clearScheduledTimers();

      const snapshot = getPrototypeStepState(stepIndex, agentFlow.id);

      setMessage(snapshot.message);
      setComposerMessages([]);
      setConversationStarted(snapshot.conversationStarted);
      setCompletedMessages(snapshot.completedMessages);
      setActiveMessage(snapshot.activeMessage);
      setIsTyping(snapshot.isTyping);
      setShowActionCard(snapshot.showActionCard);
      setFirstActionTitleVisible(snapshot.firstActionTitleVisible);
      setUserSelection(snapshot.userSelection);
      setShowAgentPanel(snapshot.showAgentPanel);
      setFollowUpCompleted(snapshot.followUpCompleted);
      setFollowUpActive(snapshot.followUpActive);
      setFollowUpTyping(snapshot.followUpTyping);
      setShowGetStartedCard(snapshot.showGetStartedCard);
      setGetStartedTitleVisible(snapshot.getStartedTitleVisible);
      setGetStartedSelection(snapshot.getStartedSelection);
      setPanelTab(snapshot.panelTab);
      setAgentPanelCollapsed(snapshot.agentPanelCollapsed);
      setKnowledgeBoards(snapshot.knowledgeBoards);
      setScanCompleted(snapshot.scanCompleted);
      setScanActive(snapshot.scanActive);
      setScanPendingMessageId(null);
      setScanTyping(snapshot.scanTyping);
      setShowPlanCard(snapshot.showPlanCard);
      setShowOpenRolesTable(snapshot.showOpenRolesTable);
      setShowRolePickCard(snapshot.showRolePickCard);
      setRolePickSelection(snapshot.rolePickSelection);
      setShowSourcingProgress(snapshot.showSourcingProgress);
      setShowCandidatesThinking(snapshot.showCandidatesThinking);
      setShowCandidatesTable(snapshot.showCandidatesTable);
      setShowAutomationCard(snapshot.showAutomationCard);
      setAutomationSelection(snapshot.automationSelection);
      setShowTeamInviteCard(snapshot.showTeamInviteCard);
      setTeamInviteSelection(snapshot.teamInviteSelection);
      setShowTourOfferCard(snapshot.showTourOfferCard);
      setTourOfferSelection(snapshot.tourOfferSelection);
      setTourStep(snapshot.tourStep);
      setShowDailyTrigger(snapshot.showDailyTrigger);
      setBoardSaveVisible(snapshot.boardSaveVisible);
      setShowBoardOfferCard(snapshot.showBoardOfferCard);
      setBoardOfferChoice(snapshot.boardOfferChoice);
      setShowBoardView(snapshot.showBoardView);
      if (snapshot.showBoardView) {
        setLiveBoardReady(true);
      }
      setBoardChatRevealed(snapshot.boardChatRevealed);
      setBoardTourStep(snapshot.boardTourStep);
      if (snapshot.boardChatIntroDone) {
        setBoardChatIntroCompleted([...boardChatIntroMessages]);
        setBoardChatIntroActive(null);
        setBoardChatIntroTyping(false);
        boardChatIntroIndexRef.current = boardChatIntroMessages.length;
        boardChatIntroStartedRef.current = true;
      } else {
        setBoardChatIntroCompleted([]);
        setBoardChatIntroActive(null);
        setBoardChatIntroTyping(false);
        boardChatIntroIndexRef.current = 0;
        boardChatIntroStartedRef.current = false;
      }
      setPanelForceOpen(snapshot.showBoardView);
      // Snapshots represent settled states — never mid-stream/mid-load — so the
      // board-save message renders statically and the handoff won't re-fire.
      setBoardSaveTyping(false);
      setBoardSaveStreamed(snapshot.boardSaveVisible);
      setBoardLoading(false);
      boardNavStartedRef.current = snapshot.boardSaveVisible;
      setShowInvitePanel(snapshot.showInvitePanel);
      setActiveFlow(snapshot.activeFlow);
      setRoleLinkUrl(snapshot.roleLinkUrl);
      setIsVideoPlaying(snapshot.isVideoPlaying);
      setShowBrandVoiceCard(snapshot.showBrandVoiceCard);
      setBrandVoiceSelection(snapshot.brandVoiceSelection);
      setShowBrandVoiceResearch(snapshot.showBrandVoiceResearch);
      setShowTopicCard(snapshot.showTopicCard);
      setTopicSelection(snapshot.topicSelection);
      setShowPostSuggestionCard(snapshot.showPostSuggestionCard);
      setPostSuggestionSelection(snapshot.postSuggestionSelection);
      setShowDraftingProgress(snapshot.showDraftingProgress);
      setShowLinkedInPost(snapshot.showLinkedInPost);
      setShowPostSaveActions(snapshot.showPostSaveActions);
      setPostSaveSelection(snapshot.postSaveSelection);
      setLiaTourSkipMessage(snapshot.liaTourSkipMessage);

      scriptIndexRef.current = snapshot.refs.scriptIndex;
      followUpIndexRef.current = snapshot.refs.followUpIndex;
      flowIndexRef.current = snapshot.refs.flowIndex;
      activeFlowRef.current = snapshot.refs.activeFlow;
      introStartedRef.current = snapshot.refs.introStarted;

      requestAnimationFrame(() => scrollToBottom("auto"));
    },
    [
      agentFlow.id,
      boardChatIntroMessages,
      clearScheduledTimers,
      scrollToBottom,
    ],
  );

  const applyPrototypeStepRef = useRef(applyPrototypeStep);
  applyPrototypeStepRef.current = applyPrototypeStep;

  useEffect(() => {
    if (prototypeStepIndex < ENTRY_PROTOTYPE_STEP_COUNT) return;
    applyPrototypeStepRef.current(prototypeStepIndex);
  }, [prototypeStepIndex]);

  useEffect(() => {
    setWorkspaceBoards(knowledgeBoards);
  }, [knowledgeBoards, setWorkspaceBoards]);

  useEffect(() => {
    return () => setWorkspaceBoards([]);
  }, [setWorkspaceBoards]);

  useEffect(() => {
    if (boardTourStep !== null) {
      setHighlightedTarget(boardTourSteps[boardTourStep]?.target ?? null);
      return;
    }
    setHighlightedTarget(
      tourStep !== null ? TOUR_STEP_TARGETS[tourStep] : null,
    );
  }, [tourStep, boardTourStep, boardTourSteps, setHighlightedTarget]);

  useEffect(() => {
    return () => setHighlightedTarget(null);
  }, [setHighlightedTarget]);

  useEffect(() => {
    return () => {
      setPanelForceOpen(false);
      setBoardHandoffActive(false);
    };
  }, [setPanelForceOpen, setBoardHandoffActive]);

  const handleFlowStreamComplete = useCallback(() => {
    const flow = activeFlowRef.current;
    if (!scanActive || !flow) return;

    const messageId = scanActive.id;
    setScanCompleted((prev) => [...prev, scanActive]);
    setScanActive(null);

    if (flow === "nike-scan" && messageId === "n1") {
      setShowPlanCard(true);
      schedule(
        () => {
          setShowPlanCard(false);
          setShowOpenRolesTable(true);
          setKnowledgeBoards([agentFlow.boardLabels.openItemsBoard]);
          showFlowTypingThenMessage();
        },
        randomBetween(THINKING_ACTION_MIN_MS, THINKING_ACTION_MAX_MS),
      );
      return;
    }

    if (flow === "nike-scan" && messageId === "n2") {
      schedule(
        () => showFlowTypingThenMessage(),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    if (flow === "nike-scan" && messageId === "n3") {
      schedule(
        () => setShowRolePickCard(true),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    if (flow === "nike-scan" && messageId === "n4") {
      schedule(
        () => {
          setShowCandidatesThinking(false);
          setShowCandidatesTable(true);
          setKnowledgeBoards([
            agentFlow.boardLabels.openItemsBoard,
            agentFlow.boardLabels.focusBoard,
          ]);
          showFlowTypingThenMessage();
        },
        randomBetween(THINKING_ACTION_MIN_MS, THINKING_ACTION_MAX_MS),
      );
      return;
    }

    if (flow === "nike-scan" && messageId === "n5") {
      // After the shortlist, Jade asks for feedback before saving anything.
      schedule(
        () => {
          setFeedbackAsk1Visible(true);
          setFeedbackCardRound(1);
          setShowFeedbackCard(true);
        },
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    if (flow === "nike-scan" && messageId === "n6") {
      schedule(
        () => setShowAutomationCard(true),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    if (flow === "nike-scan" && messageId === "n7") {
      schedule(
        () => setShowTeamInviteCard(true),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    if (flow === "nike-scan" && messageId === "n8") {
      schedule(
        () => showFlowTypingThenMessage(),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    if (flow === "nike-scan" && messageId === "n9") {
      schedule(
        () => setShowTourOfferCard(true),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    if (
      flow === "nike-scan" &&
      (messageId === "n10" || messageId === "n11" || messageId === "n12")
    ) {
      // Tour tooltip is showing — wait for the user to click Next or Skip.
      return;
    }

    if (flow === "nike-scan" && messageId === "n13") {
      composerRef.current?.focus();
      return;
    }

    if (flow === "lia-draft" && messageId === "l1") {
      schedule(
        () => showFlowTypingThenMessage(),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    if (flow === "lia-draft" && messageId === "l2") {
      schedule(
        () => setShowTopicCard(true),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    if (flow === "lia-draft" && messageId === "l3") {
      schedule(
        () => setShowPostSuggestionCard(true),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    if (flow === "lia-draft" && messageId === "l4") {
      setShowDraftingProgress(true);
      schedule(
        () => {
          setShowDraftingProgress(false);
          setShowLinkedInPost(true);
          showFlowTypingThenMessage();
        },
        randomBetween(2000, 3000),
      );
      return;
    }

    if (flow === "lia-draft" && messageId === "l5") {
      schedule(
        () => showFlowTypingThenMessage(),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    if (flow === "lia-draft" && messageId === "l6") {
      schedule(
        () => {
          setShowPostSaveActions(true);
          setKnowledgeBoards([agentFlow.boardLabels.mainBoard]);
        },
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    if (flow === "lia-draft" && messageId === "l7") {
      schedule(
        () => setShowAutomationCard(true),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    if (flow === "lia-draft" && messageId === "l8") {
      schedule(
        () => setShowTeamInviteCard(true),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    if (flow === "lia-draft" && messageId === "l9") {
      schedule(
        () => showFlowTypingThenMessage(),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    if (flow === "lia-draft" && messageId === "l10") {
      schedule(
        () => setShowTourOfferCard(true),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    if (
      flow === "lia-draft" &&
      (messageId === "l11" || messageId === "l12" || messageId === "l13")
    ) {
      return;
    }

    if (flow === "lia-draft" && messageId === "l14") {
      composerRef.current?.focus();
      return;
    }

    if (flow === "role-link" && messageId === "l1") {
      setAwaitingRoleLink(true);
      requestAnimationFrame(() => composerRef.current?.focus());
      return;
    }

    if (flow === "role-link" && messageId === "l2") {
      schedule(
        () => showFlowTypingThenMessage(),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    if (flow === "role-link" && messageId === "l3") {
      schedule(
        () => showFlowTypingThenMessage(),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    if (flow === "role-link" && messageId === "l4") {
      setShowCandidatesThinking(true);
      schedule(
        () => {
          setShowCandidatesThinking(false);
          setShowCandidatesTable(true);
          setKnowledgeBoards([agentFlow.boardLabels.focusBoard]);
          showFlowTypingThenMessage();
        },
        randomBetween(THINKING_ACTION_MIN_MS, THINKING_ACTION_MAX_MS),
      );
      return;
    }

    if (flow === "role-link" && messageId === "l5") {
      schedule(
        () => showFlowTypingThenMessage(),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    if (flow === "role-link" && messageId === "l6") {
      schedule(
        () => setShowAutomationCard(true),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    if (flow === "role-link" && messageId === "l7") {
      schedule(
        () => setShowTeamInviteCard(true),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    if (flow === "role-link" && messageId === "l8") {
      schedule(
        () => showFlowTypingThenMessage(),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    if (flow === "role-link" && messageId === "l9") {
      schedule(
        () => setShowTourOfferCard(true),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    if (
      flow === "role-link" &&
      (messageId === "l10" || messageId === "l11" || messageId === "l12")
    ) {
      // Tour tooltip is showing — wait for the user to click Next or Skip.
      return;
    }

    if (flow === "role-link" && messageId === "l13") {
      composerRef.current?.focus();
      return;
    }

    if (flow === "role-search" && messageId === "rq1") {
      setAwaitingRoleQuery(true);
      requestAnimationFrame(() => composerRef.current?.focus());
      return;
    }

    if (flow === "role-search" && messageId === "rq2") {
      schedule(
        () => showFlowTypingThenMessage(),
        randomBetween(SEARCH_ACTION_MIN_MS, SEARCH_ACTION_MAX_MS),
      );
      return;
    }

    if (flow === "role-search" && messageId === "rq3") {
      setShowCandidatesThinking(true);
      schedule(
        () => {
          setShowCandidatesThinking(false);
          setShowCandidatesTable(true);
          setKnowledgeBoards([agentFlow.boardLabels.focusBoard]);
          showFlowTypingThenMessage();
        },
        randomBetween(THINKING_ACTION_MIN_MS, THINKING_ACTION_MAX_MS),
      );
      return;
    }

    if (flow === "role-search" && messageId === "rq4") {
      // After the shortlist, Jade asks for feedback before saving anything.
      schedule(
        () => {
          setFeedbackAsk1Visible(true);
          setFeedbackCardRound(1);
          setShowFeedbackCard(true);
        },
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    if (flow === "role-search" && messageId === "rq5") {
      schedule(
        () => setShowAutomationCard(true),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    if (flow === "role-search" && messageId === "rq6") {
      schedule(
        () => setShowTeamInviteCard(true),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    if (flow === "role-search" && messageId === "rq7") {
      schedule(
        () => showFlowTypingThenMessage(),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    if (flow === "role-search" && messageId === "rq8") {
      schedule(
        () => setShowTourOfferCard(true),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
      return;
    }

    if (
      flow === "role-search" &&
      (messageId === "rq9" || messageId === "rq10" || messageId === "rq11")
    ) {
      // Tour tooltip is showing — wait for the user to click Next or Skip.
      return;
    }

    if (flow === "role-search" && messageId === "rq12") {
      composerRef.current?.focus();
      return;
    }
  }, [agentFlow, scanActive, schedule, showFlowTypingThenMessage]);

  const startNikeScanFlow = useCallback(() => {
    resetHiringFlowUi();
    activeFlowRef.current = "nike-scan";
    setActiveFlow("nike-scan");
    schedule(
      () => showFlowTypingThenMessage(),
      randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
    );
  }, [resetHiringFlowUi, schedule, showFlowTypingThenMessage]);

  const startRoleLinkFlow = useCallback(() => {
    resetHiringFlowUi();
    activeFlowRef.current = "role-link";
    setActiveFlow("role-link");
    schedule(
      () => showFlowTypingThenMessage(),
      randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
    );
  }, [resetHiringFlowUi, schedule, showFlowTypingThenMessage]);

  const startRoleSearchFlow = useCallback(() => {
    resetHiringFlowUi();
    activeFlowRef.current = "role-search";
    setActiveFlow("role-search");
    schedule(
      () => showFlowTypingThenMessage(),
      randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
    );
  }, [resetHiringFlowUi, schedule, showFlowTypingThenMessage]);

  const handleBrandVoiceSelect = useCallback(
    (option: string) => {
      setShowBrandVoiceCard(false);
      setBrandVoiceSelection(option);
      setShowBrandVoiceResearch(true);
      schedule(
        () => {
          setShowBrandVoiceResearch(false);
          activeFlowRef.current = "lia-draft";
          setActiveFlow("lia-draft");
          flowIndexRef.current = 0;
          showFlowTypingThenMessage();
        },
        randomBetween(2000, 3000),
      );
    },
    [schedule, showFlowTypingThenMessage],
  );

  const handleBrandVoiceSkip = useCallback(() => {
    handleBrandVoiceSelect(LIA_BRAND_VOICE_SKIP);
  }, [handleBrandVoiceSelect]);

  const handleTopicSelect = useCallback(
    (option: string) => {
      setShowTopicCard(false);
      setTopicSelection(option);
      const isUnsure =
        option === LIA_TOPIC_UNSURE_MESSAGE ||
        option.toLowerCase().includes("not sure");
      schedule(
        () => {
          if (!isUnsure) {
            flowIndexRef.current += 1;
          }
          showFlowTypingThenMessage();
        },
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
    },
    [schedule, showFlowTypingThenMessage],
  );

  const handlePostSuggestionSelect = useCallback(
    (option: string) => {
      setShowPostSuggestionCard(false);
      setPostSuggestionSelection(option);
      if (option.includes("I love this")) {
        schedule(
          () => showFlowTypingThenMessage(),
          randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
        );
        return;
      }
      composerRef.current?.focus();
    },
    [schedule, showFlowTypingThenMessage],
  );

  const handlePostSaveSelect = useCallback(
    (option: string) => {
      setShowPostSaveActions(false);
      setPostSaveSelection(option);
      setShowCandidatesTable(true);
      schedule(
        () => showFlowTypingThenMessage(),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
    },
    [schedule, showFlowTypingThenMessage],
  );

  const handleRolePickSelect = useCallback(
    (option: string) => {
      setShowRolePickCard(false);
      setRolePickSelection(option);
      setShowCandidatesThinking(true);
      schedule(
        () => showFlowTypingThenMessage(),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
    },
    [schedule, showFlowTypingThenMessage],
  );

  const handleTeamInviteSubmit = useCallback(
    (teammate1: string, teammate2: string) => {
      setShowTeamInviteCard(false);
      const t1 = teammate1.trim();
      const t2 = teammate2.trim();
      const parts: string[] = [];
      if (t1) parts.push(`Teammate 1: ${t1}`);
      if (t2) parts.push(`Teammate 2: ${t2}`);
      setTeamInviteSelection(
        parts.length > 0 ? parts.join(" — ") : TEAM_INVITE_SKIP_LABEL,
      );
      schedule(
        () => showFlowTypingThenMessage(),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
    },
    [schedule, showFlowTypingThenMessage],
  );

  const handleTeamInviteSkip = useCallback(() => {
    setShowTeamInviteCard(false);
    setTeamInviteSelection(TEAM_INVITE_SKIP_LABEL);
    schedule(
      () => showFlowTypingThenMessage(),
      randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
    );
  }, [schedule, showFlowTypingThenMessage]);

  const handleTourOfferSelect = useCallback(
    (option: string) => {
      setShowTourOfferCard(false);
      setTourOfferSelection(option);

      if (option === TOUR_BUTTON_LABEL) {
        setTourStep(0);
        schedule(
          () => showFlowTypingThenMessage(),
          randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
        );
        return;
      }

      setMessage("");
      composerRef.current?.focus();
    },
    [schedule, showFlowTypingThenMessage],
  );

  const handleTourNext = useCallback(() => {
    if (tourStep === null) return;

    const expectedId = getTourMessageId(activeFlowRef.current, tourStep);
    const alreadyShown =
      !!expectedId && scanCompleted.some((entry) => entry.id === expectedId);

    if (!scanActive && !alreadyShown) {
      // The current step's message hasn't appeared in chat yet — ignore the
      // click rather than advancing the tooltip ahead of the conversation.
      return;
    }

    clearScheduledTimers();
    setScanTyping(false);
    setScanPendingMessageId(null);
    if (scanActive) {
      setScanCompleted((prev) => [...prev, scanActive]);
      setScanActive(null);
    }
    setTourStep(tourStep < 2 ? ((tourStep + 1) as 0 | 1 | 2) : null);
    showFlowTypingThenMessage();
  }, [
    tourStep,
    scanActive,
    scanCompleted,
    clearScheduledTimers,
    showFlowTypingThenMessage,
  ]);

  const handleTourSkip = useCallback(() => {
    clearScheduledTimers();
    if (scanActive) {
      setScanCompleted((prev) => [...prev, scanActive]);
      setScanActive(null);
    }
    setScanTyping(false);
    setScanPendingMessageId(null);
    setTourStep(null);
    if (agentFlow.id === "lia") {
      setLiaTourSkipMessage(LIA_DRAFT_MESSAGES.tourSkip);
    }
    composerRef.current?.focus();
  }, [agentFlow.id, clearScheduledTimers, scanActive]);

  const handleAutomationSelect = useCallback(
    (option: string) => {
      setShowAutomationCard(false);
      setAutomationSelection(option);

      if (option === agentFlow.automationDefault) {
        setShowDailyTrigger(true);
        setPanelTab("jobs");
        setKnowledgeBoards(
          activeFlowRef.current === "role-link" ||
            activeFlowRef.current === "role-search"
            ? [agentFlow.boardLabels.focusBoard]
            : activeFlowRef.current === "lia-draft"
              ? [agentFlow.boardLabels.mainBoard]
              : [
                  agentFlow.boardLabels.openItemsBoard,
                  agentFlow.boardLabels.focusBoard,
                ],
        );
        schedule(
          () => {
            setShowDailyTrigger(true);
            setPanelTab("jobs");
            setKnowledgeBoards(
              activeFlowRef.current === "role-link" ||
                activeFlowRef.current === "role-search"
                ? [agentFlow.boardLabels.focusBoard]
                : activeFlowRef.current === "lia-draft"
                  ? [agentFlow.boardLabels.mainBoard]
                  : [
                      agentFlow.boardLabels.openItemsBoard,
                      agentFlow.boardLabels.focusBoard,
                    ],
            );
            schedule(
              () => {
                // After the automated job, the agent explains that work lives in
                // a workspace and board, then offers to show the live board.
                setBoardSaveVisible(true);
                setBoardSaveTyping(true);
                schedule(
                  () => setBoardSaveTyping(false),
                  randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
                );
              },
              randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
            );
          },
          randomBetween(AUTOMATION_SETUP_MIN_MS, AUTOMATION_SETUP_MAX_MS),
        );
        return;
      }

      setMessage(option);
      composerRef.current?.focus();
    },
    [agentFlow.automationDefault, agentFlow.boardLabels, schedule],
  );

  const handleBoardSaveStreamComplete = useCallback(() => {
    setBoardSaveStreamed(true);
    // Guard: the stream-complete callback should only offer the board once.
    if (boardNavStartedRef.current) return;
    boardNavStartedRef.current = true;

    schedule(
      () => setShowBoardOfferCard(true),
      randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
    );
  }, [schedule]);

  const showBoardChatIntroTypingThenMessage = useCallback(() => {
    const next = boardChatIntroMessages[boardChatIntroIndexRef.current];
    if (!next) return;

    setBoardChatIntroTyping(true);
    schedule(
      () => {
        setBoardChatIntroTyping(false);
        setBoardChatIntroActive(next);
        boardChatIntroIndexRef.current += 1;
      },
      randomBetween(TYPING_MIN_MS, TYPING_MAX_MS),
    );
  }, [boardChatIntroMessages, schedule]);

  const handleBoardChatIntroStreamComplete = useCallback(() => {
    if (!boardChatIntroActive) return;

    setBoardChatIntroCompleted((prev) => [...prev, boardChatIntroActive]);
    setBoardChatIntroActive(null);

    if (boardChatIntroIndexRef.current < boardChatIntroMessages.length) {
      schedule(
        () => showBoardChatIntroTypingThenMessage(),
        randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
      );
    }
  }, [
    boardChatIntroActive,
    boardChatIntroMessages.length,
    schedule,
    showBoardChatIntroTypingThenMessage,
  ]);

  const startBoardChatIntro = useCallback(() => {
    if (boardChatIntroStartedRef.current) return;
    if (!boardChatIntroMessages.length) return;
    boardChatIntroStartedRef.current = true;
    showBoardChatIntroTypingThenMessage();
  }, [boardChatIntroMessages.length, showBoardChatIntroTypingThenMessage]);

  const revealBoardChat = useCallback(() => {
    setBoardTourStep(null);
    setHighlightedTarget(null);
    setBoardChatRevealed(true);
    if (agentFlow.boardHandoff.skipTour) {
      startBoardChatIntro();
    }
  }, [
    agentFlow.boardHandoff.skipTour,
    setHighlightedTarget,
    startBoardChatIntro,
  ]);

  const navigateToLiveBoard = useCallback(() => {
    setBoardHandoffActive(false);
    setHighlightedTarget(null);
    setPanelForceOpen(true);
    setBoardChatRevealed(false);
    setBoardTourStep(null);
    setBoardChatIntroCompleted([]);
    setBoardChatIntroActive(null);
    setBoardChatIntroTyping(false);
    boardChatIntroIndexRef.current = 0;
    boardChatIntroStartedRef.current = false;
    setBoardLoading(true);
    setShowBoardView(true);
    schedule(() => {
      setBoardLoading(false);
      if (agentFlow.boardHandoff.skipTour) {
        schedule(
          () => revealBoardChat(),
          randomBetween(
            LIA_BOARD_CHAT_REVEAL_MIN_MS,
            LIA_BOARD_CHAT_REVEAL_MAX_MS,
          ),
        );
      } else {
        // Jade: brief pause, then the board walkthrough before chat opens.
        schedule(() => setBoardTourStep(0), BOARD_CHAT_REVEAL_DELAY_MS);
      }
    }, BOARD_LOAD_MS);
  }, [
    agentFlow.boardHandoff.skipTour,
    revealBoardChat,
    schedule,
    setBoardHandoffActive,
    setHighlightedTarget,
    setPanelForceOpen,
  ]);

  const openBoardChat = useCallback(() => {
    revealBoardChat();
  }, [revealBoardChat]);

  const handleBoardTourNext = useCallback(() => {
    setBoardTourStep((prev) => {
      if (prev === null) return prev;
      if (prev >= boardTourSteps.length - 1) {
        // Last step points at the chat launcher — hand off to the open chat.
        setHighlightedTarget(null);
        setBoardChatRevealed(true);
        return null;
      }
      return prev + 1;
    });
  }, [boardTourSteps.length, setHighlightedTarget]);

  const handleBoardTourSkip = useCallback(() => {
    setBoardTourStep(null);
    setHighlightedTarget(null);
    setBoardChatRevealed(true);
  }, [setHighlightedTarget]);

  const handleFeedbackSelect = useCallback(
    (option: string, round: 1 | 2) => {
      setShowFeedbackCard(false);
      if (round === 1) setFeedbackChoice1(option);
      else setFeedbackChoice2(option);

      if (option === CANDIDATE_FEEDBACK_POSITIVE) {
        // Pleased — resume the scripted flow at the automation ask (n6).
        schedule(
          () => showFlowTypingThenMessage(),
          randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
        );
        return;
      }

      // Adjust / Show more — rerun sourcing, then re-render the refined table
      // and re-ask for feedback.
      setRefineThinking(true);
      schedule(
        () => {
          setRefineThinking(false);
          setRefinedTableVisible(true);
          schedule(
            () => {
              setFeedbackAsk2Visible(true);
              setFeedbackCardRound(2);
              setShowFeedbackCard(true);
            },
            randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
          );
        },
        randomBetween(SEARCH_ACTION_MIN_MS, SEARCH_ACTION_MAX_MS),
      );
    },
    [schedule, showFlowTypingThenMessage],
  );

  const handleOpenLiveBoard = useCallback(() => {
    setShowBoardHandoffTooltip(false);
    setBoardHandoffActive(false);
    setHighlightedTarget(null);
    setPanelForceOpen(false);
    setShowBoardView(true);
  }, [setBoardHandoffActive, setHighlightedTarget, setPanelForceOpen]);

  const handleBoardOfferSelect = useCallback(
    (option: string) => {
      setShowBoardOfferCard(false);
      setBoardOfferChoice(option);

      if (option === agentFlow.boardHandoff.offerPositive) {
        // Take the user straight to the live board (with lazy load + docked chat).
        navigateToLiveBoard();
        return;
      }

      setMessage("");
      composerRef.current?.focus();
    },
    [agentFlow.boardHandoff.offerPositive, navigateToLiveBoard],
  );

  useEffect(() => {
    registerFocusBoardActivate(handleOpenLiveBoard);
    return () => registerFocusBoardActivate(null);
  }, [handleOpenLiveBoard, registerFocusBoardActivate]);

  const startSourcingFlow = useCallback(() => {
    followUpIndexRef.current = 0;
    setFollowUpCompleted([]);
    setFollowUpActive(null);
    setShowGetStartedCard(false);
    schedule(
      () => showFollowUpTypingThenMessage(),
      randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS),
    );
  }, [schedule, showFollowUpTypingThenMessage]);

  const handleFirstActionSelect = useCallback(
    (option: string) => {
      isHeroExitingRef.current = true;
      setIsHeroExiting(true);

      schedule(() => {
        isHeroExitingRef.current = false;
        setIsHeroExiting(false);
        setShowActionCard(false);
        setFirstActionTitleVisible(true);
        setUserSelection(option);
        setMessage("");

        if (option === agentFlow.firstActionDefault) {
          setShowAgentPanel(true);
          startSourcingFlow();
          return;
        }

        setMessage(option);
        composerRef.current?.focus();
      }, HERO_EXIT_DURATION_MS);
    },
    [agentFlow.firstActionDefault, schedule, startSourcingFlow],
  );

  const handleGetStartedSelect = useCallback(
    (option: string) => {
      setShowGetStartedCard(false);
      setGetStartedTitleVisible(true);
      setGetStartedSelection(option);
      setMessage("");

      if (agentFlow.supportsRoleSearch && option === ROLE_SEARCH_USER_MESSAGE) {
        startRoleSearchFlow();
        setAwaitingRoleQuery(true);
        requestAnimationFrame(() => composerRef.current?.focus());
        return;
      }

      if (option === agentFlow.scanFlow.userMessage) {
        startNikeScanFlow();
        return;
      }

      if (agentFlow.supportsRoleLink && option === ROLE_LINK_USER_MESSAGE) {
        startRoleLinkFlow();
        return;
      }

      setMessage(option);
      composerRef.current?.focus();
    },
    [
      agentFlow.scanFlow.userMessage,
      agentFlow.supportsRoleLink,
      agentFlow.supportsRoleSearch,
      startNikeScanFlow,
      startRoleLinkFlow,
      startRoleSearchFlow,
    ],
  );

  const startIntroConversation = useCallback(() => {
    if (introStartedRef.current) return;
    introStartedRef.current = true;
    setConversationStarted(true);
    showTypingThenMessage();
  }, [showTypingThenMessage]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  const scanArtifactVisible =
    activeFlow === "lia-draft"
      ? showLinkedInPost && !!postSaveSelection
      : showCandidatesTable;

  const {
    beforeOpenRolesTable,
    betweenOpenRolesAndCandidates,
    roleLinkCandidatesDone,
    afterCandidatesTable,
    afterDailyTrigger,
  } = splitScanMessagesForArtifacts(
    scanCompleted,
    activeFlow,
    showOpenRolesTable,
    scanArtifactVisible,
  );
  const [teamAskMessage, ...teamFollowupMessages] = afterDailyTrigger;
  const teamInviteAckMessages = teamFollowupMessages.slice(0, 2);
  const tourMessages = teamFollowupMessages.slice(2);
  const scanTurnBeforeOpenRolesTable = isScanTurnBeforeOpenRolesTable(
    activeFlow,
    showOpenRolesTable,
    showCandidatesThinking,
    scanArtifactVisible,
    scanActive,
    scanTyping,
  );
  const scanTurnBetweenOpenRolesAndCandidates =
    isScanTurnBetweenOpenRolesAndCandidates(
      activeFlow,
      showOpenRolesTable,
      showCandidatesTable,
      showCandidatesThinking,
      scanCompleted,
      scanActive,
      scanTyping,
    );
  const scanTurnAfterCandidatesTable = isScanTurnAfterCandidatesTable(
    activeFlow,
    scanArtifactVisible,
    scanCompleted,
    scanActive,
    scanTyping,
  );
  const scanTurnAfterDailyTrigger = isScanTurnAfterDailyTrigger(
    activeFlow,
    scanArtifactVisible,
    scanCompleted,
    scanActive,
    scanTyping,
  );
  const scanTurnRoleLinkCandidatesDone = isScanTurnRoleLinkCandidatesDone(
    activeFlow,
    showCandidatesTable,
    scanCompleted,
    scanActive,
    scanTyping,
  );

  const candidatesGroupTitle =
    agentFlow.id === "jade"
      ? activeFlow === "role-link"
        ? ROLE_LINK_ROLE_NAME
        : activeFlow === "role-search"
          ? findMatchingOpenRole(roleQuery ?? "").name
          : (rolePickSelection ?? agentFlow.focusPickDefault)
      : undefined;

  const layoutClassName = [
    styles.layout,
    showBoardView && styles.layoutBoardStage,
    showBoardView && boardChatRevealed && styles.layoutBoardChatRevealed,
    !showBoardView && showInvitePanel && styles.layoutWithInvitePanel,
  ]
    .filter(Boolean)
    .join(" ");

  const liaDraftStreamingMessageId =
    activeFlow === "lia-draft"
      ? getLiaDraftStreamingMessageId(scanActive, scanPendingMessageId)
      : null;

  const renderLiaDraftScanTurn = (messageId: string) => {
    if (
      !isLiaDraftStreamingTurn(
        liaDraftStreamingMessageId,
        messageId,
        scanTyping,
        scanActive,
      )
    ) {
      return null;
    }

    return (
      <>
        {scanTyping && <TypingIndicator />}
        {scanActive && (
          <ConversationBlock
            message={scanActive}
            streaming
            onStreamComplete={handleFlowStreamComplete}
          />
        )}
      </>
    );
  };

  const conversationMessages = (
    <>
      {completedMessages.map((msg) => (
        <ConversationBlock key={msg.id} message={msg} />
      ))}
      {isTyping && <TypingIndicator />}
      {activeMessage && (
        <ConversationBlock
          message={activeMessage}
          streaming
          onStreamComplete={handleStreamComplete}
        />
      )}
      {firstActionTitleVisible && !showActionCard && (
        <p className={styles.blockHeading}>
          <strong className={styles.blockHeadingText}>
            {agentFlow.firstActionTitle}
          </strong>
        </p>
      )}
      {userSelection && <UserMessage text={userSelection} />}
      {followUpCompleted.map((msg) => (
        <ConversationBlock key={msg.id} message={msg} />
      ))}
      {followUpTyping && <TypingIndicator />}
      {followUpActive && (
        <ConversationBlock
          message={followUpActive}
          streaming
          onStreamComplete={handleFollowUpStreamComplete}
        />
      )}
      {brandVoiceSelection && <UserMessage text={brandVoiceSelection} />}
      {showBrandVoiceResearch && <LiaBrandResearchCard />}
      {getStartedTitleVisible && !showGetStartedCard && (
        <p className={styles.blockHeading}>
          <strong className={styles.blockHeadingText}>
            {agentFlow.getStartedTitle}
          </strong>
        </p>
      )}
      {getStartedSelection && <UserMessage text={getStartedSelection} />}
      {activeFlow === "lia-draft" ? (
        <>
          {scanCompleted
            .filter((msg) => msg.id === "l1" || msg.id === "l2")
            .map((msg) => (
              <ConversationBlock key={msg.id} message={msg} />
            ))}
          {renderLiaDraftScanTurn("l1")}
          {renderLiaDraftScanTurn("l2")}
          {topicSelection && <UserMessage text={topicSelection} />}
          {renderLiaDraftScanTurn("l3")}
          {scanCompleted
            .filter((msg) => msg.id === "l3")
            .map((msg) => (
              <ConversationBlock key={msg.id} message={msg} />
            ))}
          {postSuggestionSelection && (
            <UserMessage text={postSuggestionSelection} />
          )}
          {renderLiaDraftScanTurn("l4")}
          {scanCompleted
            .filter((msg) => msg.id === "l4")
            .map((msg) => (
              <ConversationBlock key={msg.id} message={msg} />
            ))}
          {showDraftingProgress && <LiaDraftingCard />}
          {showLinkedInPost && <LinkedInPostCard />}
          {renderLiaDraftScanTurn("l5")}
          {scanCompleted
            .filter((msg) => msg.id === "l5")
            .map((msg) => (
              <ConversationBlock key={msg.id} message={msg} />
            ))}
          {renderLiaDraftScanTurn("l6")}
          {scanCompleted
            .filter((msg) => msg.id === "l6")
            .map((msg) => (
              <ConversationBlock key={msg.id} message={msg} />
            ))}
          {postSaveSelection && <UserMessage text={postSaveSelection} />}
        </>
      ) : activeFlow === "role-link" ? (
        <>
          {beforeOpenRolesTable
            .filter((msg) => msg.id === "l1")
            .map((msg) => (
              <ConversationBlock key={msg.id} message={msg} />
            ))}
          {scanTurnBeforeOpenRolesTable &&
            scanActive?.id === "l1" &&
            (scanTyping ? (
              <TypingIndicator />
            ) : (
              <ConversationBlock
                message={scanActive}
                streaming
                onStreamComplete={handleFlowStreamComplete}
              />
            ))}
          {roleLinkUrl && <UserLinkMessage url={roleLinkUrl} />}
          {beforeOpenRolesTable
            .filter((msg) => msg.id !== "l1")
            .map((msg) => (
              <ConversationBlock key={msg.id} message={msg} />
            ))}
          {scanTurnBeforeOpenRolesTable &&
            scanActive != null &&
            scanActive.id !== "l1" &&
            (scanTyping ? (
              <TypingIndicator />
            ) : (
              <ConversationBlock
                message={scanActive}
                streaming
                onStreamComplete={handleFlowStreamComplete}
              />
            ))}
        </>
      ) : activeFlow === "role-search" ? (
        <>
          {beforeOpenRolesTable
            .filter((msg) => msg.id === "rq1")
            .map((msg) => (
              <ConversationBlock key={msg.id} message={msg} />
            ))}
          {roleQuery && <UserMessage text={roleQuery} />}
          {beforeOpenRolesTable
            .filter((msg) => msg.id !== "rq1")
            .map((msg) => (
              <ConversationBlock key={msg.id} message={msg} />
            ))}
          {scanTurnBeforeOpenRolesTable && scanTyping && <TypingIndicator />}
          {scanTurnBeforeOpenRolesTable && scanActive && (
            <ConversationBlock
              message={scanActive}
              streaming
              onStreamComplete={handleFlowStreamComplete}
            />
          )}
        </>
      ) : (
        <>
          {beforeOpenRolesTable.map((msg) => (
            <ConversationBlock key={msg.id} message={msg} />
          ))}
          {scanTurnBeforeOpenRolesTable && scanTyping && <TypingIndicator />}
          {scanTurnBeforeOpenRolesTable && scanActive && (
            <ConversationBlock
              message={scanActive}
              streaming
              onStreamComplete={handleFlowStreamComplete}
            />
          )}
        </>
      )}
      {showPlanCard && <PlanInActionCard />}
      {showOpenRolesTable && (
        <OpenRolesTable
          artifact={activeFlow === "nike-scan"}
          rows={
            activeFlow === "role-link" ? ROLE_LINK_OPEN_ROLES_ROWS : undefined
          }
        />
      )}
      {betweenOpenRolesAndCandidates.map((msg) => (
        <ConversationBlock key={msg.id} message={msg} />
      ))}
      {scanTurnBetweenOpenRolesAndCandidates && scanTyping && (
        <TypingIndicator />
      )}
      {scanTurnBetweenOpenRolesAndCandidates && scanActive && (
        <ConversationBlock
          message={scanActive}
          streaming
          onStreamComplete={handleFlowStreamComplete}
        />
      )}
      {rolePickSelection && <UserMessage text={rolePickSelection} />}
      {showCandidatesThinking &&
        (activeFlow === "role-link" ? (
          <RoleLinkThinkingCard />
        ) : (
          <CandidatesThinkingCard />
        ))}
      {(activeFlow === "role-link" ||
        activeFlow === "nike-scan" ||
        activeFlow === "role-search") && (
        <>
          {roleLinkCandidatesDone.map((msg) => (
            <ConversationBlock key={msg.id} message={msg} />
          ))}
          {scanTurnRoleLinkCandidatesDone &&
            (scanTyping ? (
              <TypingIndicator />
            ) : (
              scanActive && (
                <ConversationBlock
                  message={scanActive}
                  streaming
                  onStreamComplete={handleFlowStreamComplete}
                />
              )
            ))}
        </>
      )}
      {showCandidatesTable && activeFlow !== "lia-draft" && (
        <CandidatesTable
          artifact={activeFlow !== null}
          groupTitle={candidatesGroupTitle}
        />
      )}
      {feedbackAsk1Visible && (
        <ConversationBlock message={CANDIDATE_FEEDBACK_SCRIPT_MESSAGE} />
      )}
      {feedbackChoice1 && <UserMessage text={feedbackChoice1} />}
      {refineThinking && <CandidatesThinkingCard />}
      {refinedTableVisible && <RefinedCandidatesTable />}
      {feedbackAsk2Visible && (
        <ConversationBlock message={CANDIDATE_FEEDBACK_SCRIPT_MESSAGE} />
      )}
      {feedbackChoice2 && <UserMessage text={feedbackChoice2} />}
      {afterCandidatesTable.map((msg) => (
        <ConversationBlock key={msg.id} message={msg} />
      ))}
      {scanTurnAfterCandidatesTable && scanTyping && <TypingIndicator />}
      {scanTurnAfterCandidatesTable && scanActive && (
        <ConversationBlock
          message={scanActive}
          streaming
          onStreamComplete={handleFlowStreamComplete}
        />
      )}
      {showDailyTrigger && <DailyTriggerCard />}
      {automationSelection && <UserMessage text={automationSelection} />}
      {boardSaveVisible && boardSaveTyping && <TypingIndicator />}
      {boardSaveVisible && !boardSaveTyping && (
        <ConversationBlock
          message={boardSaveScriptMessage}
          streaming={!boardSaveStreamed}
          onStreamComplete={handleBoardSaveStreamComplete}
        />
      )}
      {boardOfferChoice && <UserMessage text={boardOfferChoice} />}
      {boardChatIntroCompleted.map((msg) => (
        <ConversationBlock key={msg.id} message={msg} />
      ))}
      {boardChatIntroTyping && <TypingIndicator />}
      {boardChatIntroActive && (
        <ConversationBlock
          message={boardChatIntroActive}
          streaming
          onStreamComplete={handleBoardChatIntroStreamComplete}
        />
      )}
      {!boardSaveVisible && teamAskMessage && (
        <ConversationBlock key={teamAskMessage.id} message={teamAskMessage} />
      )}
      {!boardSaveVisible &&
        scanTurnAfterDailyTrigger &&
        !teamInviteSelection &&
        scanTyping && <TypingIndicator />}
      {!boardSaveVisible &&
        scanTurnAfterDailyTrigger &&
        !teamInviteSelection &&
        scanActive && (
          <ConversationBlock
            message={scanActive}
            streaming
            onStreamComplete={handleFlowStreamComplete}
          />
        )}
      {teamInviteSelection && <UserMessage text={teamInviteSelection} />}
      {!boardSaveVisible &&
        teamInviteAckMessages.map((msg) => (
          <ConversationBlock key={msg.id} message={msg} />
        ))}
      {!boardSaveVisible &&
        scanTurnAfterDailyTrigger &&
        teamInviteSelection &&
        !tourOfferSelection &&
        scanTyping && <TypingIndicator />}
      {!boardSaveVisible &&
        scanTurnAfterDailyTrigger &&
        teamInviteSelection &&
        !tourOfferSelection &&
        scanActive && (
          <ConversationBlock
            message={scanActive}
            streaming
            onStreamComplete={handleFlowStreamComplete}
          />
        )}
      {tourOfferSelection && <UserMessage text={tourOfferSelection} />}
      {liaTourSkipMessage && (
        <ConversationBlock
          message={{ id: "lia-tour-skip", text: liaTourSkipMessage }}
        />
      )}
      {!boardSaveVisible &&
        tourMessages.map((msg) => (
          <ConversationBlock key={msg.id} message={msg} />
        ))}
      {!boardSaveVisible &&
        scanTurnAfterDailyTrigger &&
        tourOfferSelection &&
        scanTyping && <TypingIndicator />}
      {!boardSaveVisible &&
        scanTurnAfterDailyTrigger &&
        tourOfferSelection &&
        scanActive && (
          <ConversationBlock
            message={scanActive}
            streaming
            onStreamComplete={handleFlowStreamComplete}
          />
        )}
      {composerMessages.map((text, index) => (
        <UserMessage key={`composer-${index}`} text={text} />
      ))}
    </>
  );

  const composer = (
    <PromptComposer
      composerRef={composerRef}
      placeholder={
        awaitingRoleLink
          ? agentFlow.boardLabels.composerRoleLinkPlaceholder
          : awaitingRoleQuery
            ? agentFlow.boardLabels.composerRoleSearchPlaceholder
            : agentFlow.boardLabels.composerPlaceholder
      }
      message={message}
      hasMessage={hasMessage}
      onMessageChange={setMessage}
      onKeyDown={handleComposerKeyDown}
      onSend={handleComposerSend}
      ariaLabel={`Message ${agentFlow.agentName}`}
    />
  );

  const tourTooltipTexts =
    agentFlow.id === "lia"
      ? [
          LIA_TOUR_TOOLTIPS.agent,
          LIA_TOUR_TOOLTIPS.content,
          LIA_TOUR_TOOLTIPS.focusBoard,
        ]
      : [TOUR_TOOLTIPS.agent, TOUR_TOOLTIPS.content, TOUR_TOOLTIPS.focusBoard];

  const showHeroLayout = !userSelection && composerMessages.length === 0;
  const showAgentIdentityHeader =
    Boolean(userSelection) || composerMessages.length > 0;

  const actionCardDock = showPromptActionCard ? (
    <div
      ref={actionCardDockRef}
      className={`${styles.actionCardDock}${
        isHeroExiting ? ` ${styles.actionCardDockExiting}` : ""
      }`}
    >
      {showActionCard && (
        <ActionCard
          title={agentFlow.firstActionTitle}
          options={agentFlow.actionOptions}
          onSelect={handleFirstActionSelect}
          onClose={() => setShowActionCard(false)}
        />
      )}
      {showGetStartedCard && (
        <ActionCard
          title={agentFlow.getStartedTitle}
          options={agentFlow.getStartedOptions}
          onSelect={handleGetStartedSelect}
        />
      )}
      {showBrandVoiceCard && (
        <BrandVoiceCard
          onSelect={handleBrandVoiceSelect}
          onSkip={handleBrandVoiceSkip}
        />
      )}
      {showTopicCard && (
        <ActionCard
          title={LIA_TOPIC_TITLE}
          options={LIA_TOPIC_OPTIONS}
          onSelect={handleTopicSelect}
          customFieldDefaultValue={LIA_TOPIC_UNSURE_MESSAGE}
        />
      )}
      {showPostSuggestionCard && (
        <LiaChipCard
          options={LIA_POST_SUGGESTION_OPTIONS}
          onSelect={handlePostSuggestionSelect}
        />
      )}
      {showPostSaveActions && (
        <PostSaveActionsCard
          options={LIA_POST_SAVE_OPTIONS}
          onSelect={handlePostSaveSelect}
        />
      )}
      {showRolePickCard && (
        <ActionCard
          title={agentFlow.scanFlow.focusTitle}
          options={agentFlow.scanFlow.focusOptions}
          onSelect={handleRolePickSelect}
        />
      )}
      {showAutomationCard && (
        <ActionCard
          title={automationCardTitle}
          options={agentFlow.scanFlow.automationOptions}
          onSelect={handleAutomationSelect}
        />
      )}
      {showFeedbackCard && (
        <ActionCard
          options={CANDIDATE_FEEDBACK_OPTIONS}
          onSelect={(option) => handleFeedbackSelect(option, feedbackCardRound)}
        />
      )}
      {showBoardOfferCard && (
        <ActionCard
          options={agentFlow.boardHandoff.offerOptions}
          onSelect={handleBoardOfferSelect}
        />
      )}
      {showTeamInviteCard && (
        <TeamInviteCard
          onSubmit={handleTeamInviteSubmit}
          onSkip={handleTeamInviteSkip}
        />
      )}
      {showTourOfferCard && <TourOfferCard onSelect={handleTourOfferSelect} />}
    </div>
  ) : null;

  return (
    <div
      className={`${styles.root} ${showBoardView ? styles.rootBoardStage : ""}`}
      data-board-stage={showBoardView || undefined}
    >
      <div className={layoutClassName}>
        {showBoardView ? (
          <>
            <div
              ref={innerRef}
              className={`${styles.boardColumn} ${styles.boardColumnEntering}`}
            >
              <div className={styles.boardLayoutInner}>
                <CandidatesBoardView />
              </div>
              {boardLoading && (
                <div className={styles.boardLoadingOverlay} aria-hidden="true">
                  <span className={styles.boardLoadingShimmer} />
                  <img
                    className={styles.boardLoadingSpinner}
                    src={mondayLoaderGif}
                    alt=""
                  />
                </div>
              )}
            </div>
            {boardChatRevealed && (
              <JadeChatPanel
                className={styles.jadeChatPanelEnter}
                messagesRef={scrollRef}
                chatContentRef={chatContentRef}
                scrollEndRef={scrollEndRef}
                composerRef={composerRef}
                message={message}
                hasMessage={hasMessage}
                awaitingRoleLink={awaitingRoleLink}
                awaitingRoleQuery={awaitingRoleQuery}
                onMessageChange={setMessage}
                onKeyDown={handleComposerKeyDown}
                onSend={handleComposerSend}
              >
                {conversationStarted && (
                  <div className={styles.conversation}>
                    {conversationMessages}
                  </div>
                )}
                {showInvitePanel && (
                  <div className={styles.jadeChatInviteBlock}>
                    <p className={styles.jadeChatInviteTitle}>
                      {invitePanelTitle}
                    </p>
                    <InviteMembersCard />
                  </div>
                )}
              </JadeChatPanel>
            )}
            {!boardChatRevealed && (
              <button
                type="button"
                className={`${styles.agentLauncher} ${
                  boardTourStep !== null &&
                  boardTourSteps[boardTourStep]?.target === "agent-launcher"
                    ? styles.agentLauncherHighlight
                    : ""
                }`}
                data-tour-target="agent-launcher"
                aria-label={`Open chat with ${agentFlow.agentName}`}
                onClick={openBoardChat}
              >
                <img
                  className={styles.agentLauncherAvatar}
                  src={agentFlow.assets.avatar}
                  alt=""
                  aria-hidden="true"
                />
              </button>
            )}
            {boardTourStep !== null && (
              <BoardTourTooltip
                step={boardTourSteps[boardTourStep]}
                stepIndex={boardTourStep}
                totalSteps={boardTourSteps.length}
                avatarSrc={agentFlow.assets.avatar}
                agentName={agentFlow.agentName}
                isLastStep={boardTourStep === boardTourSteps.length - 1}
                onNext={handleBoardTourNext}
                onSkip={handleBoardTourSkip}
              />
            )}
          </>
        ) : (
          <>
            <div className={styles.mainColumn}>
              <div className={styles.stageGradientTop} aria-hidden="true" />
              <div className={styles.stageGradientBottom} aria-hidden="true" />
              {tourStep !== null && (
                <TourSpotlightTooltip
                  targetSelector={TOUR_STEP_TARGETS[tourStep]}
                  text={tourTooltipTexts[tourStep]}
                  isLastStep={tourStep === 2}
                  onNext={handleTourNext}
                  onSkip={handleTourSkip}
                />
              )}
              {showBoardHandoffTooltip && (
                <TourSpotlightTooltip
                  targetSelector="focus-board"
                  text="Here's your live Candidates board — click it to open the full list and see everyone I've sourced."
                  isLastStep
                  onNext={handleOpenLiveBoard}
                  onSkip={() => {
                    setShowBoardHandoffTooltip(false);
                    setBoardHandoffActive(false);
                    setHighlightedTarget(null);
                    setPanelForceOpen(false);
                  }}
                />
              )}
              <div ref={innerRef} className={styles.inner}>
                {showAgentIdentityHeader && (
                  <div className={styles.agentIdentityHeader}>
                    <span className={styles.agentIdentityAvatar}>
                      <img
                        className={styles.agentIdentityAvatarImage}
                        src={agentFlow.assets.avatar}
                        alt=""
                        aria-hidden="true"
                      />
                    </span>
                    <p className={styles.agentIdentityName}>
                      {agentFlow.agentName}, {agentFlow.agentRole}
                    </p>
                  </div>
                )}
                <div ref={scrollRef} className={styles.chatScroll}>
                  <div ref={chatContentRef} className={styles.chatContent}>
                    {(showHeroLayout || isHeroExiting) && (
                      <div
                        className={`${styles.hero}${
                          isHeroExiting ? ` ${styles.heroExiting}` : ""
                        }`}
                      >
                        <HeroMedia onIntroReady={startIntroConversation} />
                      </div>
                    )}

                    {(showHeroLayout || showAgentIdentityHeader) && (
                      <h1 className={styles.greeting}>
                        {agentFlow.heroGreeting}
                      </h1>
                    )}

                    {conversationStarted && (
                      <div className={styles.conversation}>
                        {conversationMessages}
                      </div>
                    )}
                    <div
                      ref={scrollEndRef}
                      className={styles.scrollAnchor}
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {showPromptActionCard ? actionCardDock : composer}
              </div>
            </div>

            {showInvitePanel && (
              <aside
                className={styles.boardInvitePanel}
                aria-label="Invite teammates"
              >
                <p className={styles.boardInviteTitle}>{invitePanelTitle}</p>
                <InviteMembersCard />
              </aside>
            )}
          </>
        )}
      </div>
    </div>
  );
}
