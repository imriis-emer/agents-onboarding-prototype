import { Button, Heading, IconButton, Text } from "@vibe/core";
import { CloseSmall } from "@mondaydotcomorg/icons";
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import sidekickIcon from "../assets/ai-icons/ai-sidekick.svg";
import agentsIcon from "../assets/ai-icons/agents.svg";
import vibeIcon from "../assets/ai-icons/vibe.svg";
import workflowsIcon from "../assets/ai-icons/workflows.svg";
import notetakerIcon from "../assets/ai-icons/notetaker.svg";
import styles from "./ProductContextBanner.module.scss";

type ProductContextBannerTone =
  | "sidekick"
  | "agents"
  | "vibe"
  | "workflows"
  | "notetaker";

const PRODUCT_ICONS: Record<ProductContextBannerTone, string> = {
  sidekick: sidekickIcon,
  agents: agentsIcon,
  vibe: vibeIcon,
  workflows: workflowsIcon,
  notetaker: notetakerIcon,
};

const DISMISSED_BANNER_STORAGE_PREFIX =
  "boards.productContextBanner.dismissed.session";

function getDismissedBannerStorageKey(tone: ProductContextBannerTone) {
  return `${DISMISSED_BANNER_STORAGE_PREFIX}.${tone}`;
}

function readDismissedBannerState(tone: ProductContextBannerTone) {
  try {
    return (
      sessionStorage.getItem(getDismissedBannerStorageKey(tone)) === "true"
    );
  } catch {
    return false;
  }
}

function persistDismissedBannerState(tone: ProductContextBannerTone) {
  try {
    sessionStorage.setItem(getDismissedBannerStorageKey(tone), "true");
  } catch {
    // Keep the in-memory dismissal even when storage is unavailable.
  }
}

interface TourStep {
  title: string;
  body: string;
  target: string;
  preferredPlacement?: TourPlacement;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface ScrollPosition {
  element: Element | Window;
  top: number;
  left: number;
}

type TourPlacement = "right" | "left" | "bottom" | "top";

function ProductBannerGlyph({ tone }: { tone: ProductContextBannerTone }) {
  const glyphPaths: Record<ProductContextBannerTone, ReactNode> = {
    sidekick: (
      <path d="M9.951 2c1.323-.006 1.858 1.14 1.998 1.48.102.247.17.49.213.662.061.24.06.255.081.329.213.74.429 1.534.907 2.142l.091.106c.423.46 1.038.66 1.673.82.118.03.24.056.403.093.153.034.337.076.526.128.371.102.85.266 1.303.585h.002c.37.261.631.621.76 1.02l.047.172.002.006c.093.427.019.79-.067 1.036a2.447 2.447 0 0 1-.164.372l-.004.009-.004.009c-.186.368-.475.614-.792.792-.278.156-.642.296-1.118.44-.743.223-1.588.416-2.27.897l-.136.102c-.29.235-.484.544-.63.89l-.06.153c-.153.413-.25.876-.358 1.319-.12.495-.252.924-.436 1.267-.235.439-.55.728-.93.911v.001l-.012.005-.004.003-.001-.001c-.11.053-.262.123-.445.179l-.06.017-.059.014c-.828.18-1.487-.264-1.57-.313l-.123-.073-.109-.096a2.235 2.235 0 0 1-.514-.717 6.52 6.52 0 0 1-.353-.961c-.236-.8-.443-1.713-.967-2.393l-.116-.135c-.512-.544-1.284-.718-2.023-.896-.476-.115-.864-.223-1.171-.349-.327-.133-.676-.331-.957-.685h-.001l-.094-.116-.037-.047-.034-.05a2.02 2.02 0 0 1-.335-1.02L2 10.057v-.05c0-.682.34-1.312.922-1.688l.02-.012.022-.013a2.524 2.524 0 0 1 .272-.142l.035-.016c.495-.233 1.104-.383 1.67-.558.583-.18 1.162-.395 1.628-.77.332-.268.54-.632.694-1.043.152-.411.25-.872.357-1.314.026-.107.12-.585.286-.982.168-.402.581-1.158 1.516-1.406h.003c.22-.058.414-.063.506-.063v-.001L9.94 2l.01-.001V2Z" />
    ),
    agents: (
      <path d="M9.888 2.467a3.839 3.839 0 0 1 2.869.494 3.759 3.759 0 0 1 1.715 3.831 3.759 3.759 0 0 1-.534 1.374l-1.301 2.036a3.85 3.85 0 0 1 1.5-.302l.198.005a3.863 3.863 0 0 1 3.661 3.857l-.005.198a3.862 3.862 0 0 1-3.854 3.664l-.2-.005a3.865 3.865 0 0 1-3.66-3.659l-.002-.058-1.254 1.966a3.792 3.792 0 0 1-1.38 1.289l-.215.107c-.507.237-1.06.36-1.622.36l-.255-.01a3.831 3.831 0 0 1-1.457-.396l-.224-.12a3.792 3.792 0 0 1-1.265-1.213l-.131-.216a3.75 3.75 0 0 1-.468-1.683l-.001-.252a3.75 3.75 0 0 1 .459-1.685l.129-.217L7.508 4.13c.234-.366.53-.688.873-.955l.15-.11c.408-.286.87-.489 1.357-.598Z" />
    ),
    vibe: (
      <path d="M3.831 3.62a3.957 3.957 0 0 1 5.463 1.211l.684 1.073.684-1.073a3.957 3.957 0 0 1 6.674 4.252l-4.022 6.315a3.942 3.942 0 0 1-1.21 1.209l.002.001c-.012.008-.024.014-.036.02a3.933 3.933 0 0 1-1.892.593c-.033.002-.066.006-.099.007h-.202l-.106-.006-.083-.004-.011-.001a3.934 3.934 0 0 1-1.652-.503l-.131-.08-.01-.005-.033-.02a3.939 3.939 0 0 1-1.282-1.326l-3.949-6.2A3.957 3.957 0 0 1 3.831 3.62Z" />
    ),
    workflows: (
      <path d="M9.147 3.183a1.31 1.31 0 0 1 1.852 0l2.73 2.731c.132.132.23.284.294.447h.359a1.8 1.8 0 0 1 1.8 1.8v2.973A3.028 3.028 0 1 1 15.2 11.16v-3a.818.818 0 0 0-.818-.818h-.369c-.064.154-.158.298-.283.423l-2.731 2.731a1.31 1.31 0 0 1-1.852 0L6.416 7.766a1.31 1.31 0 0 1-.283-.423h-.588a.818.818 0 0 0-.818.818v3.261h1.162c.684 0 1.238.554 1.238 1.238v3.251c0 .684-.554 1.238-1.238 1.238H2.638A1.238 1.238 0 0 1 1.4 15.911V12.66c0-.684.554-1.238 1.238-1.238h1.107V8.161a1.8 1.8 0 0 1 1.8-1.8h.578c.064-.163.162-.315.293-.447l2.731-2.731Z" />
    ),
    notetaker: (
      <>
        <path d="M10 1.472a2.417 2.417 0 0 1 2.416 2.417V16.11a2.417 2.417 0 1 1-4.833 0V3.89A2.417 2.417 0 0 1 10 1.472Z" />
        <path d="M5.277 3.694a.75.75 0 0 1 .75.75v11.112a.75.75 0 0 1-1.5 0V4.444a.75.75 0 0 1 .75-.75Zm9.445 0a.75.75 0 0 1 .75.75v11.112a.75.75 0 0 1-1.5 0V4.444a.75.75 0 0 1 .75-.75Zm-12.5 3.889a.75.75 0 0 1 .75.75v3.333a.75.75 0 0 1-1.5 0V8.333a.75.75 0 0 1 .75-.75Zm15.555 0a.75.75 0 0 1 .75.75v3.333a.75.75 0 0 1-1.5 0V8.333a.75.75 0 0 1 .75-.75Z" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 20 20"
      className={styles.artworkIcon}
      aria-hidden="true"
      focusable="false"
    >
      {glyphPaths[tone]}
    </svg>
  );
}

const TOUR_STEPS: Record<ProductContextBannerTone, TourStep[]> = {
  sidekick: [
    {
      title: "Talk to Sidekick",
      body: "This is where you talk to Sidekick - ask a question, request a task, or just think out loud. It answers and acts, right here.",
      target: "sidekick-composer",
    },
    {
      title: "Give Sidekick the full picture",
      body: "Add your own data and info as context - the more Sidekick knows about your work, the sharper and more useful its answers get.",
      target: "sidekick-context",
    },
  ],
  agents: [
    {
      title: "Hand off the busywork",
      body: "Describe a job you're tired of doing manually, and Agents will do it for you.",
      target: "agents-composer",
    },
    {
      title: "Add context, build it smarter",
      body: "Add context about your work - the more you share, the sharper and more useful Agents gets.",
      target: "agents-context",
      preferredPlacement: "top",
    },
  ],
  vibe: [
    {
      title: "Describe it, get an app",
      body: "Describe the app your team needs. Vibe builds it - connected to your data, ready to use.",
      target: "vibe-composer",
    },
    {
      title: "Start faster with a template",
      body: "Skip the prompt - pick a ready-made app and customize it from there.",
      target: "vibe-prebuilt",
      preferredPlacement: "top",
    },
  ],
  workflows: [
    {
      title: "Describe the workflow",
      body: "Tell Workflows what should happen and it turns your process into an automated flow.",
      target: "workflows-composer",
    },
    {
      title: "Start with a template",
      body: "Pick a ready-made workflow for common jobs, then adjust it to fit your team.",
      target: "workflows-templates",
      preferredPlacement: "top",
    },
  ],
  notetaker: [
    {
      title: "Invite it to a meeting",
      body: "Add Notetaker to any meeting - it joins, listens, and takes the notes for you.",
      target: "notetaker-upcoming",
    },
    {
      title: "Every meeting, searchable",
      body: "Every past meeting's already searchable here - summaries, participants, and recordings in one place.",
      target: "notetaker-searchable",
    },
  ],
};

function getTargetRect(target: string): TargetRect | null {
  const element = document.querySelector(`[data-tour-target="${target}"]`);

  if (!element) return null;

  const rect = element.getBoundingClientRect();

  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

function isTargetVisible(rect: TargetRect): boolean {
  const verticalInset = 48;
  const horizontalInset = 48;

  return (
    rect.top >= verticalInset &&
    rect.left >= horizontalInset &&
    rect.top + rect.height <= window.innerHeight - verticalInset &&
    rect.left + rect.width <= window.innerWidth - horizontalInset
  );
}

function captureScrollPositions(): ScrollPosition[] {
  const positions: ScrollPosition[] = [
    { element: window, top: window.scrollY, left: window.scrollX },
  ];

  document.querySelectorAll("*").forEach((element) => {
    if (!(element instanceof HTMLElement)) return;

    const canScrollVertically = element.scrollHeight > element.clientHeight + 1;
    const canScrollHorizontally = element.scrollWidth > element.clientWidth + 1;

    if (!canScrollVertically && !canScrollHorizontally) return;

    positions.push({
      element,
      top: element.scrollTop,
      left: element.scrollLeft,
    });
  });

  return positions;
}

function restoreScrollPositions(positions: ScrollPosition[]) {
  positions.forEach(({ element, top, left }) => {
    if (element === window) {
      window.scrollTo({ top, left, behavior: "auto" });
      return;
    }

    if (element instanceof HTMLElement) {
      element.scrollTop = top;
      element.scrollLeft = left;
    }
  });
}

function getTooltipPosition(
  rect: TargetRect | null,
  preferredPlacement?: TourPlacement,
): {
  style: CSSProperties;
  placement: TourPlacement;
} {
  if (!rect) {
    return {
      style: { left: "50%", top: "50%", transform: "translate(-50%, -50%)" },
      placement: "bottom",
    };
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const cardWidth = 300;
  const cardHeight = 164;
  const gap = 24;
  const isWideTarget = rect.width > viewportWidth * 0.35;

  if (preferredPlacement === "top") {
    return {
      style: {
        left: Math.min(
          viewportWidth - cardWidth - 24,
          Math.max(24, rect.left + rect.width / 2 - cardWidth / 2),
        ),
        top: Math.max(24, rect.top - cardHeight - gap),
      },
      placement: "top",
    };
  }

  if (
    !isWideTarget &&
    rect.left + rect.width + cardWidth + gap < viewportWidth - 24
  ) {
    return {
      style: {
        left: rect.left + rect.width + gap,
        top: Math.min(
          viewportHeight - cardHeight - 24,
          Math.max(24, rect.top + rect.height / 2 - cardHeight / 2),
        ),
      },
      placement: "right",
    };
  }

  if (!isWideTarget && rect.left - cardWidth - gap > 24) {
    return {
      style: {
        left: rect.left - cardWidth - gap,
        top: Math.min(
          viewportHeight - cardHeight - 24,
          Math.max(24, rect.top + rect.height / 2 - cardHeight / 2),
        ),
      },
      placement: "left",
    };
  }

  return {
    style: {
      left: Math.min(
        viewportWidth - cardWidth - 24,
        Math.max(24, rect.left + rect.width / 2 - cardWidth / 2),
      ),
      top: Math.min(
        viewportHeight - cardHeight - 24,
        rect.top + rect.height + gap,
      ),
    },
    placement: "bottom",
  };
}

interface ProductContextBannerProps {
  tone: ProductContextBannerTone;
  title: ReactNode;
  description: ReactNode;
  actionLabel?: string;
}

export function ProductContextBanner({
  tone,
  title,
  description,
  actionLabel,
}: ProductContextBannerProps) {
  const [isDismissed, setIsDismissed] = useState(() =>
    readDismissedBannerState(tone),
  );
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const scrollPositionsRef = useRef<ScrollPosition[]>([]);
  const titleId = `${tone}-context-banner-title`;
  const tourSteps = TOUR_STEPS[tone];
  const tourStep = tourSteps[tourStepIndex];
  const isFirstTourStep = tourStepIndex === 0;
  const isLastTourStep = tourStepIndex === tourSteps.length - 1;
  const tooltipPosition = getTooltipPosition(
    targetRect,
    tourStep.preferredPlacement,
  );

  useLayoutEffect(() => {
    if (!isTourOpen) return;

    const target = document.querySelector(
      `[data-tour-target="${tourStep.target}"]`,
    );

    const updateTargetRect = () => {
      setTargetRect(getTargetRect(tourStep.target));
    };

    const nextRect = getTargetRect(tourStep.target);

    if (target && nextRect && !isTargetVisible(nextRect)) {
      target.scrollIntoView({ block: "center", behavior: "auto" });
    }

    updateTargetRect();
    const animationFrame = window.requestAnimationFrame(updateTargetRect);

    window.addEventListener("resize", updateTargetRect);
    window.addEventListener("scroll", updateTargetRect, true);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", updateTargetRect);
      window.removeEventListener("scroll", updateTargetRect, true);
    };
  }, [isTourOpen, tourStep.target]);

  const closeTour = () => {
    setIsTourOpen(false);
    setTargetRect(null);
    const positions = scrollPositionsRef.current;

    window.requestAnimationFrame(() => {
      restoreScrollPositions(positions);
      window.requestAnimationFrame(() => restoreScrollPositions(positions));
      window.setTimeout(() => restoreScrollPositions(positions), 120);
      window.setTimeout(() => restoreScrollPositions(positions), 320);
    });
  };

  const dismissBanner = () => {
    persistDismissedBannerState(tone);
    closeTour();
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  return (
    <>
      <section
        className={`${styles.banner} ${styles[tone]}`}
        data-testid="product-context-banner"
        aria-labelledby={titleId}
      >
        <div className={styles.artwork} aria-hidden="true">
          <img
            className={styles.artworkLogo}
            src={PRODUCT_ICONS[tone]}
            alt=""
          />
        </div>
        <div className={styles.copy}>
          <Heading
            type="h2"
            weight="medium"
            ellipsis={false}
            className={styles.title}
            id={titleId}
          >
            {title}
          </Heading>
          <Text
            type="text2"
            color="secondary"
            ellipsis={false}
            className={styles.description}
          >
            {description}
          </Text>
        </div>
        {actionLabel && (
          <Button
            kind="secondary"
            size="small"
            className={styles.action}
            onClick={() => {
              scrollPositionsRef.current = captureScrollPositions();
              setTourStepIndex(0);
              setIsTourOpen(true);
            }}
          >
            {actionLabel}
          </Button>
        )}
        <IconButton
          icon={CloseSmall}
          kind="tertiary"
          size="small"
          className={styles.dismissButton}
          aria-label="Dismiss banner"
          onClick={dismissBanner}
        />
      </section>
      {actionLabel &&
        isTourOpen &&
        createPortal(
          <div
            className={styles.tourOverlay}
            role="dialog"
            aria-modal="true"
            aria-label={`${tone} page walkthrough`}
          >
            {targetRect && (
              <div
                key={tourStep.target}
                className={styles.tourHighlight}
                style={{
                  top: targetRect.top - 8,
                  left: targetRect.left - 8,
                  width: targetRect.width + 16,
                  height: targetRect.height + 16,
                }}
                aria-hidden="true"
              />
            )}
            <div
              key={`${tourStep.target}-${tooltipPosition.placement}`}
              className={`${styles.tourCard} ${styles[tooltipPosition.placement]}`}
              style={tooltipPosition.style}
            >
              <IconButton
                icon={CloseSmall}
                kind="tertiary"
                size="small"
                className={styles.tourCloseButton}
                aria-label="Close walkthrough"
                onClick={dismissBanner}
              />
              <div className={styles.tourCopy} key={tourStep.title}>
                <Text type="text3" weight="medium" color="secondary">
                  Step {tourStepIndex + 1} of {tourSteps.length}
                </Text>
                <Text
                  type="text2"
                  weight="medium"
                  color="primary"
                  ellipsis={false}
                >
                  {tourStep.title}
                </Text>
                <Text type="text3" color="secondary" ellipsis={false}>
                  {tourStep.body}
                </Text>
              </div>
              <div className={styles.tourFooter}>
                <div className={styles.tourBackSlot}>
                  {!isFirstTourStep && (
                    <Button
                      kind="tertiary"
                      size="small"
                      onClick={() =>
                        setTourStepIndex((currentStep) =>
                          Math.max(0, currentStep - 1),
                        )
                      }
                    >
                      Back
                    </Button>
                  )}
                </div>
                <span className={styles.tourDots} aria-hidden="true">
                  {tourSteps.map((step, index) => (
                    <span
                      key={step.title}
                      className={
                        index === tourStepIndex ? styles.activeDot : styles.dot
                      }
                    />
                  ))}
                </span>
                <div className={styles.tourNextSlot}>
                  <Button
                    kind="primary"
                    size="small"
                    onClick={() => {
                      if (isLastTourStep) {
                        dismissBanner();
                        return;
                      }
                      setTourStepIndex((currentStep) => currentStep + 1);
                    }}
                  >
                    {isLastTourStep ? "Done" : "Next"}
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
