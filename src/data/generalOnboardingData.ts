import focusDefaultVisual from "../assets/packaged-onboarding/focus-default.png";
import focusSalesVisual from "../assets/packaged-onboarding/focus-sales.png";
import focusPeopleVisual from "../assets/packaged-onboarding/focus-people.png";
import solutionOnboardingImage from "../assets/packaged-onboarding/solution-onboarding.png";
import solutionRecruitmentImage from "../assets/packaged-onboarding/solution-recruitment.png";
import solutionDirectoryImage from "../assets/packaged-onboarding/solution-directory.png";
import type { AgentFlowId } from "./agentFlows";

export interface GeneralFocusOption {
  id: string;
  title: string;
  description: string;
  fullWidth?: boolean;
}

export interface GeneralSolutionCard {
  id: string;
  title: string;
  bullets: readonly string[];
  image: string;
  agentName: string;
  agentRole: string;
  description: string;
  flowId: AgentFlowId;
}

export const GENERAL_DEFAULT_FOCUS_ID = "people";
export const GENERAL_SCRATCH_FOCUS_ID = "scratch";
/** @deprecated Use GENERAL_SCRATCH_FOCUS_ID */
export const GENERAL_OTHER_FOCUS_ID = GENERAL_SCRATCH_FOCUS_ID;
export const GENERAL_PROJECTS_FOCUS_ID = "projects";

export function skipsGeneralSolutionSelection(focusId: string): boolean {
  return focusId === GENERAL_SCRATCH_FOCUS_ID;
}

/** @deprecated Use skipsGeneralSolutionSelection */
export function skipsGeneralAgentSelection(focusId: string): boolean {
  return skipsGeneralSolutionSelection(focusId);
}

export function startsProjectsAgentChat(_focusId: string): boolean {
  return false;
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
  {
    id: GENERAL_SCRATCH_FOCUS_ID,
    title: "Start from scratch",
    description: "",
    fullWidth: true,
  },
];

export const HR_SOLUTION_CARDS: readonly GeneralSolutionCard[] = [
  {
    id: "employee-onboarding",
    title: "New Employee Onboarding",
    bullets: [
      "Manage every new hire's onboarding schedule",
      "Create onboarding programs automatically with AI",
      "Track every new hire's progress to completion",
    ],
    image: solutionOnboardingImage,
    agentName: "Max",
    agentRole: "Recruitment agent",
    description:
      "Sets up a new-hire plan, owners, and a day-one schedule so nobody starts lost.",
    flowId: "jade",
  },
  {
    id: "recruitment-management",
    title: "Recruitment Management",
    bullets: [
      "Track open roles & candidates in one place",
      "Source candidates automatically with AI",
      "Auto-transcribe every interview",
    ],
    image: solutionRecruitmentImage,
    agentName: "Max",
    agentRole: "Recruitment agent",
    description:
      "Keeps the hiring pipeline moving — screening applicants and booking interviews.",
    flowId: "jade",
  },
  {
    id: "employee-directory",
    title: "Employee Directory",
    bullets: [
      "Manage your employee directory in one place",
      "Build & Publish org charts",
      "Find the right person, skill, or location instantly",
    ],
    image: solutionDirectoryImage,
    agentName: "Max",
    agentRole: "Employee manager",
    description:
      "Keep all employee information and documents centralized in one place. With a dashboard, get an extensive employee breakdown with headcount by department, location and more.",
    flowId: "jade",
  },
  {
    id: "time-off",
    title: "Time off & attendance",
    bullets: [
      "Time-off request board",
      "HR agent — Max",
      "Balances, approvals, and coverage",
    ],
    image: solutionOnboardingImage,
    agentName: "Max",
    agentRole: "Recruitment agent",
    description:
      "Tracks time-off requests, balances, and coverage so approvals stay visible.",
    flowId: "jade",
  },
  {
    id: "performance-reviews",
    title: "Performance reviews",
    bullets: [
      "Review cycle board",
      "HR agent — Max",
      "Goals, feedback, and ratings",
    ],
    image: solutionRecruitmentImage,
    agentName: "Max",
    agentRole: "Recruitment agent",
    description:
      "Runs review cycles with goals, feedback, and ratings in one shared board.",
    flowId: "jade",
  },
];

export function getFocusLabel(focusId: string): string {
  return (
    GENERAL_FOCUS_OPTIONS.find((option) => option.id === focusId)?.title ??
    "People & recruiting"
  );
}

export function getFocusVisualSrc(focusId: string): string {
  if (focusId === "sales") return focusSalesVisual;
  if (focusId === "people") return focusPeopleVisual;
  return focusDefaultVisual;
}

export function getSolutionCardsForFocus(
  _focusId: string,
): readonly GeneralSolutionCard[] {
  return HR_SOLUTION_CARDS;
}

/** @deprecated Use getSolutionCardsForFocus */
export function getAgentCardsForFocus(focusId: string) {
  return getSolutionCardsForFocus(focusId);
}

/** Compatibility alias while the selection page is being rewritten. */
export type GeneralAgentCard = GeneralSolutionCard;
