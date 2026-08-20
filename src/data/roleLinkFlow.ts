import {
  TOUR_STEP_1_PARAGRAPH_ILLUSTRATIONS,
  TOUR_STEP_1_TEXT,
} from "./tourIllustrations";

export const ROLE_LINK_USER_MESSAGE = "I'll paste a link to a specific role";

export const ROLE_LINK_URL =
  "https://careers.nike.com/designer-ii-digital-design-excellence-3d-footwear-design/job/R-78401";

export const ROLE_LINK_ROLE_NAME = "3D Footwear Designer";

export const ROLE_LINK_MESSAGES = {
  askLink:
    "Paste the link to the role you're hiring for — I'll take it from there.",
  reviewingJobDescription: "I'm reviewing the job description page 📄",
  understoodRequirements: "Great, I understand the job requirements.",
  findingCandidates: "I'm finding you the best candidates now 🔍",
  candidatesDone:
    "Done! 🎯 Here are the top candidates for 3D Footwear Designer.",
  automationAsk: "Want me to keep finding candidates like this automatically?",
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

export const ROLE_LINK_THINKING_STEPS = [
  { id: "extract", label: "Extract Url" },
  { id: "search", label: "Searching for candidates online" },
  { id: "relevant", label: "Finding relevant people" },
  { id: "deeper", label: "Running a deeper search" },
] as const;

export const ROLE_LINK_OPEN_ROLES_ROWS = [
  {
    name: "3D footwear designer",
    location: "Portland, OR",
    level: "Early (0–2 yrs)",
  },
  { name: "Motion artist", location: "Austin, TX", level: "Junior–Mid" },
  {
    name: "Textile expert",
    location: "New York, NY",
    level: "Early (~2–3 yrs)",
  },
] as const;

export const ROLE_LINK_SCRIPT = [
  { id: "l1", text: ROLE_LINK_MESSAGES.askLink },
  { id: "l2", text: ROLE_LINK_MESSAGES.reviewingJobDescription },
  { id: "l3", text: ROLE_LINK_MESSAGES.understoodRequirements },
  { id: "l4", text: ROLE_LINK_MESSAGES.findingCandidates },
  { id: "l5", text: ROLE_LINK_MESSAGES.candidatesDone },
  { id: "l6", text: ROLE_LINK_MESSAGES.automationAsk },
  { id: "l7", text: ROLE_LINK_MESSAGES.teamAsk },
  { id: "l8", text: ROLE_LINK_MESSAGES.inviteDone },
  { id: "l9", text: ROLE_LINK_MESSAGES.tourOffer },
  {
    id: "l10",
    text: ROLE_LINK_MESSAGES.tourStep1,
    paragraphIllustrations: TOUR_STEP_1_PARAGRAPH_ILLUSTRATIONS,
  },
  { id: "l11", text: ROLE_LINK_MESSAGES.tourStep2 },
  { id: "l12", text: ROLE_LINK_MESSAGES.tourStep3 },
  { id: "l13", text: ROLE_LINK_MESSAGES.tourEnd },
] as const;
