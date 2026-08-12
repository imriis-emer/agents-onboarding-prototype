import jadeSelectionCard from "../assets/agents-onboarding/jade-selection-card.png";
import liaSelectionCard from "../assets/agents-onboarding/lia-selection-card.png";
import jadeHeroPoster from "../assets/agents-onboarding/jade-hero-poster.png";
import liaHeroPoster from "../assets/agents-onboarding/lia-hero-poster.png";
import type { AgentFlowId } from "./agentFlows";
import { publicAssetUrl } from "../utils/publicAssetUrl";

// Showcase cards (Liam, Tessa, Sasha) play an intro video on hover but have no
// live conversation flow. Cloudinary serves a poster frame from the same URL
// with a .jpg extension, so the still preview matches the video.
const LIAM_VIDEO_URL =
  "https://dapulse-res.cloudinary.com/video/upload/v1782893848/monday_platform/AI%20agents/avatar_videos/Liam_12282820664_20260701-111156/Liam_1x1_from_16x9_20260701-111156.mp4";
const TESSA_VIDEO_URL =
  "https://dapulse-res.cloudinary.com/video/upload/v1782893114/monday_platform/AI%20agents/avatar_videos/Tessa_12282834262_20260701-110421/Tessa_1x1_from_16x9_20260701-110421.mp4";
const SASHA_VIDEO_URL =
  "https://dapulse-res.cloudinary.com/video/upload/v1782893123/monday_platform/AI%20agents/avatar_videos/Sasha_12282847592_20260701-110421/Sasha_1x1_from_16x9_20260701-110421.mp4";

const posterFrom = (videoUrl: string) => videoUrl.replace(/\.mp4$/, ".jpg");
const LIAM_POSTER_URL = posterFrom(LIAM_VIDEO_URL);
const TESSA_POSTER_URL = posterFrom(TESSA_VIDEO_URL);
const SASHA_POSTER_URL = posterFrom(SASHA_VIDEO_URL);

export interface AgentTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  /**
   * Still frame shown before hover (and while the video loads). Falls back to
   * `image` when omitted. For video cards this should match the video, not the
   * campaign creative.
   */
  poster?: string;
  /** Accent color used for tags / hover states. */
  accent: string;
  /**
   * When set, selecting the template hands the prototype off to that live flow
   * (Jade or Lia). When omitted, the card is a demo example and stays inert.
   */
  flowId?: AgentFlowId;
  /** Intro video played on hover (with sound) for live and showcase templates. */
  videoSrc?: string;
}

export const AGENT_TEMPLATES: readonly AgentTemplate[] = [
  {
    id: "recruiting",
    name: "Jade",
    category: "Recruiting",
    description:
      "Sources candidates, screens resumes, and ranks the best fits for your open roles.",
    image: jadeSelectionCard,
    poster: jadeHeroPoster,
    accent: "#5559df",
    flowId: "jade",
    videoSrc: publicAssetUrl("agents-onboarding/jade-hero.mp4"),
  },
  {
    id: "social-media",
    name: "Lia",
    category: "Social Media",
    description:
      "Drafts on-brand posts, plans campaigns, and keeps your channels active.",
    image: liaSelectionCard,
    poster: liaHeroPoster,
    accent: "#e2445c",
    flowId: "lia",
    videoSrc: publicAssetUrl("agents-onboarding/lia-hero.mp4"),
  },
  {
    id: "project-manager",
    name: "Liam",
    category: "Project Manager",
    description:
      "I'll capture your goals and scope so every project starts clear and finishes strong.",
    image: LIAM_POSTER_URL,
    poster: LIAM_POSTER_URL,
    accent: "#00c875",
    videoSrc: LIAM_VIDEO_URL,
  },
  {
    id: "chief-of-staff",
    name: "Tessa",
    category: "Chief of Staff",
    description:
      "I'll monitor your priorities, surface blockers, and keep strategic initiatives on track.",
    image: TESSA_POSTER_URL,
    poster: TESSA_POSTER_URL,
    accent: "#ff642e",
    videoSrc: TESSA_VIDEO_URL,
  },
  {
    id: "lead-qualifier",
    name: "Sasha",
    category: "Lead Qualifier",
    description:
      "I'll score and prioritize your leads against the criteria you care about.",
    image: SASHA_POSTER_URL,
    poster: SASHA_POSTER_URL,
    accent: "#fdab3d",
    videoSrc: SASHA_VIDEO_URL,
  },
] as const;
