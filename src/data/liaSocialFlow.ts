import {
  TOUR_END_TEXT,
  TOUR_STEP_1_PARAGRAPH_ILLUSTRATIONS,
  TOUR_STEP_1_TEXT,
  TOUR_STEP_2_TEXT,
  TOUR_STEP_3_TEXT,
} from "./tourIllustrations";

export const LIA_FIRST_ACTION_DEFAULT =
  "Draft a social media post and generate an image";

export const LIA_BRAND_VOICE_TITLE =
  "Where can I learn your brand voice? I'll write in it from the first word.";

export const LIA_BRAND_VOICE_OPTIONS = [
  "Find the brand guidelines on nike.com",
  "I'll paste a link",
] as const;

export const LIA_BRAND_VOICE_SKIP = "Skip, use general nike.com tone";

export const LIA_BRAND_VOICE_URL_PLACEHOLDER = "Paste a brand guide URL…";

export const LIA_TOPIC_TITLE = "What should the post be about?";

export const LIA_TOPIC_OPTIONS = [
  "I'll add a campaign brief",
  "A new product announcement",
  "Something else — write here",
] as const;

export const LIA_TOPIC_UNSURE_MESSAGE = "Not sure yet, what do you suggest?";

export const LIA_POST_SUGGESTION_OPTIONS = [
  "I love this, let's do it",
  "I'd rather write about something else",
  "Something else — write here",
] as const;

export const LIA_POST_SAVE_OPTIONS = [
  "Save it, I'll post it when ready",
  "Remind me to post this tomorrow",
  "Tweak the copy",
] as const;

export const LIA_CONNECT_LINKEDIN_LABEL = "Connect LinkedIn account";

export const LIA_POST_SAVE_NOTE =
  "Direct posting to LinkedIn requires connecting your account. Find the post in your Social Media Content board — ready to paste and publish when you are.";

export const LIA_DRAFT_MESSAGES = {
  draftIntro:
    "Got it — I'll create everything you need to post on your social media accounts: copy and an image, ready to go.",
  questionsIntro: "Before I start, a couple of quick questions.",
  brandVoiceAck:
    "Got it. I know how Nike's brand sounds — and what it doesn't say. Let's move on.",
  topicAsk: "What should the post be about?",
  postSuggestion: `I have an idea — and it's the most authentic post you could write right now.
You just set up your first AI agent. That's genuinely noteworthy. Most people are still talking about AI — you're actually using it at work.

Let me write a LinkedIn post about it. I can introduce myself in your words, and attach my intro video so your network sees exactly what you built.

It takes one minute. And it'll be the most personal piece of content on your feed today.`,
  draftingIntro: "On it ✍️",
  postDelivered: "Done! 🎯 Here's your LinkedIn post:",
  savePrompt: `Saved to your Social Media Content board. Want to adjust anything, or post it as is?

${LIA_POST_SAVE_NOTE}`,
  automationAsk:
    "That's your first post. Want me to keep generating content ideas automatically so your channels stay active?",
  teamAsk: `Social media works best with more voices in the room. Want to loop in anyone who should be shaping the content or giving feedback as I go?
The more input I get from your team, the better I get at telling the stories your audience actually cares about.`,
  inviteDone:
    "Done — Tom and Mike are in. They'll see everything I create, leave feedback, and help shape what we publish. Their input is what makes the content better over time — I learn from what they react to.",
  tourOffer:
    "One last thing — want a quick tour of your monday AI Work Platform? I'll show you where everything lives, including me.",
  tourStep1: TOUR_STEP_1_TEXT,
  tourStep2: TOUR_STEP_2_TEXT,
  tourStep3: TOUR_STEP_3_TEXT,
  tourEnd: TOUR_END_TEXT,
  tourSkip:
    "Got it — everything's ready. Your boards, your content, your team. I'm one message away whenever you need me.",
} as const;

export const LIA_LINKEDIN_POST = `I just set up my first AI agent at work.
Her name is Lia. She handles our social media — drafting posts, planning campaigns, keeping our channels active — in our Nike's unique brand voice, without me having to brief her every time.
This took me about 3 minutes to set up.

I'm not a developer. I didn't write any code. I picked a template, answered a few questions, and Lia was running.
If your team is still doing this manually, it's worth a look.
→ [link to monday.com]
#AIAgents #FutureOfWork #JustDoIt`;

export const LIA_LINKEDIN_VIDEO_ARTIFACT = {
  title: "LinkedIn post video",
  meta: "Created July 7, 2026... • mp4",
} as const;

export const LIA_BRAND_RESEARCH_STEPS = [
  { id: "browse", label: "Browsing nike.com" },
  { id: "found", label: "Found brand-nike.com" },
  {
    id: "tone",
    label: "Tone of voice: motivational, confident, and empowering",
  },
  {
    id: "logo",
    label: "Logo: Known as the Swoosh, represents motion, speed, and power",
  },
  {
    id: "voice",
    label: 'What to say: simple, direct, and powerful — "just do it"',
  },
] as const;

export const LIA_DRAFTING_STEPS = [
  {
    id: "perspective",
    label: "Drafting from your perspective — you built this, I'm the punchline",
  },
  {
    id: "voice",
    label: "Writing in nike.com brand voice: confident, direct, no hype",
  },
  { id: "video", label: "Attaching my intro video as the media asset" },
  { id: "writing", label: "Writing your post…" },
] as const;

export const LIA_TOUR_TOOLTIPS = {
  agent:
    "You'll always find me here, under the Agents tab. Click on me anytime you need something.",
  content:
    "These are your boards — where you, your team, and I do the work together.",
  focusBoard: "This is your Social Media Content board — where our work lives.",
} as const;

export const LIA_AUTOMATION_OPTIONS = [
  "Draft new posts daily",
  "I'll assign you to specific campaigns I need help with",
  "Decide for me",
] as const;

export const LIA_BOARD_SAVE_MESSAGE =
  "Got it — I'll draft fresh posts every morning.\n\nFor us to work on this together, we'll need a workspace and a board. That's where you and your team review drafts, comment, and keep every campaign on track — not just here in chat.\n\nI've kept everything live in the Social Media Content board.";

export const LIA_BOARD_OFFER_OPTIONS = [
  "Yes, show me the Social Media Content board",
  "I'll do this later, let's draft something else",
] as const;

export const LIA_BOARD_OFFER_POSITIVE =
  "Yes, show me the Social Media Content board";

export const LIA_BOARD_TOUR_STEPS = [
  {
    target: "live-board",
    placement: "bottom" as const,
    text: "This is your Social Media Content board — where all our work lives. Review drafts, leave feedback, and keep every campaign moving together.",
  },
  {
    target: "content-section",
    placement: "right" as const,
    text: "You'll find it here in the left pane under Content. Any new boards or docs we create together show up in this spot too.",
  },
  {
    target: "workspace-selector",
    placement: "right" as const,
    text: "This is your workspace — your team's home base. Everything you and I create together lives right here.",
  },
  {
    target: "agent-launcher",
    placement: "left" as const,
    text: "And I'm always right here. Open me up anytime to draft a post, ask a question, or hand off work.",
  },
] as const;

/** Shown in the docked chat after the live board opens (Lia skips the board tour). */
export const LIA_BOARD_CHAT_INTRO_MESSAGES = [
  {
    id: "lia-board-intro-1",
    text: "Here's your Social Media Content board — where all our work lives. Review drafts, leave feedback, and keep every campaign moving together.",
  },
  {
    id: "lia-board-intro-2",
    text: "You'll find it anytime in the left pane under Content. Any new boards or docs we create together show up there too.",
  },
  {
    id: "lia-board-intro-3",
    text: "This is Ohad's Marketing Space — your team's home base. Everything you and I create together lives right here.",
  },
] as const;

export const LIA_DAILY_TRIGGER_JOB = {
  name: "Content Drafting",
  schedule: "Every day, at 08:00 ((UTC+03:00) Jerusalem)",
  title: "Content Drafting",
  description:
    "I'll draft, schedule, and refine social posts for your active campaigns every day at 08:00 — updating your Social Media Content board automatically.",
  workspaceName: "Ohad's Marketing Space",
} as const;

export type AgentJobIcon = "createItem" | "versioning" | "status";

export const LIA_AGENT_JOBS = [
  {
    id: "draft",
    icon: "createItem" as AgentJobIcon,
    schedule: "When item is created",
    title: "Draft a social post",
    description:
      "Turn campaign briefs into on-brand posts for Instagram, LinkedIn, and X.",
    enabled: true,
  },
  {
    id: "schedule",
    icon: "versioning" as AgentJobIcon,
    schedule: "Every day, at 8:00 PM",
    title: "Schedule content",
    description:
      "Queue posts across channels, optimize timing, and notify the team in Slack.",
    enabled: true,
  },
  {
    id: "analyze",
    icon: "status" as AgentJobIcon,
    schedule: "When status changes to Stuck",
    title: "Analyze performance & advise",
    description:
      "Review engagement metrics and suggest improvements for underperforming posts.",
    enabled: true,
  },
] as const;

export const LIA_JOB_TRIGGERS = [
  {
    id: "slack",
    title: "Message received in Slack",
    subtitle: "tomre",
    enabled: true,
  },
  {
    id: "weekly",
    title: "Every week, on Monday at 09:00",
    subtitle: "Weekly content review",
    enabled: false,
  },
] as const;

export const LIA_DRAFT_SCRIPT = [
  { id: "l1", text: LIA_DRAFT_MESSAGES.brandVoiceAck },
  { id: "l2", text: LIA_DRAFT_MESSAGES.topicAsk },
  { id: "l3", text: LIA_DRAFT_MESSAGES.postSuggestion },
  { id: "l4", text: LIA_DRAFT_MESSAGES.draftingIntro },
  { id: "l5", text: LIA_DRAFT_MESSAGES.postDelivered },
  {
    id: "l6",
    text: LIA_DRAFT_MESSAGES.savePrompt,
    paragraphActions: { 1: LIA_CONNECT_LINKEDIN_LABEL },
  },
  { id: "l7", text: LIA_DRAFT_MESSAGES.automationAsk },
  { id: "l8", text: LIA_DRAFT_MESSAGES.teamAsk },
  { id: "l9", text: LIA_DRAFT_MESSAGES.inviteDone },
  { id: "l10", text: LIA_DRAFT_MESSAGES.tourOffer },
  {
    id: "l11",
    text: LIA_DRAFT_MESSAGES.tourStep1,
    paragraphIllustrations: TOUR_STEP_1_PARAGRAPH_ILLUSTRATIONS,
  },
  { id: "l12", text: LIA_DRAFT_MESSAGES.tourStep2 },
  {
    id: "l13",
    text: LIA_DRAFT_MESSAGES.tourStep3,
    paragraphBoardChips: { 0: "Social Media Content board" },
  },
  { id: "l14", text: LIA_DRAFT_MESSAGES.tourEnd },
] as const;

// Legacy exports kept for AgentScanFlowData compatibility
export const LIA_SOCIAL_USER_MESSAGE = LIA_FIRST_ACTION_DEFAULT;

export const LIA_SOCIAL_MESSAGES = {
  scanning: LIA_DRAFT_MESSAGES.draftIntro,
  rolesFound: LIA_DRAFT_MESSAGES.brandVoiceAck,
  roleFocus: LIA_DRAFT_MESSAGES.topicAsk,
  sourcingIntro: LIA_DRAFT_MESSAGES.draftingIntro,
  candidatesDone: LIA_DRAFT_MESSAGES.postDelivered,
  automationAsk: LIA_DRAFT_MESSAGES.automationAsk,
  teamAsk: LIA_DRAFT_MESSAGES.teamAsk,
  inviteDone: LIA_DRAFT_MESSAGES.inviteDone,
  tourOffer: LIA_DRAFT_MESSAGES.tourOffer,
  tourStep1: LIA_DRAFT_MESSAGES.tourStep1,
  tourStep2: LIA_DRAFT_MESSAGES.tourStep2,
  tourStep3: LIA_DRAFT_MESSAGES.tourStep3,
  tourEnd: LIA_DRAFT_MESSAGES.tourEnd,
} as const;

export const LIA_SOCIAL_SCRIPT = LIA_DRAFT_SCRIPT;

export const LIA_FOCUS_TITLE = LIA_TOPIC_TITLE;
export const LIA_FOCUS_OPTIONS = LIA_TOPIC_OPTIONS;

export const LIA_SOCIAL_PLAN = {
  summary: "Researching Nike brand voice from nike.com",
  steps: LIA_BRAND_RESEARCH_STEPS.map((step) => ({
    stepId: step.id,
    blockName: step.label,
    purpose: step.label,
  })),
} as const;

export const LIA_CONTENT_STEPS = LIA_DRAFTING_STEPS;

export const LIA_CAMPAIGN_ROWS = [] as const;
export const LIA_POST_ROWS = [] as const;

export type BoardTableRow = {
  name: string;
  starred?: boolean;
  location: string;
  timeline: string;
  personActive?: boolean;
};

export type BoardTableGroup = {
  id: string;
  title: string;
  color: string;
  rows: BoardTableRow[];
};

export const LIA_BOARD_TABLE_GROUPS: BoardTableGroup[] = [
  {
    id: "linkedin-post",
    title: "LinkedIn posts",
    color: "#0073ea",
    rows: [
      {
        name: "My first AI agent at work",
        starred: true,
        location: "LinkedIn",
        timeline: "Ready",
        personActive: true,
      },
    ],
  },
];
