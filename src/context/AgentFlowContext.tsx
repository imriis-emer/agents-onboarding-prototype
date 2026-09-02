import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  AGENT_FLOWS,
  getAgentFlow,
  type AgentFlowConfig,
  type AgentFlowId,
} from "../data/agentFlows";

const AgentFlowContext = createContext<AgentFlowConfig>(AGENT_FLOWS.jade);

export interface AgentFlowOverride {
  agentName?: string;
  agentRole?: string;
  heroGreeting?: string;
  videoPlayingCopy?: string;
  onboardingScript?: AgentFlowConfig["onboardingScript"];
  firstActionTitle?: string;
  actionOptions?: AgentFlowConfig["actionOptions"];
  firstActionDefault?: string;
  getStartedTitle?: string;
  getStartedOptions?: AgentFlowConfig["getStartedOptions"];
  onboardingReturnLines?: AgentFlowConfig["onboardingReturnLines"];
  assets?: Partial<AgentFlowConfig["assets"]>;
  boardLabels?: Partial<AgentFlowConfig["boardLabels"]>;
  scanFlow?: Partial<AgentFlowConfig["scanFlow"]>;
  boardHandoff?: Partial<AgentFlowConfig["boardHandoff"]>;
  loading?: Partial<AgentFlowConfig["loading"]>;
  preferMiniChat?: boolean;
}

const RUBY_AD_CREATIVE_FIRST_ACTION =
  "Generate ad concepts from a campaign brief";

const LIAM_PM_FIRST_ACTION = "Capture project goals and scope";

/** Role-matched next steps when a general-flow Ruby Ad Creative handoff
 *  is active — applied even if the in-memory override was created before
 *  these fields existed (e.g. mid-session HMR). */
function rubyAdCreativeNextSteps(): Pick<
  AgentFlowConfig,
  | "firstActionTitle"
  | "actionOptions"
  | "firstActionDefault"
  | "getStartedTitle"
  | "getStartedOptions"
  | "onboardingReturnLines"
> {
  return {
    firstActionTitle: "What's the first thing I can help you with?",
    actionOptions: [
      RUBY_AD_CREATIVE_FIRST_ACTION,
      "Create paired ad copy and visuals",
      "Describe it in your own words",
    ],
    firstActionDefault: RUBY_AD_CREATIVE_FIRST_ACTION,
    getStartedTitle: "How would you like to get started?",
    getStartedOptions: [
      RUBY_AD_CREATIVE_FIRST_ACTION,
      "I'll add a link to a campaign brief",
      "Add a product brief",
    ],
    onboardingReturnLines: [
      "Generate ad concepts",
      "Create ad copy and visuals",
    ],
  };
}

function liamProjectManagerNextSteps(): Pick<
  AgentFlowConfig,
  | "firstActionTitle"
  | "actionOptions"
  | "firstActionDefault"
  | "getStartedTitle"
  | "getStartedOptions"
  | "onboardingReturnLines"
> {
  return {
    firstActionTitle: "What's the first thing I can help you with?",
    actionOptions: [
      LIAM_PM_FIRST_ACTION,
      "Keep delivery on track",
      "Describe it in your own words",
    ],
    firstActionDefault: LIAM_PM_FIRST_ACTION,
    getStartedTitle: "How would you like to get started?",
    getStartedOptions: [
      "I'll share the project brief",
      "Walk me through the goals",
      "I'll describe it here",
    ],
    onboardingReturnLines: [
      "Capture goals and scope",
      "Keep delivery on track",
    ],
  };
}

export function isRubyAdCreativeOverride(override: AgentFlowOverride): boolean {
  return (
    override.agentName === "Ruby" &&
    /ad creative/i.test(override.agentRole ?? "")
  );
}

export function isLiamProjectManagerOverride(
  override: AgentFlowOverride,
): boolean {
  return (
    override.agentName === "Liam" &&
    /project manager/i.test(override.agentRole ?? "")
  );
}

export { rubyAdCreativeNextSteps, liamProjectManagerNextSteps };

export function AgentFlowProvider({
  flowId,
  agentOverride,
  children,
}: {
  flowId: AgentFlowId;
  agentOverride?: AgentFlowOverride | null;
  children: ReactNode;
}) {
  const baseFlow = getAgentFlow(flowId);
  const flow = useMemo<AgentFlowConfig>(() => {
    if (!agentOverride) return baseFlow;

    const roleNextSteps =
      isRubyAdCreativeOverride(agentOverride) && !agentOverride.actionOptions
        ? rubyAdCreativeNextSteps()
        : isLiamProjectManagerOverride(agentOverride) &&
            !agentOverride.actionOptions
          ? liamProjectManagerNextSteps()
          : null;

    return {
      ...baseFlow,
      ...roleNextSteps,
      ...agentOverride,
      assets: {
        ...baseFlow.assets,
        ...(agentOverride.assets ?? {}),
      },
      boardLabels: {
        ...baseFlow.boardLabels,
        ...(agentOverride.boardLabels ?? {}),
      },
      scanFlow: {
        ...baseFlow.scanFlow,
        ...(agentOverride.scanFlow ?? {}),
      },
      boardHandoff: {
        ...baseFlow.boardHandoff,
        ...(agentOverride.boardHandoff ?? {}),
      },
      loading: {
        ...baseFlow.loading,
        ...(agentOverride.loading ?? {}),
      },
    };
  }, [agentOverride, baseFlow]);

  return (
    <AgentFlowContext.Provider value={flow}>
      {children}
    </AgentFlowContext.Provider>
  );
}

export function useAgentFlow() {
  return useContext(AgentFlowContext);
}
