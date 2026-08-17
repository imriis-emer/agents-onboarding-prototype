import { useRef, useState, type UIEvent } from "react";
import { Button } from "@vibe/core";
import {
  getAgentCardsForFocus,
  getFocusLabel,
  type GeneralAgentCard,
} from "../data/generalOnboardingData";
import type { AgentFlowId } from "../data/agentFlows";
import styles from "./GeneralAgentSelectionPage.module.scss";

const SCROLL_EDGE_PX = 16;

function getActiveCardIndex(
  row: HTMLDivElement | null,
  cardCount: number,
): number {
  if (!row || cardCount <= 1) return 0;

  const maxScroll = row.scrollWidth - row.clientWidth;
  if (maxScroll <= 0) return 0;

  if (row.scrollLeft <= SCROLL_EDGE_PX) return 0;
  if (row.scrollLeft >= maxScroll - SCROLL_EDGE_PX) return cardCount - 1;

  const rowRect = row.getBoundingClientRect();
  const rowCenter = rowRect.left + rowRect.width / 2;
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  Array.from(row.children).forEach((child, index) => {
    if (!(child instanceof HTMLElement)) return;
    const childRect = child.getBoundingClientRect();
    const childCenter = childRect.left + childRect.width / 2;
    const distance = Math.abs(childCenter - rowCenter);
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
  const [activeIndex, setActiveIndex] = useState(0);

  const handleCardSelect = (card: GeneralAgentCard) => {
    if (card.flowId) {
      onSelectAgent(card.flowId, card);
    }
  };

  const handleCardRowScroll = (event: UIEvent<HTMLDivElement>) => {
    const row = event.currentTarget;
    const nextIndex = getActiveCardIndex(row, cards.length);
    setActiveIndex((prev) => (prev === nextIndex ? prev : nextIndex));
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

        <div className={styles.cardRow} onScroll={handleCardRowScroll}>
          {cards.map((card) => (
            <AgentSelectionCard
              key={card.id}
              card={card}
              onSelect={handleCardSelect}
            />
          ))}
        </div>

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
