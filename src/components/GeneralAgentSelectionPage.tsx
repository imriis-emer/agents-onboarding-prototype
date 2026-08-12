import { useRef } from "react";
import { Button } from "@vibe/core";
import {
  getAgentCardsForFocus,
  getFocusLabel,
  type GeneralAgentCard,
} from "../data/generalOnboardingData";
import type { AgentFlowId } from "../data/agentFlows";
import styles from "./GeneralAgentSelectionPage.module.scss";

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

  const handleCardSelect = (card: GeneralAgentCard) => {
    if (card.flowId) {
      onSelectAgent(card.flowId, card);
    }
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

        <div className={styles.cardRow}>
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
              className={index === 0 ? styles.dotActive : styles.dot}
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
