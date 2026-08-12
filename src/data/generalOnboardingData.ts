const posterFrom = (videoUrl: string) => videoUrl.replace(/\.mp4$/, ".jpg");

const DAN_MANUAL_MUTE_VIDEO =
  "https://dapulse-res.cloudinary.com/video/upload/v1785420416/monday_platform/AI%20agents/avatar_videos/Dan_12282824407_manual-mute-20260730/Dan_1x1_from_16x9_manual-mute-20260730.mp4";
const RUBY_VIDEO =
  "https://dapulse-res.cloudinary.com/video/upload/v1785398074/monday_platform/AI%20agents/avatar_videos/Ruby_12282820970_20260730-105428/Ruby_1x1_from_16x9_20260730-105428.mp4";
const STELLA_VIDEO =
  "https://dapulse-res.cloudinary.com/video/upload/v1785400061/monday_platform/AI%20agents/avatar_videos/Stella_12282808152_20260730-112736/Stella_1x1_from_16x9_20260730-112736.mp4";
const MORGAN_VIDEO =
  "https://dapulse-res.cloudinary.com/video/upload/v1785418116/monday_platform/AI%20agents/avatar_videos/Morgan_12282834524_20260730-162830/Morgan_1x1_from_16x9_20260730-162830.mp4";
const KELLY_VIDEO =
  "https://dapulse-res.cloudinary.com/video/upload/v1785398084/monday_platform/AI%20agents/avatar_videos/Kelly_12282814399_20260730-105428/Kelly_1x1_from_16x9_20260730-105428.mp4";
const ABIGAIL_VIDEO =
  "https://dapulse-res.cloudinary.com/video/upload/v1785398082/monday_platform/AI%20agents/avatar_videos/Abigail_12282823624_20260730-105428/Abigail_1x1_from_16x9_20260730-105428.mp4";

export interface GeneralFocusOption {
  id: string;
  title: string;
  description: string;
}

export interface GeneralAgentCard {
  id: string;
  agentName: string;
  title: string;
  description: string;
  tags: string[];
  bg: string;
  video: string;
  poster: string;
  /** When set, selecting this card hands off to that live agent flow. */
  flowId?: "lia" | "jade";
}

export const GENERAL_FOCUS_OPTIONS: readonly GeneralFocusOption[] = [
  {
    id: "projects",
    title: "Projects & delivery",
    description: "Timelines, tasks, team coordination",
  },
  {
    id: "sales",
    title: "Sales & CRM",
    description: "Leads, deals, customer relationships",
  },
  {
    id: "people",
    title: "People & recruiting",
    description: "Hiring, onboarding, HR processes",
  },
  {
    id: "marketing",
    title: "Marketing & content",
    description: "Campaigns, launches, creative work",
  },
  {
    id: "dev",
    title: "Dev & product",
    description: "Sprints, bugs, roadmap planning",
  },
  {
    id: "ops",
    title: "Ops & finance",
    description: "Processes, budgets, reporting",
  },
  {
    id: "design",
    title: "Design & Creative",
    description: "Projects, feedback, delivery",
  },
  {
    id: "it",
    title: "IT",
    description: "Requests, assets, incidents",
  },
] as const;

export const GENERAL_DEFAULT_FOCUS_ID = "marketing";

const AGENT_CARD_BACKGROUND = "#FFB691";

const LIA_AGENT_CARD: GeneralAgentCard = {
  id: "lia",
  agentName: "Dan",
  title: "Competitive Intel Research",
  description:
    "I'll track competitors and surface insights, no manual digging.",
  tags: [],
  bg: AGENT_CARD_BACKGROUND,
  video: DAN_MANUAL_MUTE_VIDEO,
  poster: posterFrom(DAN_MANUAL_MUTE_VIDEO),
  flowId: "lia",
};

const PROJECTS_AGENT_CARDS: GeneralAgentCard[] = [
  LIA_AGENT_CARD,
  {
    id: "ship-product",
    agentName: "Stella",
    title: "Ship a product",
    description: "Coordinates milestones, owners, and launch follow-ups.",
    tags: ["Marketing", "HR"],
    bg: AGENT_CARD_BACKGROUND,
    video: STELLA_VIDEO,
    poster: posterFrom(STELLA_VIDEO),
  },
  {
    id: "marketing-campaign",
    agentName: "Ruby",
    title: "Run a marketing campaign",
    description: "Builds campaign plans, tracks assets, and nudges approvals.",
    tags: ["Intake", "Triage"],
    bg: AGENT_CARD_BACKGROUND,
    video: RUBY_VIDEO,
    poster: posterFrom(RUBY_VIDEO),
    flowId: "lia",
  },
  {
    id: "close-deals",
    agentName: "Morgan",
    title: "Close more deals",
    description: "Prioritizes opportunities and keeps deal next steps clear.",
    tags: ["Drafting", "Contracts"],
    bg: AGENT_CARD_BACKGROUND,
    video: MORGAN_VIDEO,
    poster: posterFrom(MORGAN_VIDEO),
  },
  {
    id: "deliver-projects",
    agentName: "Kelly",
    title: "Deliver client projects",
    description: "Tracks deliverables, risks, and client updates in one place.",
    tags: ["Reporting", "Visibility"],
    bg: AGENT_CARD_BACKGROUND,
    video: KELLY_VIDEO,
    poster: posterFrom(KELLY_VIDEO),
  },
  {
    id: "manage-team",
    agentName: "Abigail",
    title: "Manage my team's work",
    description: "Keeps team priorities, handoffs, and blockers up to date.",
    tags: ["Compliance", "Growth"],
    bg: AGENT_CARD_BACKGROUND,
    video: ABIGAIL_VIDEO,
    poster: posterFrom(ABIGAIL_VIDEO),
  },
];

const MARKETING_AGENT_CARDS: GeneralAgentCard[] = [
  LIA_AGENT_CARD,
  {
    id: "marketing-campaign",
    agentName: "Stella",
    title: "Social Media Image Maker",
    description:
      "I'll generate on-brand graphics ready for any platform you post on.",
    tags: ["Social", "Content"],
    bg: AGENT_CARD_BACKGROUND,
    video: STELLA_VIDEO,
    poster: posterFrom(STELLA_VIDEO),
    flowId: "lia",
  },
  {
    id: "content-calendar",
    agentName: "Ruby",
    title: "Ad Creative Generator",
    description:
      "I'll turn your campaign brief into ready-to-test ad creatives - paired copy and visuals.",
    tags: ["Scheduling", "Drafts"],
    bg: AGENT_CARD_BACKGROUND,
    video: RUBY_VIDEO,
    poster: posterFrom(RUBY_VIDEO),
    flowId: "lia",
  },
  {
    id: "launch-campaign",
    agentName: "Morgan",
    title: "Brand Voice Writer",
    description:
      "I'll rewrite your drafts to match your brand's tone, vocabulary, and style.",
    tags: ["Creative", "Channels"],
    bg: AGENT_CARD_BACKGROUND,
    video: MORGAN_VIDEO,
    poster: posterFrom(MORGAN_VIDEO),
    flowId: "lia",
  },
  {
    id: "brand-voice",
    agentName: "Kelly",
    title: "Image Creator & Editor",
    description:
      "I'll create and edit visuals from a text prompt or your existing images, instantly.",
    tags: ["Review", "Guidelines"],
    bg: AGENT_CARD_BACKGROUND,
    video: KELLY_VIDEO,
    poster: posterFrom(KELLY_VIDEO),
    flowId: "lia",
  },
  {
    id: "social-reporting",
    agentName: "Abigail",
    title: "Landing Page Wireframes",
    description:
      "I'll turn your brief into wireframes and layouts you can build on.",
    tags: ["Analytics", "Insights"],
    bg: AGENT_CARD_BACKGROUND,
    video: ABIGAIL_VIDEO,
    poster: posterFrom(ABIGAIL_VIDEO),
    flowId: "lia",
  },
];

export function getFocusLabel(focusId: string): string {
  return (
    GENERAL_FOCUS_OPTIONS.find((option) => option.id === focusId)?.title ??
    "Marketing & content"
  );
}

export function getAgentCardsForFocus(focusId: string): GeneralAgentCard[] {
  if (focusId === "marketing") {
    return MARKETING_AGENT_CARDS;
  }
  return PROJECTS_AGENT_CARDS;
}
