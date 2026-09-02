import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type UIEvent,
} from "react";
import { IconButton } from "@vibe/core";
import {
  DropdownChevronLeft,
  DropdownChevronRight,
} from "@mondaydotcomorg/icons";
import { MondayMulticolorMark } from "./ProductLogos";
import {
  getSolutionCardsForFocus,
  type GeneralSolutionCard,
} from "../data/generalOnboardingData";
import type { AgentFlowId } from "../data/agentFlows";
import styles from "./GeneralAgentSelectionPage.module.scss";

const SCROLL_EDGE_PX = 16;
const VISIBLE_CARDS = 3;
const CARD_GAP_PX = 24;

function getCardElements(scroller: HTMLDivElement): HTMLElement[] {
  const row = scroller.firstElementChild;
  if (!row) return [];
  return Array.from(row.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement,
  );
}

function getMaxScroll(scroller: HTMLDivElement): number {
  return Math.max(0, scroller.scrollWidth - scroller.clientWidth);
}

function getCardStep(scroller: HTMLDivElement): number {
  const cards = getCardElements(scroller);
  const card = cards[0];
  if (!card) return 0;

  const row = scroller.firstElementChild;
  const gap =
    row instanceof HTMLElement
      ? Number.parseFloat(window.getComputedStyle(row).gap) || CARD_GAP_PX
      : 40;
  return card.offsetWidth + gap;
}

function getActiveCardIndex(
  scroller: HTMLDivElement | null,
  cardCount: number,
): number {
  if (!scroller || cardCount <= 1) return 0;

  const maxScroll = getMaxScroll(scroller);
  if (scroller.scrollLeft <= SCROLL_EDGE_PX) return 0;
  if (maxScroll > 0 && scroller.scrollLeft >= maxScroll - SCROLL_EDGE_PX) {
    return cardCount - 1;
  }

  const viewport = scroller.getBoundingClientRect();
  const viewportCenter = viewport.left + viewport.width / 2;
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  getCardElements(scroller).forEach((child, index) => {
    const childRect = child.getBoundingClientRect();
    const childCenter = childRect.left + childRect.width / 2;
    const distance = Math.abs(childCenter - viewportCenter);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}

function SolutionCard({
  card,
  onSelect,
}: {
  card: GeneralSolutionCard;
  onSelect: (card: GeneralSolutionCard) => void;
}) {
  return (
    <button
      type="button"
      className={styles.solutionCard}
      onClick={() => onSelect(card)}
    >
      <div className={styles.solutionPreview}>
        <img className={styles.solutionImage} src={card.image} alt="" />
      </div>
      <div className={styles.solutionBody}>
        <h2 className={styles.solutionTitle}>{card.title}</h2>
        <ol className={styles.solutionBullets}>
          {card.bullets.map((bullet, index) => (
            <li key={bullet}>
              <span className={styles.bulletIndex}>{index + 1}</span>
              {bullet}
            </li>
          ))}
        </ol>
      </div>
    </button>
  );
}

export function GeneralAgentSelectionPage({
  focusId,
  onSelectAgent,
  onStartFromScratch,
  embedded = false,
}: {
  focusId: string;
  focusLabel?: string;
  onSelectAgent: (flowId: AgentFlowId, card: GeneralSolutionCard) => void;
  onBack?: () => void;
  onStartFromScratch?: () => void;
  embedded?: boolean;
}) {
  const cards = getSolutionCardsForFocus(focusId);
  const viewportRef = useRef<HTMLDivElement>(null);
  const cardRowRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(cards.length > 3);

  const updateScrollState = useCallback(
    (scroller: HTMLDivElement) => {
      const nextIndex = getActiveCardIndex(scroller, cards.length);
      const maxScroll = getMaxScroll(scroller);

      setActiveIndex((prev) => (prev === nextIndex ? prev : nextIndex));
      setCanScrollLeft(scroller.scrollLeft > SCROLL_EDGE_PX);
      setCanScrollRight(scroller.scrollLeft < maxScroll - SCROLL_EDGE_PX);
    },
    [cards.length],
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    const scroller = cardRowRef.current;
    if (!viewport || !scroller) return;

    const measure = () => {
      const gap =
        window.matchMedia("(max-width: 960px)").matches ? 16 : CARD_GAP_PX;
      const nextWidth = Math.floor(
        (viewport.clientWidth - gap * (VISIBLE_CARDS - 1)) / VISIBLE_CARDS,
      );
      setCardWidth((prev) => (prev === nextWidth ? prev : nextWidth));
      updateScrollState(scroller);
    };
    measure();
    const frame = window.requestAnimationFrame(measure);

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(scroller);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [updateScrollState]);

  const handleCardSelect = (card: GeneralSolutionCard) => {
    onSelectAgent(card.flowId, card);
  };

  const handleCardRowScroll = (event: UIEvent<HTMLDivElement>) => {
    updateScrollState(event.currentTarget);
  };

  const scrollByCard = (direction: -1 | 1) => {
    const scroller = cardRowRef.current;
    if (!scroller) return;

    const maxScroll = getMaxScroll(scroller);
    if (maxScroll <= 0) return;

    const step = getCardStep(scroller);
    const nextLeft = Math.max(
      0,
      Math.min(maxScroll, scroller.scrollLeft + direction * step),
    );
    if (Math.abs(nextLeft - scroller.scrollLeft) < 1) return;

    scroller.scrollTo({ left: nextLeft, behavior: "smooth" });
  };

  return (
    <div className={embedded ? styles.embeddedPage : styles.page}>
      <div className={styles.content}>
        <div className={styles.headingBlock}>
          <div className={styles.logo}>
            <MondayMulticolorMark />
          </div>
          <h1 className={styles.title}>Choose the right solution for you</h1>
        </div>

        <div className={styles.cardStrip}>
          <IconButton
            className={`${styles.edgeButton} ${styles.edgeButtonLeft}`}
            icon={DropdownChevronLeft}
            kind="tertiary"
            size="medium"
            aria-label="Previous solutions"
            disabled={!canScrollLeft}
            onClick={() => scrollByCard(-1)}
          />

          <div
            ref={viewportRef}
            className={styles.cardViewport}
            style={
              cardWidth
                ? ({
                    "--solution-card-width": `${cardWidth}px`,
                  } as CSSProperties)
                : undefined
            }
          >
            <div
              ref={cardRowRef}
              className={styles.cardScroller}
              onScroll={handleCardRowScroll}
            >
              <div className={styles.cardRow}>
                {cards.map((card) => (
                  <SolutionCard
                    key={card.id}
                    card={card}
                    onSelect={handleCardSelect}
                  />
                ))}
              </div>
            </div>
          </div>

          <IconButton
            className={`${styles.edgeButton} ${styles.edgeButtonRight}`}
            icon={DropdownChevronRight}
            kind="tertiary"
            size="medium"
            aria-label="Next solutions"
            disabled={!canScrollRight}
            onClick={() => scrollByCard(1)}
          />
        </div>

        <div className={styles.carouselNav}>
          <div className={styles.dots} aria-hidden="true">
            {cards.map((card, index) => (
              <span
                key={card.id}
                className={
                  index === activeIndex
                    ? `${styles.dot} ${styles.dotActive}`
                    : styles.dot
                }
              />
            ))}
          </div>
        </div>

        <div className={styles.galleryPrompt}>
          <span>None of these quite fit?</span>
          <button
            type="button"
            className={styles.galleryButton}
            onClick={onStartFromScratch}
          >
            Start from scratch
          </button>
        </div>
      </div>
    </div>
  );
}
