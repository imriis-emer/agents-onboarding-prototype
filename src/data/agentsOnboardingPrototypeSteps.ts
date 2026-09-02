import { getAgentFlow, type AgentFlowId } from "./agentFlows";
import {
  LIA_BRAND_VOICE_OPTIONS,
  LIA_POST_SAVE_OPTIONS,
  LIA_TOPIC_UNSURE_MESSAGE,
} from "./liaSocialFlow";
import { BOARD_OFFER_POSITIVE } from "./nikeScanFlow";
import { LIA_BOARD_OFFER_POSITIVE } from "./liaSocialFlow";

export type HiringFlow =
  | "nike-scan"
  | "role-link"
  | "role-search"
  | "lia-draft";

export interface PrototypeScriptMessage {
  id: string;
  text: string;
}

export interface PrototypeStepRefs {
  scriptIndex: number;
  followUpIndex: number;
  flowIndex: number;
  activeFlow: HiringFlow | null;
  introStarted: boolean;
}

export interface PrototypeStepState {
  message: string;
  conversationStarted: boolean;
  completedMessages: PrototypeScriptMessage[];
  activeMessage: PrototypeScriptMessage | null;
  isTyping: boolean;
  showActionCard: boolean;
  firstActionTitleVisible: boolean;
  userSelection: string | null;
  showAgentPanel: boolean;
  followUpCompleted: PrototypeScriptMessage[];
  followUpActive: PrototypeScriptMessage | null;
  followUpTyping: boolean;
  showGetStartedCard: boolean;
  getStartedTitleVisible: boolean;
  getStartedSelection: string | null;
  panelTab: "brain" | "jobs" | "channels" | "activity";
  agentPanelCollapsed: boolean;
  knowledgeBoards: string[];
  scanCompleted: PrototypeScriptMessage[];
  scanActive: PrototypeScriptMessage | null;
  scanTyping: boolean;
  showPlanCard: boolean;
  showOpenRolesTable: boolean;
  showRolePickCard: boolean;
  rolePickSelection: string | null;
  showSourcingProgress: boolean;
  showCandidatesThinking: boolean;
  showCandidatesTable: boolean;
  showAutomationCard: boolean;
  automationSelection: string | null;
  showTeamInviteCard: boolean;
  teamInviteSelection: string | null;
  showTourOfferCard: boolean;
  tourOfferSelection: string | null;
  tourStep: 0 | 1 | 2 | null;
  showDailyTrigger: boolean;
  boardSaveVisible: boolean;
  showBoardOfferCard: boolean;
  boardOfferChoice: string | null;
  boardTourStep: number | null;
  showBoardView: boolean;
  boardChatRevealed: boolean;
  boardChatIntroDone: boolean;
  showInvitePanel: boolean;
  activeFlow: HiringFlow | null;
  roleLinkUrl: string | null;
  isVideoPlaying: boolean;
  showBrandVoiceCard: boolean;
  brandVoiceSelection: string | null;
  showBrandVoiceResearch: boolean;
  showTopicCard: boolean;
  topicSelection: string | null;
  showPostSuggestionCard: boolean;
  postSuggestionSelection: string | null;
  showDraftingProgress: boolean;
  showLinkedInPost: boolean;
  showPostSaveActions: boolean;
  postSaveSelection: string | null;
  liaTourSkipMessage: string | null;
  refs: PrototypeStepRefs;
}

export const ENTRY_PROTOTYPE_STEPS = [
  { id: "flow-select", label: "Flow select" },
  { id: "website", label: "Website" },
  { id: "signup", label: "Signup" },
  { id: "agent-selection", label: "Agent selection" },
  { id: "account-creating", label: "Creating account" },
  { id: "loading", label: "Loading" },
] as const;

export const GENERAL_ENTRY_PROTOTYPE_STEPS = [
  { id: "website", label: "Website" },
  { id: "signup", label: "Signup" },
  { id: "account-form", label: "Account form" },
  { id: "focus-question", label: "Focus question" },
  { id: "solution-selection", label: "Solution selection" },
] as const;

export const JADE_ONBOARDING_PROTOTYPE_STEPS = [
  { id: "hero", label: "Hero" },
  { id: "intro", label: "Intro" },
  { id: "first-action", label: "First action" },
  { id: "get-started", label: "Get started" },
  { id: "scanning", label: "Scanning" },
  { id: "plan", label: "Plan" },
  { id: "open-roles", label: "Open roles" },
  { id: "role-pick", label: "Role pick" },
  { id: "sourcing", label: "Sourcing" },
  { id: "candidates-thinking", label: "Finding candidates" },
  { id: "candidates", label: "Candidates" },
  { id: "automation", label: "Automation" },
  { id: "daily-trigger", label: "Daily trigger" },
  { id: "board-message", label: "Board message" },
  { id: "board-offer", label: "Board offer" },
  { id: "board-tour", label: "Board tour" },
  { id: "board-chat", label: "Board chat" },
] as const;

export const LIA_ONBOARDING_PROTOTYPE_STEPS = [
  { id: "hero", label: "Hero" },
  { id: "intro", label: "Intro" },
  { id: "first-action", label: "First action" },
  { id: "brand-voice", label: "Brand voice" },
  { id: "research", label: "Research" },
  { id: "topic", label: "Topic" },
  { id: "suggestion", label: "Suggestion" },
  { id: "drafting", label: "Drafting" },
  { id: "post", label: "Post" },
  { id: "save", label: "Save to board" },
  { id: "automation", label: "Automation" },
  { id: "daily-trigger", label: "Daily trigger" },
  { id: "board-message", label: "Board message" },
  { id: "board-offer", label: "Board offer" },
  { id: "board-chat", label: "Board chat" },
] as const;

export const GENERAL_ONBOARDING_PROTOTYPE_STEPS = [] as const;

/** @deprecated Use getPrototypeSteps(flowId) for flow-aware step lists. */
export const ONBOARDING_PROTOTYPE_STEPS = JADE_ONBOARDING_PROTOTYPE_STEPS;

export const ENTRY_PROTOTYPE_STEP_COUNT = ENTRY_PROTOTYPE_STEPS.length;

/** @deprecated Use getPrototypeSteps(flowId) for flow-aware step lists. */
export const PROTOTYPE_STEPS = [
  ...ENTRY_PROTOTYPE_STEPS,
  ...JADE_ONBOARDING_PROTOTYPE_STEPS,
] as const;

export function getEntryPrototypeSteps(flowId: AgentFlowId) {
  return flowId === "general"
    ? GENERAL_ENTRY_PROTOTYPE_STEPS
    : ENTRY_PROTOTYPE_STEPS;
}

export function getEntryPrototypeStepCount(flowId: AgentFlowId) {
  return getEntryPrototypeSteps(flowId).length;
}

export function getPrototypeSteps(flowId: AgentFlowId) {
  const entrySteps = getEntryPrototypeSteps(flowId);
  const onboardingSteps =
    flowId === "lia"
      ? LIA_ONBOARDING_PROTOTYPE_STEPS
      : flowId === "general"
        ? GENERAL_ONBOARDING_PROTOTYPE_STEPS
        : JADE_ONBOARDING_PROTOTYPE_STEPS;
  return [...entrySteps, ...onboardingSteps];
}

export type PrototypeStepId =
  | (typeof ENTRY_PROTOTYPE_STEPS)[number]["id"]
  | (typeof GENERAL_ENTRY_PROTOTYPE_STEPS)[number]["id"]
  | (typeof JADE_ONBOARDING_PROTOTYPE_STEPS)[number]["id"]
  | (typeof LIA_ONBOARDING_PROTOTYPE_STEPS)[number]["id"]
  | (typeof GENERAL_ONBOARDING_PROTOTYPE_STEPS)[number]["id"];

function getFlowPrototypeData(flowId: AgentFlowId) {
  const flow = getAgentFlow(flowId);
  return {
    onboardingScript: flow.onboardingScript.map((message) => ({ ...message })),
    sourcingScript: flow.sourcingScript.map((message) => ({ ...message })),
    firstAction: flow.firstActionDefault,
    focusPick: flow.focusPickDefault,
    getStartedSelection: flow.scanFlow.userMessage,
    automationSelection: flow.automationDefault,
    openItemsBoard: flow.boardLabels.openItemsBoard,
    focusBoard: flow.boardLabels.focusBoard,
    mainBoard: flow.boardLabels.mainBoard,
    scanScript: flow.scanFlow.script,
  };
}

function scanSlice(
  count: number,
  script: readonly PrototypeScriptMessage[],
): PrototypeScriptMessage[] {
  return script.slice(0, count).map((message) => ({ ...message }));
}

function emptyState(): PrototypeStepState {
  return {
    message: "",
    conversationStarted: false,
    completedMessages: [],
    activeMessage: null,
    isTyping: false,
    showActionCard: false,
    firstActionTitleVisible: false,
    userSelection: null,
    showAgentPanel: false,
    followUpCompleted: [],
    followUpActive: null,
    followUpTyping: false,
    showGetStartedCard: false,
    getStartedTitleVisible: false,
    getStartedSelection: null,
    panelTab: "brain",
    agentPanelCollapsed: false,
    knowledgeBoards: [],
    scanCompleted: [],
    scanActive: null,
    scanTyping: false,
    showPlanCard: false,
    showOpenRolesTable: false,
    showRolePickCard: false,
    rolePickSelection: null,
    showSourcingProgress: false,
    showCandidatesThinking: false,
    showCandidatesTable: false,
    showAutomationCard: false,
    automationSelection: null,
    showTeamInviteCard: false,
    teamInviteSelection: null,
    showTourOfferCard: false,
    tourOfferSelection: null,
    tourStep: null,
    showDailyTrigger: false,
    boardSaveVisible: false,
    showBoardOfferCard: false,
    boardOfferChoice: null,
    boardTourStep: null,
    showBoardView: false,
    boardChatRevealed: false,
    boardChatIntroDone: false,
    showInvitePanel: false,
    activeFlow: null,
    roleLinkUrl: null,
    isVideoPlaying: false,
    showBrandVoiceCard: false,
    brandVoiceSelection: null,
    showBrandVoiceResearch: false,
    showTopicCard: false,
    topicSelection: null,
    showPostSuggestionCard: false,
    postSuggestionSelection: null,
    showDraftingProgress: false,
    showLinkedInPost: false,
    showPostSaveActions: false,
    postSaveSelection: null,
    liaTourSkipMessage: null,
    refs: {
      scriptIndex: 0,
      followUpIndex: 0,
      flowIndex: 0,
      activeFlow: null,
      introStarted: false,
    },
  };
}

function withHiringBase(
  state: PrototypeStepState,
  flowId: AgentFlowId,
): PrototypeStepState {
  const flowData = getFlowPrototypeData(flowId);

  return {
    ...state,
    conversationStarted: true,
    completedMessages: [...flowData.onboardingScript],
    firstActionTitleVisible: true,
    userSelection: flowData.firstAction,
    showAgentPanel: true,
    followUpCompleted: [...flowData.sourcingScript],
    getStartedTitleVisible: true,
    getStartedSelection: flowData.getStartedSelection,
    activeFlow: "nike-scan",
    refs: {
      scriptIndex: flowData.onboardingScript.length,
      followUpIndex: flowData.sourcingScript.length,
      flowIndex: 0,
      activeFlow: "nike-scan",
      introStarted: true,
    },
  };
}

function withLiaBase(
  state: PrototypeStepState,
  flowId: AgentFlowId,
): PrototypeStepState {
  const flowData = getFlowPrototypeData(flowId);

  return {
    ...state,
    conversationStarted: true,
    completedMessages: [...flowData.onboardingScript],
    firstActionTitleVisible: true,
    userSelection: flowData.firstAction,
    showAgentPanel: true,
    followUpCompleted: [...flowData.sourcingScript],
    activeFlow: "lia-draft",
    refs: {
      scriptIndex: flowData.onboardingScript.length,
      followUpIndex: flowData.sourcingScript.length,
      flowIndex: 0,
      activeFlow: "lia-draft",
      introStarted: true,
    },
  };
}

function sharedIntroState(
  flowId: AgentFlowId,
  options: { showActionCard?: boolean } = {},
): PrototypeStepState {
  const flowData = getFlowPrototypeData(flowId);
  return {
    ...emptyState(),
    conversationStarted: true,
    completedMessages: [...flowData.onboardingScript],
    showActionCard: options.showActionCard ?? false,
    refs: {
      scriptIndex: flowData.onboardingScript.length,
      followUpIndex: 0,
      flowIndex: 0,
      activeFlow: null,
      introStarted: true,
    },
  };
}

function getLiaPrototypeStepState(
  stepId: (typeof LIA_ONBOARDING_PROTOTYPE_STEPS)[number]["id"],
  flowId: AgentFlowId,
): PrototypeStepState {
  const flowData = getFlowPrototypeData(flowId);
  const brandVoiceSelection = LIA_BRAND_VOICE_OPTIONS[0];
  const postSuggestionSelection = "I love this, let's do it";
  const postSaveSelection = LIA_POST_SAVE_OPTIONS[0];
  const teamInviteSelection =
    "Teammate 1: tom@nike.com — Teammate 2: mike@nike.com";

  switch (stepId) {
    case "hero":
      return emptyState();

    case "intro":
      return sharedIntroState(flowId);

    case "first-action":
      return sharedIntroState(flowId, { showActionCard: true });

    case "brand-voice":
      return {
        ...withLiaBase(emptyState(), flowId),
        showBrandVoiceCard: true,
      };

    case "research":
      return {
        ...withLiaBase(emptyState(), flowId),
        brandVoiceSelection,
        showBrandVoiceResearch: true,
      };

    case "topic":
      return {
        ...withLiaBase(emptyState(), flowId),
        brandVoiceSelection,
        scanCompleted: scanSlice(2, flowData.scanScript),
        showTopicCard: true,
        refs: {
          scriptIndex: flowData.onboardingScript.length,
          followUpIndex: flowData.sourcingScript.length,
          flowIndex: 2,
          activeFlow: "lia-draft",
          introStarted: true,
        },
      };

    case "suggestion":
      return {
        ...withLiaBase(emptyState(), flowId),
        brandVoiceSelection,
        scanCompleted: scanSlice(3, flowData.scanScript),
        topicSelection: LIA_TOPIC_UNSURE_MESSAGE,
        showPostSuggestionCard: true,
        refs: {
          scriptIndex: flowData.onboardingScript.length,
          followUpIndex: flowData.sourcingScript.length,
          flowIndex: 3,
          activeFlow: "lia-draft",
          introStarted: true,
        },
      };

    case "drafting":
      return {
        ...withLiaBase(emptyState(), flowId),
        brandVoiceSelection,
        scanCompleted: scanSlice(3, flowData.scanScript),
        topicSelection: LIA_TOPIC_UNSURE_MESSAGE,
        postSuggestionSelection,
        showDraftingProgress: true,
        refs: {
          scriptIndex: flowData.onboardingScript.length,
          followUpIndex: flowData.sourcingScript.length,
          flowIndex: 4,
          activeFlow: "lia-draft",
          introStarted: true,
        },
      };

    case "post":
      return {
        ...withLiaBase(emptyState(), flowId),
        brandVoiceSelection,
        scanCompleted: scanSlice(5, flowData.scanScript),
        topicSelection: LIA_TOPIC_UNSURE_MESSAGE,
        postSuggestionSelection,
        showLinkedInPost: true,
        refs: {
          scriptIndex: flowData.onboardingScript.length,
          followUpIndex: flowData.sourcingScript.length,
          flowIndex: 5,
          activeFlow: "lia-draft",
          introStarted: true,
        },
      };

    case "save":
      return {
        ...withLiaBase(emptyState(), flowId),
        brandVoiceSelection,
        scanCompleted: scanSlice(6, flowData.scanScript),
        topicSelection: LIA_TOPIC_UNSURE_MESSAGE,
        postSuggestionSelection,
        showLinkedInPost: true,
        showPostSaveActions: true,
        knowledgeBoards: [flowData.mainBoard],
        refs: {
          scriptIndex: flowData.onboardingScript.length,
          followUpIndex: flowData.sourcingScript.length,
          flowIndex: 6,
          activeFlow: "lia-draft",
          introStarted: true,
        },
      };

    case "automation":
      return {
        ...withLiaBase(emptyState(), flowId),
        brandVoiceSelection,
        scanCompleted: scanSlice(6, flowData.scanScript),
        topicSelection: LIA_TOPIC_UNSURE_MESSAGE,
        postSuggestionSelection,
        postSaveSelection,
        showLinkedInPost: true,
        showCandidatesTable: true,
        showAutomationCard: true,
        knowledgeBoards: [flowData.mainBoard],
        refs: {
          scriptIndex: flowData.onboardingScript.length,
          followUpIndex: flowData.sourcingScript.length,
          flowIndex: 7,
          activeFlow: "lia-draft",
          introStarted: true,
        },
      };

    case "daily-trigger":
      return {
        ...withLiaBase(emptyState(), flowId),
        brandVoiceSelection,
        scanCompleted: scanSlice(7, flowData.scanScript),
        topicSelection: LIA_TOPIC_UNSURE_MESSAGE,
        postSuggestionSelection,
        postSaveSelection,
        showLinkedInPost: true,
        showCandidatesTable: true,
        showDailyTrigger: true,
        automationSelection: flowData.automationSelection,
        panelTab: "jobs",
        knowledgeBoards: [flowData.mainBoard],
        refs: {
          scriptIndex: flowData.onboardingScript.length,
          followUpIndex: flowData.sourcingScript.length,
          flowIndex: 7,
          activeFlow: "lia-draft",
          introStarted: true,
        },
      };

    case "board-message":
      return {
        ...withLiaBase(emptyState(), flowId),
        brandVoiceSelection,
        scanCompleted: scanSlice(7, flowData.scanScript),
        topicSelection: LIA_TOPIC_UNSURE_MESSAGE,
        postSuggestionSelection,
        postSaveSelection,
        showLinkedInPost: true,
        showCandidatesTable: true,
        showDailyTrigger: true,
        automationSelection: flowData.automationSelection,
        panelTab: "jobs",
        boardSaveVisible: true,
        knowledgeBoards: [flowData.mainBoard],
        refs: {
          scriptIndex: flowData.onboardingScript.length,
          followUpIndex: flowData.sourcingScript.length,
          flowIndex: 7,
          activeFlow: "lia-draft",
          introStarted: true,
        },
      };

    case "board-offer":
      return {
        ...withLiaBase(emptyState(), flowId),
        brandVoiceSelection,
        scanCompleted: scanSlice(7, flowData.scanScript),
        topicSelection: LIA_TOPIC_UNSURE_MESSAGE,
        postSuggestionSelection,
        postSaveSelection,
        showLinkedInPost: true,
        showCandidatesTable: true,
        showDailyTrigger: true,
        automationSelection: flowData.automationSelection,
        panelTab: "jobs",
        boardSaveVisible: true,
        showBoardOfferCard: true,
        knowledgeBoards: [flowData.mainBoard],
        refs: {
          scriptIndex: flowData.onboardingScript.length,
          followUpIndex: flowData.sourcingScript.length,
          flowIndex: 7,
          activeFlow: "lia-draft",
          introStarted: true,
        },
      };

    case "board-chat":
      return {
        ...withLiaBase(emptyState(), flowId),
        brandVoiceSelection,
        scanCompleted: scanSlice(7, flowData.scanScript),
        topicSelection: LIA_TOPIC_UNSURE_MESSAGE,
        postSuggestionSelection,
        postSaveSelection,
        showLinkedInPost: true,
        showCandidatesTable: true,
        showDailyTrigger: true,
        automationSelection: flowData.automationSelection,
        panelTab: "jobs",
        boardSaveVisible: true,
        boardOfferChoice: LIA_BOARD_OFFER_POSITIVE,
        showBoardView: true,
        boardChatRevealed: true,
        boardChatIntroDone: true,
        knowledgeBoards: [flowData.mainBoard],
        refs: {
          scriptIndex: flowData.onboardingScript.length,
          followUpIndex: flowData.sourcingScript.length,
          flowIndex: 7,
          activeFlow: "lia-draft",
          introStarted: true,
        },
      };

    default:
      return emptyState();
  }
}

export function getPrototypeStepState(
  stepIndex: number,
  flowId: AgentFlowId = "jade",
): PrototypeStepState {
  const onboardingIndex = stepIndex - getEntryPrototypeStepCount(flowId);
  if (onboardingIndex < 0) return emptyState();

  // The general flow hands off to the template gallery instead of a
  // conversation, so it has no per-step conversation state.
  if (flowId === "general") return emptyState();

  const onboardingSteps =
    flowId === "lia"
      ? LIA_ONBOARDING_PROTOTYPE_STEPS
      : JADE_ONBOARDING_PROTOTYPE_STEPS;
  const step = onboardingSteps[onboardingIndex];
  if (!step) return emptyState();

  if (flowId === "lia") {
    return getLiaPrototypeStepState(
      step.id as (typeof LIA_ONBOARDING_PROTOTYPE_STEPS)[number]["id"],
      flowId,
    );
  }

  const flowData = getFlowPrototypeData(flowId);

  switch (step.id) {
    case "hero":
      return emptyState();

    case "intro":
      return sharedIntroState(flowId);

    case "first-action":
      return sharedIntroState(flowId, { showActionCard: true });

    case "get-started":
      return {
        ...withHiringBase(emptyState(), flowId),
        showGetStartedCard: true,
      };

    case "scanning":
      return {
        ...withHiringBase(emptyState(), flowId),
        scanCompleted: scanSlice(1, flowData.scanScript),
        refs: {
          scriptIndex: flowData.onboardingScript.length,
          followUpIndex: flowData.sourcingScript.length,
          flowIndex: 1,
          activeFlow: "nike-scan",
          introStarted: true,
        },
      };

    case "plan":
      return {
        ...withHiringBase(emptyState(), flowId),
        scanCompleted: scanSlice(1, flowData.scanScript),
        showPlanCard: true,
        refs: {
          scriptIndex: flowData.onboardingScript.length,
          followUpIndex: flowData.sourcingScript.length,
          flowIndex: 1,
          activeFlow: "nike-scan",
          introStarted: true,
        },
      };

    case "open-roles":
      return {
        ...withHiringBase(emptyState(), flowId),
        scanCompleted: scanSlice(3, flowData.scanScript),
        showOpenRolesTable: true,
        knowledgeBoards: [flowData.openItemsBoard],
        refs: {
          scriptIndex: flowData.onboardingScript.length,
          followUpIndex: flowData.sourcingScript.length,
          flowIndex: 3,
          activeFlow: "nike-scan",
          introStarted: true,
        },
      };

    case "role-pick":
      return {
        ...withHiringBase(emptyState(), flowId),
        scanCompleted: scanSlice(3, flowData.scanScript),
        showOpenRolesTable: true,
        showRolePickCard: true,
        knowledgeBoards: [flowData.openItemsBoard],
        refs: {
          scriptIndex: flowData.onboardingScript.length,
          followUpIndex: flowData.sourcingScript.length,
          flowIndex: 3,
          activeFlow: "nike-scan",
          introStarted: true,
        },
      };

    case "sourcing":
      return {
        ...withHiringBase(emptyState(), flowId),
        scanCompleted: scanSlice(4, flowData.scanScript),
        showOpenRolesTable: true,
        rolePickSelection: flowData.focusPick,
        showCandidatesThinking: true,
        knowledgeBoards: [flowData.openItemsBoard],
        refs: {
          scriptIndex: flowData.onboardingScript.length,
          followUpIndex: flowData.sourcingScript.length,
          flowIndex: 4,
          activeFlow: "nike-scan",
          introStarted: true,
        },
      };

    case "candidates-thinking":
      return {
        ...withHiringBase(emptyState(), flowId),
        scanCompleted: scanSlice(4, flowData.scanScript),
        showOpenRolesTable: true,
        rolePickSelection: flowData.focusPick,
        showCandidatesThinking: true,
        knowledgeBoards: [flowData.openItemsBoard],
        refs: {
          scriptIndex: flowData.onboardingScript.length,
          followUpIndex: flowData.sourcingScript.length,
          flowIndex: 4,
          activeFlow: "nike-scan",
          introStarted: true,
        },
      };

    case "candidates":
      return {
        ...withHiringBase(emptyState(), flowId),
        scanCompleted: scanSlice(5, flowData.scanScript),
        showOpenRolesTable: true,
        rolePickSelection: flowData.focusPick,
        showCandidatesTable: true,
        knowledgeBoards: [flowData.openItemsBoard, flowData.focusBoard],
        refs: {
          scriptIndex: flowData.onboardingScript.length,
          followUpIndex: flowData.sourcingScript.length,
          flowIndex: 5,
          activeFlow: "nike-scan",
          introStarted: true,
        },
      };

    case "automation":
      return {
        ...withHiringBase(emptyState(), flowId),
        scanCompleted: scanSlice(6, flowData.scanScript),
        showOpenRolesTable: true,
        rolePickSelection: flowData.focusPick,
        showCandidatesTable: true,
        showAutomationCard: true,
        knowledgeBoards: [flowData.openItemsBoard, flowData.focusBoard],
        refs: {
          scriptIndex: flowData.onboardingScript.length,
          followUpIndex: flowData.sourcingScript.length,
          flowIndex: 6,
          activeFlow: "nike-scan",
          introStarted: true,
        },
      };

    case "daily-trigger":
      return {
        ...withHiringBase(emptyState(), flowId),
        scanCompleted: scanSlice(6, flowData.scanScript),
        showOpenRolesTable: true,
        rolePickSelection: flowData.focusPick,
        showCandidatesTable: true,
        showDailyTrigger: true,
        automationSelection: flowData.automationSelection,
        panelTab: "jobs",
        knowledgeBoards: [flowData.openItemsBoard, flowData.focusBoard],
        refs: {
          scriptIndex: flowData.onboardingScript.length,
          followUpIndex: flowData.sourcingScript.length,
          flowIndex: 6,
          activeFlow: "nike-scan",
          introStarted: true,
        },
      };

    case "board-message":
      return {
        ...withHiringBase(emptyState(), flowId),
        scanCompleted: scanSlice(6, flowData.scanScript),
        showOpenRolesTable: true,
        rolePickSelection: flowData.focusPick,
        showCandidatesTable: true,
        showDailyTrigger: true,
        automationSelection: flowData.automationSelection,
        panelTab: "jobs",
        boardSaveVisible: true,
        knowledgeBoards: [flowData.openItemsBoard, flowData.focusBoard],
        refs: {
          scriptIndex: flowData.onboardingScript.length,
          followUpIndex: flowData.sourcingScript.length,
          flowIndex: 6,
          activeFlow: "nike-scan",
          introStarted: true,
        },
      };

    case "board-offer":
      return {
        ...withHiringBase(emptyState(), flowId),
        scanCompleted: scanSlice(6, flowData.scanScript),
        showOpenRolesTable: true,
        rolePickSelection: flowData.focusPick,
        showCandidatesTable: true,
        showDailyTrigger: true,
        automationSelection: flowData.automationSelection,
        panelTab: "jobs",
        boardSaveVisible: true,
        showBoardOfferCard: true,
        knowledgeBoards: [flowData.openItemsBoard, flowData.focusBoard],
        refs: {
          scriptIndex: flowData.onboardingScript.length,
          followUpIndex: flowData.sourcingScript.length,
          flowIndex: 6,
          activeFlow: "nike-scan",
          introStarted: true,
        },
      };

    case "board-tour":
      return {
        ...withHiringBase(emptyState(), flowId),
        scanCompleted: scanSlice(6, flowData.scanScript),
        showOpenRolesTable: true,
        rolePickSelection: flowData.focusPick,
        showCandidatesTable: true,
        showDailyTrigger: true,
        automationSelection: flowData.automationSelection,
        panelTab: "jobs",
        boardSaveVisible: true,
        boardOfferChoice: BOARD_OFFER_POSITIVE,
        showBoardView: true,
        boardTourStep: 1,
        knowledgeBoards: [flowData.openItemsBoard, flowData.focusBoard],
        refs: {
          scriptIndex: flowData.onboardingScript.length,
          followUpIndex: flowData.sourcingScript.length,
          flowIndex: 6,
          activeFlow: "nike-scan",
          introStarted: true,
        },
      };

    case "board-chat":
      return {
        ...withHiringBase(emptyState(), flowId),
        scanCompleted: scanSlice(6, flowData.scanScript),
        showOpenRolesTable: true,
        rolePickSelection: flowData.focusPick,
        showCandidatesTable: true,
        showDailyTrigger: true,
        automationSelection: flowData.automationSelection,
        panelTab: "jobs",
        boardSaveVisible: true,
        boardOfferChoice: BOARD_OFFER_POSITIVE,
        showBoardView: true,
        boardChatRevealed: true,
        knowledgeBoards: [flowData.openItemsBoard, flowData.focusBoard],
        refs: {
          scriptIndex: flowData.onboardingScript.length,
          followUpIndex: flowData.sourcingScript.length,
          flowIndex: 6,
          activeFlow: "nike-scan",
          introStarted: true,
        },
      };

    default:
      return emptyState();
  }
}
