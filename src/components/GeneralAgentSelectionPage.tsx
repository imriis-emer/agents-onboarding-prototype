import { useCallback, useEffect, useRef, useState, type UIEvent } from "react";
import { Button, IconButton } from "@vibe/core";
import {
  DropdownChevronLeft,
  DropdownChevronRight,
} from "@mondaydotcomorg/icons";
import {
  getAgentCardsForFocus,
  getFocusLabel,
  type GeneralAgentCard,
} from "../data/generalOnboardingData";
import type { AgentFlowId } from "../data/agentFlows";
import styles from "./GeneralAgentSelectionPage.module.scss";

const SCROLL_EDGE_PX = 16;

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
      ? Number.parseFloat(window.getComputedStyle(row).gap) || 24
      : 24;
  return card.offsetWidth + gap;
}

function getScrollPage(scroller: HTMLDivElement): number {
  const step = getCardStep(scroller);
  if (step <= 0) return scroller.clientWidth;

  const visibleCards = Math.max(1, Math.floor(scroller.clientWidth / step));
  return step * Math.max(2, visibleCards);
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

function AgentSelectionCard({
  card,
  onSelect,
}: {
  card: GeneralAgentCard;
  onSelect: (card: GeneralAgentCard) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const playVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.muted = false;
    video.volume = 1;
    void video.play().catch(() => {
      video.muted = true;
      void video.play().catch(() => undefined);
    });
  };

  const pauseVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    video.muted = true;
  };

  return (
    <button
      type="button"
      className={styles.agentCard}
      style={{ backgroundColor: card.bg }}
      onClick={() => onSelect(card)}
      onMouseEnter={playVideo}
      onMouseLeave={pauseVideo}
      onFocus={playVideo}
      onBlur={pauseVideo}
    >
      <video
        ref={videoRef}
        className={styles.agentImage}
        src={card.video}
        poster={card.poster}
        preload="metadata"
        playsInline
        loop
        muted
        aria-hidden="true"
      />
      <div className={styles.agentPanel}>
        <span className={styles.agentName}>{card.agentName}</span>
        <span className={styles.agentTitle}>{card.title}</span>
        <p className={styles.agentDescription}>{card.description}</p>
      </div>
    </button>
  );
}

export function GeneralAgentSelectionPage({
  focusId,
  focusLabel,
  onSelectAgent,
  onBack,
  embedded = false,
}: {
  focusId: string;
  focusLabel?: string;
  onSelectAgent: (flowId: AgentFlowId, card: GeneralAgentCard) => void;
  onBack?: () => void;
  embedded?: boolean;
}) {
  const cards = getAgentCardsForFocus(focusId);
  const resolvedFocusLabel = focusLabel ?? getFocusLabel(focusId);
  const cardRowRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(cards.length > 1);

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
    const scroller = cardRowRef.current;
    if (!scroller) return;

    const measure = () => updateScrollState(scroller);
    measure();
    const frame = window.requestAnimationFrame(measure);

    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    const row = scroller.firstElementChild;
    if (row instanceof HTMLElement) observer.observe(row);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [updateScrollState]);

  const handleCardSelect = (card: GeneralAgentCard) => {
    if (card.flowId) {
      onSelectAgent(card.flowId, card);
    }
  };

  const handleCardRowScroll = (event: UIEvent<HTMLDivElement>) => {
    updateScrollState(event.currentTarget);
  };

  const scrollByCard = (direction: -1 | 1) => {
    const scroller = cardRowRef.current;
    if (!scroller) return;

    const maxScroll = getMaxScroll(scroller);
    if (maxScroll <= 0) return;

    const page = getScrollPage(scroller);
    const nextLeft = Math.max(
      0,
      Math.min(maxScroll, scroller.scrollLeft + direction * page),
    );
    if (Math.abs(nextLeft - scroller.scrollLeft) < 1) return;

    scroller.scrollTo({ left: nextLeft, behavior: "smooth" });
  };

  return (
    <div className={embedded ? styles.embeddedPage : styles.page}>
      <div className={styles.content}>
        {onBack && (
          <div className={styles.topBar}>
            <Button kind="tertiary" size="medium" onClick={onBack}>
              <span className={styles.backArrow} aria-hidden="true">
                &larr;
              </span>
              Back
            </Button>
          </div>
        )}

        <div className={styles.headingBlock}>
          <h1 className={styles.title}>Select a {resolvedFocusLabel} agent</h1>
          <p className={styles.subtitle}>Pick one to start. Add more later.</p>
        </div>

        <div
          ref={cardRowRef}
          className={styles.cardScroller}
          onScroll={handleCardRowScroll}
        >
          <div className={styles.cardRow}>
            {cards.map((card) => (
              <AgentSelectionCard
                key={card.id}
                card={card}
                onSelect={handleCardSelect}
              />
            ))}
          </div>
        </div>

        <div className={styles.carouselNav}>
          <IconButton
            className={styles.carouselButton}
            icon={DropdownChevronLeft}
            kind="tertiary"
            size="small"
            aria-label="Previous agents"
            disabled={!canScrollLeft}
            onClick={() => scrollByCard(-1)}
          />
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
          <IconButton
            className={styles.carouselButton}
            icon={DropdownChevronRight}
            kind="tertiary"
            size="small"
            aria-label="Next agents"
            disabled={!canScrollRight}
            onClick={() => scrollByCard(1)}
          />
        </div>

        <div className={styles.galleryPrompt}>
          <span>None of these quite fit?</span>
          <button type="button" className={styles.galleryButton}>
            Browse agents gallery
          </button>
        </div>
      </div>
    </div>
  );
}
