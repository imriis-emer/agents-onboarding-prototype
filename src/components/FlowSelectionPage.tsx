import { MondayMulticolorMark } from "./ProductLogos";
import { AGENT_FLOW_LIST, type AgentFlowId } from "../data/agentFlows";
import styles from "./FlowSelectionPage.module.scss";

interface FlowSelectionPageProps {
  selectedFlowId: AgentFlowId;
  onSelectFlow: (flowId: AgentFlowId) => void;
  onOpenLoaderPreview?: () => void;
}

export function FlowSelectionPage({
  selectedFlowId,
  onSelectFlow,
  onOpenLoaderPreview,
}: FlowSelectionPageProps) {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.logo}>
          <MondayMulticolorMark />
          <span className={styles.logoText}>monday.com</span>
        </div>

        <div className={styles.heading}>
          <h2 className={styles.title}>Select a campaign flow</h2>
          <p className={styles.subtitle}>
            Select an agent campaign to explore the full
            ad-landing-page-onboarding-agent experience
          </p>
        </div>

        <div className={styles.cards}>
          {AGENT_FLOW_LIST.map((flow) => {
            const isSelected = selectedFlowId === flow.id;

            return (
              <button
                key={flow.id}
                type="button"
                className={[styles.card, isSelected && styles.cardSelected]
                  .filter(Boolean)
                  .join(" ")}
                aria-pressed={isSelected}
                onClick={() => onSelectFlow(flow.id)}
              >
                <div className={styles.cardMedia}>
                  <img
                    className={styles.cardImage}
                    src={flow.assets.selectionCard}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.cardEyebrow}>{flow.agentRole}</p>
                  <h2 className={styles.cardTitle}>{flow.selectionTitle}</h2>
                  <p className={styles.cardDescription}>
                    {flow.selectionDescription}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {onOpenLoaderPreview && (
          <button
            type="button"
            className={styles.loaderPreviewLink}
            onClick={onOpenLoaderPreview}
          >
            Preview loaders
          </button>
        )}
      </div>
    </div>
  );
}
