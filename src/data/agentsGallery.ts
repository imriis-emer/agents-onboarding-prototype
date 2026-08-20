const galleryAssets = import.meta.glob("../assets/agents-gallery/*", {
  eager: true,
  import: "default",
}) as Record<string, string>;

function asset(fileName: string): string {
  const match = Object.entries(galleryAssets).find(([path]) =>
    path.endsWith(`/${fileName}`),
  );
  if (!match) {
    throw new Error(`Missing gallery asset: ${fileName}`);
  }
  return match[1];
}

export const GALLERY_CATEGORIES = [
  "Made for you",
  "For Project Managers",
  "For Product & Engineering",
  "Task Management",
  "Productivity",
  "Meetings",
  "From monday.com",
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export const PROMPT_TEMPLATES = [
  "Competitor research",
  "Vendor sourcing",
  "Seamless global community",
  "SLA monitor",
] as const;

export const TEMPLATE_PROMPTS: Record<
  (typeof PROMPT_TEMPLATES)[number],
  string
> = {
  "Competitor research":
    "Tracks your key competitors by monitoring their digital presence. Identifies product launches, pricing changes, strategic shifts, and hiring trends.",
  "Vendor sourcing":
    "Finds and compares vendors against your criteria, then drafts outreach so sourcing can move without the back-and-forth.",
  "Seamless global community":
    "Keeps a global community engaged with localized updates, event reminders, and follow-ups across time zones.",
  "SLA monitor":
    "Watches SLA clocks, flags at-risk tickets, and nudges owners before commitments slip.",
};

export interface GalleryAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
}

export interface PersonalizedAgent extends GalleryAgent {
  basedOn: string;
}

export interface GalleryFeatured {
  title: string;
  description: string;
  illustration: string;
  icon: string;
  iconColor: string;
}

export interface GalleryCategorySection {
  id: Exclude<GalleryCategory, "Made for you" | "From monday.com">;
  title: string;
  featured: GalleryFeatured;
  agents: readonly GalleryAgent[];
}

export interface MondayTeamStory {
  title: string;
  description: string;
  value: string;
  builtBy: string;
  portrait: string;
  builderAvatar: string;
}

function agent(
  id: string,
  name: string,
  role: string,
  description: string,
  avatarFile: string,
): GalleryAgent {
  return { id, name, role, description, avatar: asset(avatarFile) };
}

export const PERSONALIZED_AGENTS: readonly PersonalizedAgent[] = [
  {
    ...agent(
      "ava",
      "Ava",
      "Backlog Spec Builder",
      "I'll turn rough feature ideas into ready-to-build specs and acceptance criteria.",
      "ava.png",
    ),
    basedOn: "Product backlog",
  },
  {
    ...agent(
      "leonardo",
      "Leonardo",
      "Owner Nudge Coordinator",
      "I'll chase owners for missing details and unblock stalled features in the PRD documents.",
      "leonardo.png",
    ),
    basedOn: "Tasks - Product team",
  },
  {
    ...agent(
      "emma",
      "Emma",
      "Estimation & Variance Coach",
      "I'll chase missing actual SP and explain big estimation misses with next-step actions.",
      "emma.png",
    ),
    basedOn: "Product backlog",
  },
  {
    ...agent(
      "james",
      "James",
      "PR Link Chaser",
      "I'll turn your Github links into actionable review requests and unblock reviews.",
      "james.png",
    ),
    basedOn: "Product backlog",
  },
];

export const CATEGORY_SECTIONS: readonly GalleryCategorySection[] = [
  {
    id: "For Project Managers",
    title: "For Project Managers",
    featured: {
      title: "Move projects forward, automatically",
      description:
        "Let agents handle status, priorities, and updates while you focus on delivery.",
      illustration: asset("banner-pm.png"),
      icon: asset("banner-pm-icon-bg.svg"),
      iconColor: "#9d50dd",
    },
    agents: [
      agent(
        "lev",
        "Lev",
        "Project Manager",
        "Captures goals and scope for a clear, successful project from start to finish.",
        "lev.png",
      ),
      agent(
        "dani",
        "Dani",
        "Status Reporter",
        "Auto-generates progress summaries and flags blockers for stakeholders.",
        "dani.png",
      ),
      agent(
        "neta",
        "Neta",
        "Priorities Manager",
        "Continuously manages priorities, escalating and surfacing urgent tasks.",
        "neta.png",
      ),
      agent(
        "omer",
        "Omer",
        "Project Intelligence",
        "Builds context on a specific project to generate updates and content.",
        "omer.png",
      ),
      agent(
        "yoav",
        "Yoav",
        "Project Status Report",
        "Automates project health checks with progress, blockers, and next steps.",
        "yoav.png",
      ),
      agent(
        "alma",
        "Alma",
        "Schedule Manager",
        "Balances team capacity and workload to maximize productivity.",
        "alma.png",
      ),
    ],
  },
  {
    id: "For Product & Engineering",
    title: "For Product & Engineering",
    featured: {
      title: "Ship faster with less overhead",
      description:
        "Streamline your sprints, triage bugs, and keep your roadmap on track.",
      illustration: asset("banner-pe.png"),
      icon: asset("banner-pe-icon.svg"),
      iconColor: "#00c875",
    },
    agents: [
      agent(
        "liora",
        "Liora",
        "Sprint Planner",
        "Organizes backlogs and drafts sprint goals based on team capacity.",
        "liora.png",
      ),
      agent(
        "ari",
        "Ari",
        "PRD Writer",
        "Generates complete product requirement docs from brief ideas and team input.",
        "ari.png",
      ),
      agent(
        "noam",
        "Noam",
        "Release Notes",
        "Transforms tickets into brand-voiced, user-facing release notes.",
        "noam.png",
      ),
      agent(
        "shai",
        "Shai",
        "StandUp Runner",
        "Collects async updates and summarizes blockers for the team.",
        "shai.png",
      ),
      agent(
        "keren",
        "Keren",
        "Retro Facilitator",
        "Gathers feedback on what went well or wrong after each sprint.",
        "keren.png",
      ),
      agent(
        "eyal",
        "Eyal",
        "IT Service Manager",
        "Automates intake, approval, and assignment of IT service requests.",
        "eyal.png",
      ),
    ],
  },
  {
    id: "Task Management",
    title: "Task Management",
    featured: {
      title: "Keep every task on track, automatically",
      description:
        "Let agents assign owners, flag blockers, and keep your boards moving.",
      illustration: asset("banner-tm.png"),
      icon: asset("banner-tm-icon.svg"),
      iconColor: "#fdab3d",
    },
    agents: [
      agent(
        "yael",
        "Yael",
        "Triage New Tasks",
        "Reviews incoming tasks to prioritize, schedule, and auto-fill all the details.",
        "yael.png",
      ),
      agent(
        "amit",
        "Amit",
        "Field Filler",
        "Extracts data from descriptions or files to auto-fill custom fields and priorities.",
        "amit.png",
      ),
      agent(
        "ori",
        "Ori",
        "Work Breakdown",
        "Breaks high-level parent tasks into subtasks with assignees and due dates.",
        "ori.png",
      ),
      agent(
        "tomer",
        "Tomer",
        "Approval Manager",
        "Manages sign-offs and notifies stakeholders when a review is needed.",
        "tomer.png",
      ),
      agent(
        "shira",
        "Shira",
        "Deadline Tracker",
        "Monitors deadlines and sends timely reminders to keep projects on time.",
        "shira.png",
      ),
      agent(
        "ilan",
        "Ilan",
        "Task Insights",
        "Analyzes task comments and descriptions to surface insights and open questions.",
        "ilan.png",
      ),
    ],
  },
  {
    id: "Productivity",
    title: "Productivity",
    featured: {
      title: "Get more done in less time",
      description:
        "Automate repetitive tasks and free up time for the work that matters.",
      illustration: asset("banner-productivity.png"),
      icon: asset("banner-productivity-icon.svg"),
      iconColor: "#9d50dd",
    },
    agents: [
      agent(
        "rex",
        "Rex",
        "Daily Briefer",
        "Summarizes today's priorities and flags overdue items.",
        "rex.png",
      ),
      agent(
        "noa",
        "Noa",
        "Personal Assistant",
        "Reminders, emails, meetings, tasks. Does the work that you don't want to do.",
        "noa.png",
      ),
      agent(
        "mika",
        "Mika",
        "Morning Coffee",
        "Starts your day with a summary of urgent messages and ready-to-send replies.",
        "mika.png",
      ),
      agent(
        "lior",
        "Lior",
        "@Mentions Digest",
        "Finds all @mentions waiting on you and summarizes action items.",
        "lior.png",
      ),
      agent(
        "dana",
        "Dana",
        "Weekly Digest",
        "Shows your week at a glance: key decisions, completed work, and what's ahead.",
        "dana.png",
      ),
      agent(
        "zara",
        "Zara",
        "Executive Assistant",
        "Triages and drafts communications while you focus on decisions that matter.",
        "zara.png",
      ),
    ],
  },
  {
    id: "Meetings",
    title: "Meetings",
    featured: {
      title: "Keep every people process on track",
      description:
        "Onboard new hires, handle leave requests, and keep your HR processes on track.",
      illustration: asset("banner-meetings.png"),
      icon: asset("banner-meetings-icon.svg"),
      iconColor: "#0073ea",
    },
    agents: [
      agent(
        "elan",
        "Elan",
        "Meeting Scheduler",
        "Finds times, sends invites, and confirms meetings.",
        "elan.png",
      ),
      agent(
        "maya",
        "Maya",
        "Meetings Manager",
        "Schedules meetings, sets the agenda, sends prep, and ensures follow-ups.",
        "maya.png",
      ),
      agent(
        "roni",
        "Roni",
        "Meeting Prep",
        "Drafts agendas and compiles relevant tasks for upcoming meetings.",
        "roni.png",
      ),
      agent(
        "gal",
        "Gal",
        "Daily Meeting Prep",
        "Gets you ready for every meeting before it starts.",
        "gal.png",
      ),
      agent(
        "tal",
        "Tal",
        "End of Day Recap",
        "Compiles a daily report of completed meetings and outstanding action items.",
        "tal.png",
      ),
      agent(
        "nir",
        "Nir",
        "Action Extractor",
        "Turns meeting notes into clear, assigned tasks with due dates.",
        "nir.png",
      ),
    ],
  },
];

export const MONDAY_TEAM_STORY: MondayTeamStory = {
  title: "Petro, Web to mobile feature parity",
  description:
    "Scans web features and identifies gaps in the mobile app, then generates specs for parity tickets.",
  value:
    "4 cross-platform features implemented on day one. Estimated month of dev time saved immediately. Turns previously deprioritized mobile requests into shipped features.",
  builtBy: "Amit, Tech Lead – monday CRM",
  portrait: asset("petro.png"),
  builderAvatar: asset("amit-builder.png"),
};

export const SKILL_ICONS = {
  gmail: asset("skill-gmail.png"),
  slack: asset("skill-slack.png"),
  letter1: asset("skill-letter-1.svg"),
  letter2: asset("skill-letter-2.svg"),
  letter3: asset("skill-letter-3.svg"),
  usage: asset("usage-icon.svg"),
  board: asset("board-icon.svg"),
  monday: asset("monday-mark.svg"),
} as const;

export const SECTION_IDS: Record<GalleryCategory, string> = {
  "Made for you": "gallery-made-for-you",
  "For Project Managers": "gallery-project-managers",
  "For Product & Engineering": "gallery-product-engineering",
  "Task Management": "gallery-task-management",
  Productivity: "gallery-productivity",
  Meetings: "gallery-meetings",
  "From monday.com": "gallery-from-monday",
};
