import { useEffect, useRef, useState } from "react";
import { GeneralFocusQuestionPage } from "./GeneralFocusQuestionPage";
import { GeneralAgentSelectionPage } from "./GeneralAgentSelectionPage";
import generalSignupVisual from "../assets/agents-onboarding/general-signup-visual.png";
import mondayLoaderGif from "../assets/recruiting-onboarding/monday-loader.gif";
import type { AgentFlowId } from "../data/agentFlows";
import styles from "./GeneralAgentsSetupFlow.module.scss";
import type { GeneralAgentCard } from "../data/generalOnboardingData";

type FlowPhase =
  | "focus"
  | "cards-exit"
  | "expanding"
  | "loading"
  | "selection";

const CARDS_EXIT_MS = 420;
const EXPAND_MS = 880;
const LOADER_MS = 720;

export function GeneralAgentsSetupFlow({
  initialPhase,
  focusId,
  focusLabel,
  onBack,
  onBackToFocus,
  onFocusComplete,
  onSelectAgent,
}: {
  initialPhase: "focus" | "selection";
  focusId: string;
  focusLabel?: string;
  onBack: () => void;
  onBackToFocus: () => void;
  onFocusComplete: (focusId: string, customLabel?: string) => void;
  onSelectAgent: (flowId: AgentFlowId, card: GeneralAgentCard) => void;
}) {
  const [phase, setPhase] = useState<FlowPhase>(
    initialPhase === "selection" ? "selection" : "focus",
  );
  const [activeFocusId, setActiveFocusId] = useState(focusId);
  const [activeFocusLabel, setActiveFocusLabel] = useState<string | undefined>(
    focusLabel,
  );
  const timersRef = useRef<number[]>([]);

  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  const schedule = (fn: () => void, delay: number) => {
    const timer = window.setTimeout(fn, delay);
    timersRef.current.push(timer);
  };

  useEffect(() => {
    setPhase(initialPhase === "selection" ? "selection" : "focus");
  }, [initialPhase]);

  const handleBackToFocus = () => {
    setPhase("focus");
    onBackToFocus();
  };

  const handleFocusContinue = (nextFocusId: string, customLabel?: string) => {
    setActiveFocusId(nextFocusId);
    setActiveFocusLabel(customLabel);
    setPhase("cards-exit");

    schedule(() => setPhase("expanding"), CARDS_EXIT_MS);
    schedule(() => setPhase("loading"), CARDS_EXIT_MS + EXPAND_MS);
    schedule(() => {
      onFocusComplete(nextFocusId, customLabel);
      setPhase("selection");
    }, CARDS_EXIT_MS + EXPAND_MS + LOADER_MS);
  };

  const showForm =
    phase === "focus" || phase === "cards-exit" || phase === "expanding";
  const hideCards = phase !== "focus";
  const hideFooter = phase === "expanding";
  const hideVisual = phase !== "focus";
  const isPanelExpanded =
    phase === "expanding" ||
    phase === "loading" ||
    phase === "selection";
  const showLoader = phase === "loading";
  const showSelection = phase === "selection";

  return (
    <div
      className={`${styles.shell} ${
        showSelection ? styles.shellSelection : ""
      }`}
    >
      {showForm && (
        <div className={styles.formColumn}>
          <GeneralFocusQuestionPage
            embedded
            hideCards={hideCards}
            hideFooter={hideFooter}
            onBack={onBack}
            onContinue={handleFocusContinue}
          />
        </div>
      )}

      <div
        className={`${styles.bluePanel} ${
          isPanelExpanded ? styles.bluePanelExpanded : ""
        } ${showSelection ? styles.bluePanelSelection : ""}`}
      >
        {!hideVisual && (
          <img
            className={styles.visualImage}
            src={generalSignupVisual}
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
          <GeneralAgentSelectionPage
            embedded
            focusId={activeFocusId}
            focusLabel={activeFocusLabel}
            onSelectAgent={onSelectAgent}
            onBack={handleBackToFocus}
          />
        )}
      </div>
    </div>
  );
}
