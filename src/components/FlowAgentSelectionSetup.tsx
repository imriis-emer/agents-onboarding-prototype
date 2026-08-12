import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useAgentFlow } from "../context/AgentFlowContext";
import {
  getFlowAgentSelectionConfig,
  type FlowAgentSelectionCard,
} from "../data/flowAgentSelectionData";
import mondayLoaderGif from "../assets/recruiting-onboarding/monday-loader.gif";
import { FlowAgentSelectionPage } from "./FlowAgentSelectionPage";
import styles from "./FlowAgentSelectionSetup.module.scss";

type SetupPhase = "expanding" | "loading" | "selection";

const EXPAND_MS = 880;
const LOADER_MS = 720;

export function FlowAgentSelectionSetup({
  onSelectAgent,
}: {
  onSelectAgent: (card: FlowAgentSelectionCard) => void;
}) {
  const flow = useAgentFlow();
  const config = getFlowAgentSelectionConfig(flow.id);
  const [phase, setPhase] = useState<SetupPhase>("expanding");
  const timersRef = useRef<number[]>([]);

  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  useEffect(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];

    const schedule = (fn: () => void, delay: number) => {
      const timer = window.setTimeout(fn, delay);
      timersRef.current.push(timer);
    };

    schedule(() => setPhase("expanding"), 0);
    schedule(() => setPhase("loading"), EXPAND_MS);
    schedule(() => setPhase("selection"), EXPAND_MS + LOADER_MS);

    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };
  }, [flow.id]);

  if (!config) return null;

  const isExpanded = phase === "loading" || phase === "selection";
  const showVisual = phase === "expanding";
  const showLoader = phase === "loading";
  const showSelection = phase === "selection";

  return (
    <div className={styles.shell}>
      <div
        className={`${styles.panel} ${isExpanded ? styles.panelExpanded : ""}`}
        style={
          {
            "--flow-selection-panel-bg": config.panelBackground,
          } as CSSProperties
        }
      >
        {showVisual && (
          <img
            className={styles.visualImage}
            src={flow.signup.visual}
            alt=""
            aria-hidden="true"
          />
        )}

        {showLoader && (
          <div className={styles.loaderWrap} role="status" aria-live="polite">
            <img
              src={mondayLoaderGif}
              alt=""
              className={styles.loader}
              aria-hidden="true"
            />
          </div>
        )}

        {showSelection && (
          <FlowAgentSelectionPage
            config={config}
            onSelectAgent={onSelectAgent}
          />
        )}
      </div>
    </div>
  );
}
