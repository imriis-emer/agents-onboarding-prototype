import { useRef, useState } from "react";
import type {
  FlowAgentSelectionCard,
  FlowAgentSelectionConfig,
} from "../data/flowAgentSelectionData";
import styles from "./FlowAgentSelectionPage.module.scss";

const SELECTION_ADVANCE_MS = 420;

function AgentSelectionCard({
  agentName,
  title,
  description,
  image,
  imagePosition = "center top",
  background,
  composed = false,
  selected,
  dimmed,
  onSelect,
}: {
  agentName: string;
  title: string;
  description: string;
  image: string;
  imagePosition?: string;
  background: string;
  composed?: boolean;
  selected: boolean;
  dimmed: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.agentCard} ${selected ? styles.agentCardSelected : ""} ${
        dimmed ? styles.agentCardDimmed : ""
      }`}
      onClick={onSelect}
      aria-label={title}
      aria-pressed={selected}
      disabled={selected}
    >
      <span
        className={styles.cardMedia}
        style={composed ? undefined : { backgroundColor: background }}
      >
        <img
          className={composed ? styles.agentImageComposed : styles.agentImage}
          src={image}
          alt=""
          aria-hidden="true"
          style={composed ? undefined : { objectPosition: imagePosition }}
        />
        <span className={styles.agentPanel}>
          <span className={styles.agentName}>{agentName}</span>
          <span className={styles.agentTitle}>{title}</span>
          <span className={styles.agentDescription}>{description}</span>
        </span>
      </span>
    </button>
  );
}

export function FlowAgentSelectionPage({
  config,
  onSelectAgent,
}: {
  config: FlowAgentSelectionConfig;
  onSelectAgent: (card: FlowAgentSelectionCard) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const advancingRef = useRef(false);

  const handleSelect = (card: FlowAgentSelectionCard) => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    setSelectedId(card.id);
    window.setTimeout(() => {
      onSelectAgent(card);
    }, SELECTION_ADVANCE_MS);
  };

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.headingBlock}>
          <h1 className={styles.title}>{config.title}</h1>
          <p className={styles.subtitle}>{config.subtitle}</p>
        </div>

        <div
          className={`${styles.cardRow} ${selectedId ? styles.cardRowHasSelection : ""}`}
        >
          {config.cards.map((card) => (
            <AgentSelectionCard
              key={card.id}
              agentName={card.agentName}
              title={card.title}
              description={card.description}
              image={card.image}
              imagePosition={card.imagePosition}
              background={config.cardBackground}
              composed={card.composed}
              selected={selectedId === card.id}
              dimmed={selectedId !== null && selectedId !== card.id}
              onSelect={() => handleSelect(card)}
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
