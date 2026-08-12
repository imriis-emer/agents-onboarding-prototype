import {
  TOUR_STEP_1_PARAGRAPH_ILLUSTRATIONS,
  TOUR_STEP_1_TEXT,
} from "./tourIllustrations";

export const NIKE_SCAN_USER_MESSAGE = "Scan nike.com career page";

export const NIKE_SCAN_MESSAGES = {
  scanning: "On it — scanning nike.com/carrerrs",
  rolesFound: "Done — I found the top 8 open roles at nike.com/careers.",
  roleFocus:
    "Want me to start with all of these, or is there a specific role or department you want to focus on? You can select one of the roles or just write me in the prompt box.",
  sourcingIntro: "for 3D Footwear Designer now 🔍",
  candidatesDone:
    "Done! 🎯 Here are the top candidates for 3D Footwear Designer.",
  automationAsk:
    "Great! Want me to keep finding candidates like this automatically?",
  teamAsk:
    "Hiring works best as a team sport, though. Want to bring anyone in to review candidates and give feedback as I go?",
  inviteDone:
    "Done! Tom and Mike were invited — They'll see every candidate I find, leave feedback, and help shape who moves forward. The more input I get from your team, the better my shortlists get.",
  tourOffer:
    "Want a quick tour of your monday AI Work Platform? I'll show you where everything lives — including me.",
  tourStep1: TOUR_STEP_1_TEXT,
  tourStep2:
    "These are your boards — the place where you, your team, and I do the work together. I can read boards, write to boards, and update boards as I go. Everything I touch is visible and reversible.",
  tourStep3:
    "And this is where the work lives — your Candidates board. Open it anytime to see who I've found, review fit scores, and leave feedback. Tom and Mike will see it here too. The more your team reacts and engages with my shortlists, the better I get at finding the right people.",
  tourEnd:
    "That's everything. You've got the boards, the agents tab, and a team that's already looped in. I'm one message away — just ask, and I'll get to work.",
} as const;

export const TEAMMATE_1_PLACEHOLDER = "Teammate 1 — name or email";
export const TEAMMATE_2_PLACEHOLDER = "Teammate 2 — name or email";
export const TEAM_INVITE_SKIP_LABEL = "I'll do this later";
export const TOUR_BUTTON_LABEL = "Show me around";
export const TOUR_SKIP_LABEL = "Skip, I've got it";

export const TOUR_TOOLTIPS = {
  agent:
    "You'll always find me here, under the Agents tab. Click on me anytime you need something.",
  content:
    "These are your boards — where you, your team, and I do the work together.",
  focusBoard:
    "This is where the work lives — open it anytime to see who I've found.",
} as const;

export const ROLE_PICK_TITLE = "Where should we start?";

export const ROLE_PICK_OPTIONS = [
  "Senior Digital Product Designer",
  "3D Footwear Designer",
  "Global Sports Marketing Manager",
] as const;

export const AUTOMATION_OPTIONS = [
  "Find new candidates daily",
  "I'll assign you to specific roles i need your help with",
  "Decide for me",
] as const;

export const NEXT_STEPS_TITLE = "What I'd suggest next";

export const NEXT_STEPS_OPTIONS = [
  "Review the candidates board",
  "Source for another role",
  "Something else",
] as const;

export const CANDIDATE_FEEDBACK_MESSAGE =
  "Here's what I found. Anything you'd change — different seniority, different location, someone missing?";

export const CANDIDATE_FEEDBACK_OPTIONS = [
  "These look right",
  "Adjust the search",
  "Show me more",
] as const;

export const CANDIDATE_FEEDBACK_POSITIVE = "These look right";

export const BOARD_SAVE_MESSAGE =
  "Got it — I'll find fresh candidates every morning.\n\nFor us to work on this together, we'll need a workspace and a board. That's where you and your hiring team review, comment, and move candidates through the pipeline — not just here in chat.\n\nI've kept your list live in the Candidates board.";

export const BOARD_OFFER_OPTIONS = [
  "Yes, show me the Candidates board",
  "I'll do this later, let's search for more candidates",
] as const;

export const BOARD_OFFER_POSITIVE = "Yes, show me the Candidates board";

// Board-stage walkthrough: once the user lands on the live board, the agent
// introduces the board, left pane, workspace, then the chat launcher.
export interface BoardTourStep {
  target: string;
  placement: "right" | "left" | "top" | "bottom";
  text: string;
}

export const BOARD_TOUR_STEPS: readonly BoardTourStep[] = [
  {
    target: "live-board",
    placement: "bottom",
    text: "This is your Candidates board — where all our hiring work lives. Review everyone I've sourced, leave feedback, and move candidates through the pipeline together.",
  },
  {
    target: "content-section",
    placement: "right",
    text: "You'll find it here in the left pane under Content. Any new boards or docs we create together show up in this spot too.",
  },
  {
    target: "workspace-selector",
    placement: "right",
    text: "This is your workspace — your team's home base. Everything you and I create together lives right here.",
  },
  {
    target: "agent-launcher",
    placement: "left",
    text: "And I'm always right here. Open me up anytime to source more candidates, ask a question, or hand off work.",
  },
] as const;

export const ROLE_SEARCH_USER_MESSAGE =
  "Search nike.com/careers for open roles";

export const ROLE_SEARCH_MESSAGES = {
  askRole:
    "Tell me the role name or Job ID and I'll look for it on your career page.",
} as const;

export function findMatchingOpenRole(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return OPEN_ROLES_ROWS[0];
  return (
    OPEN_ROLES_ROWS.find(
      (row) =>
        row.name.toLowerCase().includes(normalized) ||
        normalized.includes(row.name.toLowerCase()),
    ) ?? OPEN_ROLES_ROWS[0]
  );
}

export function buildRoleSearchScript(query: string) {
  const role = findMatchingOpenRole(query);
  const searchedFor = query.trim() || role.name;

  return [
    { id: "rq1", text: ROLE_SEARCH_MESSAGES.askRole },
    { id: "rq2", text: `Searching nike.com/careers for "${searchedFor}"…` },
    {
      id: "rq3",
      text: `Found it — ${role.name} · ${role.level} · ${role.location}. On it — finding the best candidates now 🔍`,
    },
    {
      id: "rq4",
      text: `Done! 🎯 Here are the top candidates for ${role.name}.`,
    },
    { id: "rq5", text: NIKE_SCAN_MESSAGES.automationAsk },
    { id: "rq6", text: NIKE_SCAN_MESSAGES.teamAsk },
    { id: "rq7", text: NIKE_SCAN_MESSAGES.inviteDone },
    { id: "rq8", text: NIKE_SCAN_MESSAGES.tourOffer },
    {
      id: "rq9",
      text: NIKE_SCAN_MESSAGES.tourStep1,
      paragraphIllustrations: TOUR_STEP_1_PARAGRAPH_ILLUSTRATIONS,
    },
    { id: "rq10", text: NIKE_SCAN_MESSAGES.tourStep2 },
    { id: "rq11", text: NIKE_SCAN_MESSAGES.tourStep3 },
    { id: "rq12", text: NIKE_SCAN_MESSAGES.tourEnd },
  ];
}

export const DAILY_TRIGGER_JOB = {
  name: "Daily candidate sourcing",
  schedule: "Every day, at 08:00 ((UTC+03:00) Jerusalem)",
  title: "Candidate Sourcing",
  description:
    "I'll find, screen, and rank new candidates for your open roles every day, at 08:00 — updating your Candidates board automatically.",
  workspaceName: "Ohad's Hiring Space",
} as const;

export type AgentJobIcon = "createItem" | "versioning" | "status";

export const AGENT_JOBS = [
  {
    id: "screen",
    icon: "createItem" as AgentJobIcon,
    schedule: "When item is created",
    title: "Screen a candidate",
    description:
      "Score CVs by job criteria, categorizing as strong, borderline, or weak.",
    enabled: true,
  },
  {
    id: "source",
    icon: "versioning" as AgentJobIcon,
    schedule: "Every day, at 8:00 PM",
    title: "Source a candidate",
    description:
      "Find GenAI PMs in Israel on LinkedIn, assess them, add to the board, and outreach for Kate.",
    enabled: true,
  },
  {
    id: "pipeline",
    icon: "status" as AgentJobIcon,
    schedule: "When status changes to Stuck",
    title: "Advance the pipeline & advise",
    description:
      "Score CVs by job criteria, categorizing as strong, borderline, or weak.",
    enabled: true,
  },
] as const;

export const NIKE_SCAN_PLAN = {
  summary:
    "I'll open nike.com/careers, scan the open positions list, and pull out the top roles for your team.",
  steps: [
    {
      stepId: "browser",
      blockName: "Using the browser",
      purpose: "Open nike.com/careers in the browser",
    },
    {
      stepId: "load",
      blockName: "Load careers page",
      purpose: "Load the job search page and wait for results",
    },
    {
      stepId: "scan",
      blockName: "Scan open positions",
      purpose: "Read the open positions count and filters",
    },
    {
      stepId: "extract",
      blockName: "Extract roles",
      purpose: "Pull the top matching open roles into a list",
    },
  ],
} as const;

export const NIKE_SCAN_PLAN_STEPS = NIKE_SCAN_PLAN.steps.map((step) => ({
  id: step.stepId,
  label: step.blockName,
}));

export const SOURCING_STEPS = [
  { id: "read", label: "Reading role requirements" },
  { id: "search", label: "Searching for matching profiles" },
  { id: "rank", label: "Ranking by fit, experience, and seniority" },
  { id: "shortlist", label: "Building your shortlist" },
] as const;

export const OPEN_ROLES_ROWS = [
  {
    name: "3D Footwear Designer",
    location: "Beaverton, OR",
    level: "Mid",
  },
  {
    name: "Senior Digital Product Designer",
    location: "Portland, OR",
    level: "Senior",
  },
  {
    name: "Global Sports Marketing Manager",
    location: "New York, NY",
    level: "Senior",
  },
  {
    name: "Footwear Materials Engineer",
    location: "Beaverton, OR",
    level: "Mid",
  },
  {
    name: "Retail Store Leader",
    location: "Los Angeles, CA",
    level: "Mid",
  },
  {
    name: "Supply Chain Analyst",
    location: "Memphis, TN",
    level: "Mid",
  },
  {
    name: "Brand Creative Director",
    location: "Portland, OR",
    level: "Director",
  },
  {
    name: "Sustainability Program Manager",
    location: "Remote",
    level: "Senior",
  },
] as const;

export const CANDIDATE_ROWS = [
  {
    name: "Emily Carter",
    location: "Portland, OR",
    level: "Early (0–2 yrs)",
    role: "3D Footwear Designer @ lululemon",
    notes:
      "Best Overall Fit. Blender, Rhino, Gravity Sketch + AI workflows. No relocation needed.",
  },
  {
    name: "Micheal Brown",
    location: "Austin, TX",
    level: "Junior–Mid",
    role: "Independent Studio Founder",
    notes:
      "DAAP grad, strong 3D portfolio (Puma, Oakley). Rhino, Blender & KeyShot.",
  },
  {
    name: "Sophia Lee",
    location: "New York, NY",
    level: "Early (~2–3 yrs)",
    role: "Associate Footwear Designer @ Topo Athletic",
    notes:
      "Rhino + KeyShot, hands-on 3D prototyping and footwear construction background.",
  },
] as const;

export const BOARD_CANDIDATE_ROWS = [
  { name: "Inti MacDonald", starred: true },
  { name: "Aarón Angeles", starred: false },
  { name: "Jaren Dorman", starred: false },
  { name: "Doğukan Şerifoğlu", starred: false },
  { name: "Redd Smith", starred: false },
] as const;

export type SourcedCandidate = {
  name: string;
  company: string;
  location: string;
  linkedin?: string;
  starred?: boolean;
  personActive?: boolean;
};

/** Full shortlist Jade sourced for the role — used for the live board. */
export const SOURCED_CANDIDATE_ROWS: SourcedCandidate[] = [
  {
    name: "Inti MacDonald",
    company: "lululemon",
    location: "Portland, OR",
    starred: true,
    personActive: true,
  },
  {
    name: "Casey Atkinson",
    company: "Brooks Running",
    location: "Seattle, WA",
  },
  { name: "John Helf", company: "New Balance", location: "Boston, MA" },
  { name: "Joram Steen", company: "ASICS EMEA", location: "Amsterdam, NL" },
  {
    name: "Andrew Melissas",
    company: "Skechers",
    location: "Los Angeles, CA",
    linkedin: "https://www.linkedin.com/in/andrew-melissas/",
  },
  { name: "Emily Guerra", company: "New Balance", location: "Boston, MA" },
  { name: "Redd Smith", company: "Gravity Sketch", location: "London, UK" },
  {
    name: "Aarón Angeles",
    company: "Topo Athletic LLC",
    location: "Denver, CO",
  },
  { name: "Shihan B.", company: "Nike", location: "Beaverton, OR" },
  { name: "Michael Martin", company: "Nike", location: "Beaverton, OR" },
];

export type RefinedCandidate = {
  name: string;
  company: string;
  linkedin?: string;
};

/** Refined shortlist Jade re-renders in chat after the user asks to adjust. */
export const REFINED_CANDIDATE_ROWS: RefinedCandidate[] = [
  {
    name: "Andrew Melissas",
    company: "Skechers",
    linkedin: "https://www.linkedin.com/in/andrew-melissas/",
  },
  { name: "Emily Guerra", company: "New Balance" },
  { name: "Redd Smith", company: "Gravity Sketch" },
  { name: "Aarón Angeles", company: "Topo Athletic LLC" },
];

export type BoardTableRow = {
  name: string;
  starred?: boolean;
  location: string;
  timeline: string;
  /** Optional current employer, rendered in the last column when present. */
  company?: string;
  personActive?: boolean;
};

export type BoardTableGroup = {
  id: string;
  title: string;
  color: string;
  /** Optional label for the trailing board column (defaults to blank). */
  lastColumnLabel?: string;
  rows: BoardTableRow[];
};

export const BOARD_TABLE_GROUPS: BoardTableGroup[] = [
  {
    id: "footwear-designer",
    title: "3D Footwear Designer",
    color: "#0073ea",
    lastColumnLabel: "Current Company",
    rows: SOURCED_CANDIDATE_ROWS.map((candidate) => ({
      name: candidate.name,
      starred: candidate.starred,
      personActive: candidate.personActive,
      location: candidate.location,
      timeline: "",
      company: candidate.company,
    })),
  },
];

export const JOB_TRIGGERS = [
  {
    id: "slack",
    title: "Message received in Slack",
    subtitle: "tomre",
    enabled: true,
  },
  {
    id: "weekly",
    title: "Every week, on Monday at 09:00",
    subtitle: "(UTC+03:00) Jerusalem",
    enabled: true,
  },
  {
    id: "biweekly",
    title: "Every 2 weeks, on Thursday at 09:00",
    subtitle: "(UTC+03:00) Jerusalem",
    enabled: true,
  },
] as const;

export const BROWSER_PLAN_COPY =
  "Great! I can see the job search page is now loaded. It shows 'OPEN POSITIONS: 925' which means there are 925 open positions. I can see the page has: - A filters sidebar on the left...";

export const NIKE_SCAN_SCRIPT = [
  { id: "n1", text: NIKE_SCAN_MESSAGES.scanning },
  { id: "n2", text: NIKE_SCAN_MESSAGES.rolesFound },
  { id: "n3", text: NIKE_SCAN_MESSAGES.roleFocus },
  { id: "n4", text: NIKE_SCAN_MESSAGES.sourcingIntro },
  { id: "n5", text: NIKE_SCAN_MESSAGES.candidatesDone },
  { id: "n6", text: NIKE_SCAN_MESSAGES.automationAsk },
  { id: "n7", text: NIKE_SCAN_MESSAGES.teamAsk },
  { id: "n8", text: NIKE_SCAN_MESSAGES.inviteDone },
  { id: "n9", text: NIKE_SCAN_MESSAGES.tourOffer },
  {
    id: "n10",
    text: NIKE_SCAN_MESSAGES.tourStep1,
    paragraphIllustrations: TOUR_STEP_1_PARAGRAPH_ILLUSTRATIONS,
  },
  { id: "n11", text: NIKE_SCAN_MESSAGES.tourStep2 },
  { id: "n12", text: NIKE_SCAN_MESSAGES.tourStep3 },
  { id: "n13", text: NIKE_SCAN_MESSAGES.tourEnd },
] as const;
