import type { AgentFlowId } from "./agentFlows";
import hrInterviewCutout from "../assets/agents-onboarding/flow-selection/hr-interview-coordinator-cutout.png";
import hrResumeACutout from "../assets/agents-onboarding/flow-selection/hr-resume-screening-a-cutout.png";
import hrResumeBCutout from "../assets/agents-onboarding/flow-selection/hr-resume-screening-b-cutout.png";

export interface FlowAgentSelectionCard {
  id: string;
  agentName: string;
  title: string;
  description: string;
  image: string;
  imagePosition?: string;
  /** When true, image already includes the white label — don't overlay title. */
  composed?: boolean;
}

export interface FlowAgentSelectionConfig {
  title: string;
  subtitle: string;
  panelBackground: string;
  cardBackground: string;
  cards: FlowAgentSelectionCard[];
}

const HR_CARDS: FlowAgentSelectionCard[] = [
  {
    id: "interview-coordinator",
    agentName: "Courtney",
    title: "Interview Coordinator",
    description:
      "Schedules interviews, sends reminders, and keeps candidates moving.",
    image: hrInterviewCutout,
    imagePosition: "center top",
  },
  {
    id: "resume-screening-a",
    agentName: "Max",
    title: "Resume Screening",
    description: "Reviews resumes, scores fit, and highlights top candidates.",
    image: hrResumeACutout,
    imagePosition: "center top",
  },
  {
    id: "onboarding-coordinator",
    agentName: "Maya",
    title: "Onboarding Coordinator",
    description: "Prepares onboarding tasks, owners, and day-one follow-ups.",
    image: hrResumeBCutout,
    imagePosition: "center top",
  },
];

const MARKETING_CARDS: FlowAgentSelectionCard[] = [
  {
    id: "content-calendar",
    agentName: "Noel",
    title: "Content Calendar",
    description: "Plans publishing dates, assigns owners, and tracks drafts.",
    image: hrResumeACutout,
    imagePosition: "center 12%",
  },
  {
    id: "social-drafter",
    agentName: "Lia",
    title: "Social Post Drafter",
    description: "Drafts on-brand posts and adapts them for each channel.",
    image: hrInterviewCutout,
    imagePosition: "center top",
  },
  {
    id: "campaign-planner",
    agentName: "Tessa",
    title: "Campaign Planner",
    description: "Maps campaign steps, creative work, and launch checkpoints.",
    image: hrResumeBCutout,
    imagePosition: "center top",
  },
];

const FLOW_AGENT_SELECTION: Record<
  Exclude<AgentFlowId, "general">,
  FlowAgentSelectionConfig
> = {
  jade: {
    title: "Who should jump in first?",
    subtitle: "Choose the hiring work you want handled now.",
    panelBackground: "#d9d7ff",
    cardBackground: "#aaacef",
    cards: HR_CARDS,
  },
  lia: {
    title: "Who should jump in first?",
    subtitle: "Choose the content work you want handled now.",
    panelBackground: "#ffe3f4",
    cardBackground: "#FFC499",
    cards: MARKETING_CARDS,
  },
};

export function getFlowAgentSelectionConfig(
  flowId: AgentFlowId,
): FlowAgentSelectionConfig | null {
  if (flowId === "general") return null;
  return FLOW_AGENT_SELECTION[flowId];
}
