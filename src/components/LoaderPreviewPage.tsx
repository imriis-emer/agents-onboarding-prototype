import { AgentFlowProvider } from "../context/AgentFlowContext";
import { AGENT_FLOW_LIST, type AgentFlowId } from "../data/agentFlows";
import { RecruitingLoadingScreen } from "./RecruitingLoadingScreen";
import styles from "./LoaderPreviewPage.module.scss";

const PREVIEW_FLOW_IDS: AgentFlowId[] = ["jade", "lia", "general"];

export function LoaderPreviewPage({ onBack }: { onBack: () => void }) {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <button type="button" className={styles.backLink} onClick={onBack}>
            ← Back to flow selection
          </button>
          <div className={styles.heading}>
            <h1 className={styles.title}>Loader previews</h1>
            <p className={styles.subtitle}>
              Campaign loaders and the account-creation loader for copy and
              timing iteration.
            </p>
          </div>
        </header>

        <div className={styles.grid}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Creating account</h2>
              <p className={styles.panelMeta}>Post-signup</p>
            </div>
            <div className={styles.panelLoader}>
              <RecruitingLoadingScreen
                preview
                compact
                large
                variant="account"
              />
            </div>
          </section>

          {PREVIEW_FLOW_IDS.map((flowId) => {
            const flow = AGENT_FLOW_LIST.find((item) => item.id === flowId);
            if (!flow) return null;

            return (
              <section key={flowId} className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h2 className={styles.panelTitle}>{flow.selectionTitle}</h2>
                  <p className={styles.panelMeta}>{flow.agentRole}</p>
                </div>
                <div className={styles.panelLoader}>
                  <AgentFlowProvider flowId={flowId}>
                    <RecruitingLoadingScreen preview compact large />
                  </AgentFlowProvider>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
