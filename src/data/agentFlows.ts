import jadePortrait from "../assets/agents-onboarding/jade.png";
import jadeAvatar from "../assets/agents-onboarding/jade-avatar.png";
import jadeHeroPoster from "../assets/agents-onboarding/jade-hero-poster.png";
import jadeHeroIntro from "../assets/agents-onboarding/jade-hero-intro.png";
import jadeAgentFull from "../assets/agents-onboarding/jade-agent-full.png";
import jadeSelectionCard from "../assets/agents-onboarding/jade-selection-card.png";
import liaPortrait from "../assets/agents-onboarding/lia.png";
import liaAvatar from "../assets/agents-onboarding/lia-avatar.png";
import liaHeroPoster from "../assets/agents-onboarding/lia-hero-poster.png";
import liaAgentFull from "../assets/agents-onboarding/lia-agent-full.png";
import liaSelectionCard from "../assets/agents-onboarding/lia-selection-card.png";
import generalAdCard from "../assets/agents-onboarding/general-ad-card.png";
import generalSignupVisual from "../assets/agents-onboarding/general-signup-visual.png";
import jadeSignupVisual from "../assets/recruiting-onboarding/signup-visual.png";
import liaSignupVisual from "../assets/recruiting-onboarding/lia-signup-visual.png";
import {
  AGENT_LOADING_MESSAGES,
  JADE_LOADING_MESSAGES,
  LIA_LOADING_MESSAGES,
} from "../utils/agentLoaderAnimation";
import * as jadeScanFlow from "./nikeScanFlow";
import type { BoardTourStep } from "./nikeScanFlow";
import * as liaScanFlow from "./liaSocialFlow";
import type { AgentJobIcon, BoardTableGroup } from "./nikeScanFlow";
import { ROLE_LINK_USER_MESSAGE } from "./roleLinkFlow";
import { publicAssetUrl } from "../utils/publicAssetUrl";

export type AgentFlowId = "jade" | "lia" | "general";

export interface AgentFlowScriptMessage {
  id: string;
  text: string;
  paragraphActions?: Record<number, string>;
  paragraphIllustrations?: Record<number, string>;
  paragraphBoardChips?: Record<number, string>;
}

export interface AgentScanFlowData {
  userMessage: string;
  messages: {
    scanning: string;
    rolesFound: string;
    roleFocus: string;
    sourcingIntro: string;
    candidatesDone: string;
    automationAsk: string;
    teamAsk: string;
    inviteDone: string;
    tourOffer: string;
  };
  script: readonly AgentFlowScriptMessage[];
  focusTitle: string;
  focusOptions: readonly string[];
  automationOptions: readonly string[];
  dailyTriggerJob: {
    name: string;
    schedule: string;
    title: string;
    description: string;
    workspaceName: string;
  };
  agentJobs: readonly {
    id: string;
    icon: AgentJobIcon;
    schedule: string;
    title: string;
    description: string;
    enabled: boolean;
  }[];
  plan: {
    summary: string;
    steps: readonly {
      stepId: string;
      blockName: string;
      purpose: string;
    }[];
  };
  contentSteps: readonly { id: string; label: string }[];
  campaignRows: readonly {
    name: string;
    location: string;
    level: string;
  }[];
  postRows: readonly {
    name: string;
    location: string;
    level: string;
    role: string;
    notes: string;
  }[];
  boardTableGroups: readonly BoardTableGroup[];
  jobTriggers: readonly {
    id: string;
    title: string;
    subtitle: string;
    enabled: boolean;
  }[];
}

export interface AgentFlowConfig {
  id: AgentFlowId;
  selectionTitle: string;
  selectionDescription: string;
  agentName: string;
  agentRole: string;
  workspaceLabel: string;
  assets: {
    portrait: string;
    avatar: string;
    heroPoster: string;
    heroIntro: string;
    agentFull: string;
    selectionCard: string;
    videoSrc?: string;
  };
  landing: {
    heroTitleLine1: string;
    heroTitleLine2: string;
    heroSubtitle: string;
    featureText: string;
    pipelineHeader: string;
    pipelineGroup: string;
    pipelineStatusLabel: string;
    pipelineSampleName: string;
    pipelineSampleRole: string;
  };
  signup: {
    tagline: string;
    visual: string;
  };
  loading: {
    messages:
      | typeof AGENT_LOADING_MESSAGES
      | typeof JADE_LOADING_MESSAGES
      | typeof LIA_LOADING_MESSAGES;
  };
  heroGreeting: string;
  videoPlayingCopy: string;
  onboardingScript: readonly AgentFlowScriptMessage[];
  sourcingScript: readonly AgentFlowScriptMessage[];
  firstActionTitle: string;
  getStartedTitle: string;
  onboardingReturnLines: readonly [string, string];
  actionOptions: readonly string[];
  getStartedOptions: readonly string[];
  firstActionDefault: string;
  focusPickDefault: string;
  automationDefault: string;
  supportsRoleLink: boolean;
  supportsRoleSearch: boolean;
  scanFlow: AgentScanFlowData;
  boardLabels: {
    resultsTitle: string;
    resultsGroupTitle: string;
    openItemsBoard: string;
    focusBoard: string;
    mainBoard: string;
    composerPlaceholder: string;
    composerRoleLinkPlaceholder: string;
    composerRoleSearchPlaceholder: string;
  };
  boardHandoff: {
    saveMessage: string;
    offerOptions: readonly string[];
    offerPositive: string;
    tourSteps: readonly BoardTourStep[];
    /** When true, skip the board walkthrough and reveal chat after a delay. */
    skipTour?: boolean;
    /** Agent messages streamed in chat after the board opens (used with skipTour). */
    chatIntroMessages?: readonly AgentFlowScriptMessage[];
  };
}

const JADE_SCAN: AgentScanFlowData = {
  userMessage: jadeScanFlow.NIKE_SCAN_USER_MESSAGE,
  messages: jadeScanFlow.NIKE_SCAN_MESSAGES,
  script: jadeScanFlow.NIKE_SCAN_SCRIPT,
  focusTitle: jadeScanFlow.ROLE_PICK_TITLE,
  focusOptions: jadeScanFlow.ROLE_PICK_OPTIONS,
  automationOptions: jadeScanFlow.AUTOMATION_OPTIONS,
  dailyTriggerJob: jadeScanFlow.DAILY_TRIGGER_JOB,
  agentJobs: jadeScanFlow.AGENT_JOBS,
  plan: jadeScanFlow.NIKE_SCAN_PLAN,
  contentSteps: jadeScanFlow.SOURCING_STEPS,
  campaignRows: jadeScanFlow.OPEN_ROLES_ROWS,
  postRows: jadeScanFlow.CANDIDATE_ROWS,
  boardTableGroups: jadeScanFlow.BOARD_TABLE_GROUPS,
  jobTriggers: jadeScanFlow.JOB_TRIGGERS,
};

const LIA_SCAN: AgentScanFlowData = {
  userMessage: liaScanFlow.LIA_SOCIAL_USER_MESSAGE,
  messages: liaScanFlow.LIA_SOCIAL_MESSAGES,
  script: liaScanFlow.LIA_DRAFT_SCRIPT,
  focusTitle: liaScanFlow.LIA_FOCUS_TITLE,
  focusOptions: liaScanFlow.LIA_FOCUS_OPTIONS,
  automationOptions: liaScanFlow.LIA_AUTOMATION_OPTIONS,
  dailyTriggerJob: liaScanFlow.LIA_DAILY_TRIGGER_JOB,
  agentJobs: liaScanFlow.LIA_AGENT_JOBS,
  plan: liaScanFlow.LIA_SOCIAL_PLAN,
  contentSteps: liaScanFlow.LIA_CONTENT_STEPS,
  campaignRows: liaScanFlow.LIA_CAMPAIGN_ROWS,
  postRows: liaScanFlow.LIA_POST_ROWS,
  boardTableGroups: liaScanFlow.LIA_BOARD_TABLE_GROUPS,
  jobTriggers: liaScanFlow.LIA_JOB_TRIGGERS,
};

export const AGENT_FLOWS: Record<AgentFlowId, AgentFlowConfig> = {
  jade: {
    id: "jade",
    selectionTitle: "AI Recruiting",
    selectionDescription: "AI Recruiter / Talent Acquisition flow",
    agentName: "Jade",
    agentRole: "Recruiting Agent",
    workspaceLabel: "Ohad's Hiring S...",
    assets: {
      portrait: jadePortrait,
      avatar: jadeAvatar,
      heroPoster: jadeHeroPoster,
      heroIntro: jadeHeroIntro,
      agentFull: jadeAgentFull,
      videoSrc: publicAssetUrl("agents-onboarding/jade-hero.mp4"),
      selectionCard: jadeSelectionCard,
    },
    landing: {
      heroTitleLine1: "Your team makes every hire.",
      heroTitleLine2: "AI just clears the path.",
      heroSubtitle:
        "Recruiting agents handle sourcing, screening, and scheduling. Your team approves every candidate who moves forward.",
      featureText:
        "Screens candidates instantly and surfaces the best fits by automatically scoring experience, skills, and role alignment.",
      pipelineHeader: "Candidate pipeline",
      pipelineGroup: "⌄ AI sourced",
      pipelineStatusLabel: "AI screened",
      pipelineSampleName: "Jamie Lancaster",
      pipelineSampleRole: "Representative",
    },
    signup: {
      tagline: "Your first shortlist of candidates, ready in minutes",
      visual: jadeSignupVisual,
    },
    loading: {
      messages: JADE_LOADING_MESSAGES,
    },
    heroGreeting: "Hi Ohad 👋 I'm Jade — your new recruiting teammate.",
    videoPlayingCopy:
      "I'm Jade, your recruiting agent. I find candidates, screen resumes, and rank the best fits for your open roles. Let's get to work.",
    onboardingScript: [
      {
        id: "m1",
        text: "I handle the sourcing legwork so you and the rest of the team at nike.com can focus on the candidates that matter.",
      },
      {
        id: "m2",
        text: "Every hire stays yours. I act when you ask, everything I do is visible and reversible, and you can redirect me at any time.",
      },
    ],
    sourcingScript: [
      {
        id: "s1",
        text: "Got it — I'll handle sourcing so you can focus on the hire. To find the right candidates, I need to know what you're hiring for.",
      },
    ],
    firstActionTitle: "What's the first thing you'd like me to do?",
    getStartedTitle:
      "Let's find your next hire. Which role should I start with?",
    onboardingReturnLines: [
      "Hire a specific role",
      "Find qualified candidates",
    ],
    actionOptions: [
      "Find qualified candidates",
      "Screen and rank applicants",
      "Describe it in your own words",
    ],
    getStartedOptions: [
      jadeScanFlow.ROLE_SEARCH_USER_MESSAGE,
      ROLE_LINK_USER_MESSAGE,
      "I'll describe the role here",
    ],
    firstActionDefault: "Find qualified candidates",
    focusPickDefault: "3D Footwear Designer",
    automationDefault: "Find new candidates daily",
    supportsRoleLink: true,
    supportsRoleSearch: true,
    scanFlow: JADE_SCAN,
    boardLabels: {
      resultsTitle: "Candidates",
      resultsGroupTitle: "Candidates",
      openItemsBoard: "Open Roles",
      focusBoard: "Candidates",
      mainBoard: "Candidates",
      composerPlaceholder: "Message Jade...",
      composerRoleLinkPlaceholder: "Paste the role link...",
      composerRoleSearchPlaceholder:
        "e.g. Senior Digital Product Designer or REQ-1042",
    },
    boardHandoff: {
      saveMessage: jadeScanFlow.BOARD_SAVE_MESSAGE,
      offerOptions: jadeScanFlow.BOARD_OFFER_OPTIONS,
      offerPositive: jadeScanFlow.BOARD_OFFER_POSITIVE,
      tourSteps: jadeScanFlow.BOARD_TOUR_STEPS,
    },
  },
  lia: {
    id: "lia",
    selectionTitle: "AI Social Media Agent",
    selectionDescription: "Social Media Agent flow",
    agentName: "Lia",
    agentRole: "Social Media Agent",
    workspaceLabel: "Ohad's Marketing Space",
    assets: {
      portrait: liaPortrait,
      avatar: liaAvatar,
      heroPoster: liaHeroPoster,
      heroIntro: liaHeroPoster,
      agentFull: liaAgentFull,
      videoSrc: publicAssetUrl("agents-onboarding/lia-hero.mp4"),
      selectionCard: liaSelectionCard,
    },
    landing: {
      heroTitleLine1: "Your team sets the strategy.",
      heroTitleLine2: "AI keeps the content flowing.",
      heroSubtitle:
        "Social media agents draft posts, schedule content, and track performance. Your team approves every message that goes live.",
      featureText:
        "Drafts on-brand posts instantly and surfaces the best ideas by analyzing trends, campaign goals, and channel performance.",
      pipelineHeader: "Content calendar",
      pipelineGroup: "⌄ AI drafted",
      pipelineStatusLabel: "Ready to review",
      pipelineSampleName: "Launch day hero reel",
      pipelineSampleRole: "Spring Product Launch",
    },
    signup: {
      tagline: "Your first week of social content, ready in minutes",
      visual: liaSignupVisual,
    },
    loading: {
      messages: LIA_LOADING_MESSAGES,
    },
    heroGreeting: "Hi Ohad 👋 I'm Lia — your new social media teammate.",
    videoPlayingCopy:
      "I'm Lia, your social media agent. I draft posts, plan campaigns, and keep your channels active — in your brand voice, on your schedule. Let's get to work.",
    onboardingScript: [
      {
        id: "m1",
        text: "I handle the content legwork so you and the rest of the team at nike.com can focus on the content that matters.",
      },
      {
        id: "m2",
        text: "Every post stays yours. I act when you ask, everything I do is visible and reversible, and you can redirect me at any time.",
      },
    ],
    sourcingScript: [
      {
        id: "s1",
        text: liaScanFlow.LIA_DRAFT_MESSAGES.draftIntro,
      },
      {
        id: "s2",
        text: liaScanFlow.LIA_DRAFT_MESSAGES.questionsIntro,
      },
    ],
    firstActionTitle: "What's the first thing I can help you with?",
    getStartedTitle: "How would you like to get started?",
    onboardingReturnLines: ["Draft social content", "Plan a content calendar"],
    actionOptions: [
      liaScanFlow.LIA_FIRST_ACTION_DEFAULT,
      "Plan a content calendar",
      "Describe it in your own words",
    ],
    getStartedOptions: [
      liaScanFlow.LIA_FIRST_ACTION_DEFAULT,
      "I'll add a link to a campaign brief",
      "Add a content brief",
    ],
    firstActionDefault: liaScanFlow.LIA_FIRST_ACTION_DEFAULT,
    focusPickDefault: "Spring Product Launch",
    automationDefault: "Draft new posts daily",
    supportsRoleLink: false,
    supportsRoleSearch: false,
    scanFlow: LIA_SCAN,
    boardLabels: {
      resultsTitle: "My first AI agent at work",
      resultsGroupTitle: "LinkedIn posts",
      openItemsBoard: "Active Campaigns",
      focusBoard: "Social Media Content",
      mainBoard: "Social Media Content",
      composerPlaceholder: "Message Lia...",
      composerRoleLinkPlaceholder: "Paste the campaign link...",
      composerRoleSearchPlaceholder: "Paste the campaign brief link...",
    },
    boardHandoff: {
      saveMessage: liaScanFlow.LIA_BOARD_SAVE_MESSAGE,
      offerOptions: liaScanFlow.LIA_BOARD_OFFER_OPTIONS,
      offerPositive: liaScanFlow.LIA_BOARD_OFFER_POSITIVE,
      tourSteps: liaScanFlow.LIA_BOARD_TOUR_STEPS,
      skipTour: true,
      chatIntroMessages: liaScanFlow.LIA_BOARD_CHAT_INTRO_MESSAGES,
    },
  },
  // Broad "build AI agents" campaign. Unlike Jade/Lia, this flow does not open a
  // single agent conversation — after signup + loading it hands off to the agent
  // template gallery, where the user picks a use case (Jade/Lia route live, the
  // rest are demo cards). Conversation-only fields below reuse Jade's values as
  // inert placeholders because this flow never renders AgentsOnboardingView.
  general: {
    id: "general",
    selectionTitle: "General AI Agents",
    selectionDescription: "Broad AI agents campaign → template gallery flow",
    agentName: "monday agents",
    agentRole: "AI Agents",
    workspaceLabel: "Ohad's Space",
    assets: {
      portrait: jadePortrait,
      avatar: jadeAvatar,
      heroPoster: jadeHeroPoster,
      heroIntro: jadeHeroIntro,
      agentFull: jadeAgentFull,
      selectionCard: generalAdCard,
    },
    landing: {
      heroTitleLine1: "Your unlimited",
      heroTitleLine2: "AI workforce.",
      heroSubtitle:
        "Build AI agents for any team — recruiting, marketing, sales, support, and more. Your team stays in control of every action.",
      featureText:
        "Deploy ready-made agents in minutes, or describe a job in your own words and let monday build the agent for you.",
      pipelineHeader: "Your agents",
      pipelineGroup: "⌄ Active agents",
      pipelineStatusLabel: "Ready",
      pipelineSampleName: "Recruiting agent",
      pipelineSampleRole: "Talent acquisition",
    },
    signup: {
      tagline: "Your first agent, ready in minutes",
      visual: generalSignupVisual,
    },
    loading: {
      messages: AGENT_LOADING_MESSAGES,
    },
    heroGreeting: "Hi Ohad 👋 Let's build your first AI agent.",
    videoPlayingCopy:
      "We're monday agents — an unlimited AI workforce for your team. Pick a use case to get started.",
    onboardingScript: [
      {
        id: "m1",
        text: "I handle the legwork so you and your team can focus on the work that matters.",
      },
    ],
    sourcingScript: [
      {
        id: "s1",
        text: "Got it — let's get started.",
      },
    ],
    firstActionTitle: "What's the first thing you'd like me to do?",
    getStartedTitle: "How would you like to get started?",
    onboardingReturnLines: [
      "Hire a specific role",
      "Find qualified candidates",
    ],
    actionOptions: [
      "Find qualified candidates",
      "Screen and rank applicants",
      "Describe it in your own words",
    ],
    getStartedOptions: [
      jadeScanFlow.ROLE_SEARCH_USER_MESSAGE,
      ROLE_LINK_USER_MESSAGE,
      "I'll describe the role here",
    ],
    firstActionDefault: "Find qualified candidates",
    focusPickDefault: "3D Footwear Designer",
    automationDefault: "Find new candidates daily",
    supportsRoleLink: false,
    supportsRoleSearch: false,
    scanFlow: JADE_SCAN,
    boardLabels: {
      resultsTitle: "Candidates",
      resultsGroupTitle: "Candidates",
      openItemsBoard: "Open Roles",
      focusBoard: "Candidates",
      mainBoard: "Candidates",
      composerPlaceholder: "Message your agent...",
      composerRoleLinkPlaceholder: "Paste the role link...",
      composerRoleSearchPlaceholder: "e.g. Senior Digital Product Designer",
    },
    boardHandoff: {
      saveMessage: jadeScanFlow.BOARD_SAVE_MESSAGE,
      offerOptions: jadeScanFlow.BOARD_OFFER_OPTIONS,
      offerPositive: jadeScanFlow.BOARD_OFFER_POSITIVE,
      tourSteps: jadeScanFlow.BOARD_TOUR_STEPS,
    },
  },
};

export const AGENT_FLOW_LIST = [
  AGENT_FLOWS.jade,
  AGENT_FLOWS.lia,
  AGENT_FLOWS.general,
] as const;

export function getAgentFlow(flowId: AgentFlowId): AgentFlowConfig {
  return AGENT_FLOWS[flowId];
}
