import { useCallback, useEffect, useRef, useState } from "react";
import { Toast } from "@vibe/core";
import { MainLayout } from "./components/MainLayout";
import { AppMainContent } from "./components/AppMainContent";
import { AgentsOnboardingView } from "./components/AgentsOnboardingView";
import { WorkspaceRouter } from "./components/WorkspaceRouter";
import { RecruitingLandingPage } from "./components/RecruitingLandingPage";
import { GeneralLandingPage } from "./components/GeneralLandingPage";
import { GeneralAgentsSetupFlow } from "./components/GeneralAgentsSetupFlow";
import { RecruitingSignupPage } from "./components/RecruitingSignupPage";
import { GeneralAccountFormPage } from "./components/GeneralAccountFormPage";
import { RecruitingLoadingScreen } from "./components/RecruitingLoadingScreen";
import { FlowAgentSelectionSetup } from "./components/FlowAgentSelectionSetup";
import { FlowSelectionPage } from "./components/FlowSelectionPage";
import { LoaderPreviewPage } from "./components/LoaderPreviewPage";
import { PrototypeStepper } from "./components/PrototypeStepper";
import {
  AgentFlowProvider,
  isLiamProjectManagerOverride,
  isRubyAdCreativeOverride,
  liamProjectManagerNextSteps,
  rubyAdCreativeNextSteps,
  type AgentFlowOverride,
} from "./context/AgentFlowContext";
import {
  WorkspaceBoardsProvider,
  useWorkspaceBoards,
} from "./context/WorkspaceBoardsContext";
import { getAgentFlow, type AgentFlowId } from "./data/agentFlows";
import { PACKAGED_SOLUTION_LOADING_MESSAGES } from "./utils/agentLoaderAnimation";
import type { FlowAgentSelectionCard } from "./data/flowAgentSelectionData";
import {
  getEntryPrototypeStepCount,
  getPrototypeSteps,
} from "./data/agentsOnboardingPrototypeSteps";
import {
  GENERAL_DEFAULT_FOCUS_ID,
  HR_SOLUTION_CARDS,
  skipsGeneralSolutionSelection,
  type GeneralSolutionCard,
} from "./data/generalOnboardingData";
import maxAvatar from "./assets/agents-onboarding/flow-selection/hr-resume-screening-a-cutout.png";
import * as jadeScanFlow from "./data/nikeScanFlow";
import {
  HR_PIPELINE_BOARD_GROUPS,
  HR_PIPELINE_BOARD_TITLE,
  rewriteCandidatesBoardName,
} from "./data/packagedHrBoard";
import { initProduct, type ConfigProductName } from "./productConfig";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import { AgentsViewProvider } from "./context/AgentsViewContext";
import { SidekickViewProvider } from "./context/SidekickViewContext";
import { AgentBuilderProvider } from "./context/AgentBuilderContext";
import { AgentBuilderModal } from "./components/AgentBuilderModal";
import type { RailItemId } from "./components/NavigationRail";
import {
  CURATED_FONTS,
  DEFAULT_HEADING_FONT,
  DEFAULT_TEXT_FONT,
  PROTECTED_FONTS,
} from "./components/fontsConfig";
import {
  buildHashRoute,
  parseHashRoute,
  ROUTE_MODE_CLASSES,
  ROUTE_THEME_CLASSES,
  routesEqual,
  type HashRoute,
  type RouteMode,
  type RouteTheme,
} from "./routing/hashRoute";

const STORAGE_KEY_CUSTOM_FONTS = "boards.customFonts";
const STORAGE_KEY_REMOVED_FONTS = "boards.removedFonts";

function loadStringArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string")
      : [];
  } catch {
    return [];
  }
}

function resolveRouteFont(
  routeFont: string | null,
  defaultFont: string,
): string {
  if (!routeFont) return defaultFont;
  return routeFont;
}

// Dedup so re-selecting a font doesn't re-inject its <link>.
const loadedFonts = new Set<string>();
function loadGoogleFont(family: string, weightsParam?: string) {
  if (loadedFonts.has(family)) return;
  const param =
    weightsParam ?? `${family.replace(/\s+/g, "+")}:wght@400;500;600;700`;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${param}&display=swap`;
  document.head.appendChild(link);
  loadedFonts.add(family);
}

// When you are prompted to switch products use this variable to change it.
const PRODUCT: ConfigProductName = "work_management";

const THEME_CLASSES = ROUTE_THEME_CLASSES;
const MODE_CLASSES = ROUTE_MODE_CLASSES;
type AppMode = RouteMode;

export default function App() {
  return (
    <WorkspaceBoardsProvider>
      <AppInner />
    </WorkspaceBoardsProvider>
  );
}

function AppInner() {
  const {
    liveBoardReady,
    workspaceEntryMode,
    setWorkspaceEntryMode,
    setPanelForceOpen,
    resetWorkspaceSession,
  } = useWorkspaceBoards();
  const [selectedFlowId, setSelectedFlowId] = useState<AgentFlowId>(() => {
    const flow = new URLSearchParams(window.location.search).get("flow");
    return flow === "lia" || flow === "jade" || flow === "general"
      ? flow
      : "general";
  });
  const [selectedFlowAgent, setSelectedFlowAgent] =
    useState<AgentFlowOverride | null>(null);
  const [prototypeStepIndex, setPrototypeStepIndex] = useState(() => {
    const step = new URLSearchParams(window.location.search).get("step");
    const parsed = step ? Number.parseInt(step, 10) : Number.NaN;
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  });
  const [hashRoute, setHashRoute] = useState<HashRoute>(() => parseHashRoute());
  const hashRouteRef = useRef(hashRoute);
  const [activeTheme, setActiveTheme] = useState<RouteTheme>(hashRoute.theme);
  const [activeMode, setActiveMode] = useState<AppMode>(hashRoute.mode);
  const [customFonts, setCustomFonts] = useState<string[]>(() =>
    loadStringArray(STORAGE_KEY_CUSTOM_FONTS),
  );
  const [removedFonts, setRemovedFonts] = useState<string[]>(() =>
    loadStringArray(STORAGE_KEY_REMOVED_FONTS),
  );
  const [activeHeadingFont, setActiveHeadingFont] = useState<string>(() =>
    resolveRouteFont(hashRoute.headingFont, DEFAULT_HEADING_FONT),
  );
  const [activeTextFont, setActiveTextFont] = useState<string>(() =>
    resolveRouteFont(hashRoute.textFont, DEFAULT_TEXT_FONT),
  );
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    type: "negative" | "positive";
  }>({ open: false, message: "", type: "negative" });
  const [onboardingSessionKey, setOnboardingSessionKey] = useState(0);
  const [loaderPreviewOpen, setLoaderPreviewOpen] = useState(false);
  const [generalFocusId, setGeneralFocusId] = useState(
    GENERAL_DEFAULT_FOCUS_ID,
  );
  const [generalFocusLabel, setGeneralFocusLabel] = useState<string | null>(
    null,
  );
  const [startInBoardChat, setStartInBoardChat] = useState(false);

  const prototypeSteps = getPrototypeSteps(selectedFlowId);
  const entryStepCount = getEntryPrototypeStepCount(selectedFlowId);
  const agentSelectionStepIndex = 3;
  const accountCreatingStepIndex = 4;
  const loadingStepIndex = 5;
  const generalAccountFormStepIndex = 2;
  const generalFocusStepIndex = 3;
  const generalSolutionStepIndex = 4;
  const isGeneralInProductLanding = false;
  const isGeneralOtherGallery = isGeneralInProductLanding;

  const goToPrototypeStep = useCallback(
    (stepIndex: number) => {
      setPrototypeStepIndex(
        Math.max(0, Math.min(stepIndex, prototypeSteps.length - 1)),
      );
    },
    [prototypeSteps.length],
  );

  const buildAgentOverride = useCallback(
    (card: FlowAgentSelectionCard): AgentFlowOverride => {
      const role = card.title.toLowerCase();

      return {
        agentName: card.agentName,
        agentRole: card.title,
        heroGreeting: `Hi Ohad 👋 I'm ${card.agentName} — your ${role}.`,
        videoPlayingCopy: `I'm ${card.agentName}, your ${role}. ${card.description}`,
      };
    },
    [],
  );

  const buildGeneralAgentOverride = useCallback(
    (card: GeneralSolutionCard): AgentFlowOverride => {
      const greeting = `Hi Alex 👋 I'm ${card.agentName} — your new recruiting teammate.`;

      return {
        agentName: card.agentName,
        agentRole: card.agentRole,
        preferMiniChat: true,
        heroGreeting: greeting,
        assets: {
          avatar: maxAvatar,
          portrait: maxAvatar,
          agentFull: maxAvatar,
        },
        onboardingScript: [
          {
            id: "packaged-hello",
            text: greeting,
          },
          {
            id: "m1",
            text: `I handle the sourcing legwork so you can focus on the candidates that matter. We'll work together on your ${HR_PIPELINE_BOARD_TITLE} board.`,
          },
          {
            id: "m2",
            text: "Every hire stays yours. I act when you ask, everything I do is visible and reversible, and you can redirect me at any time.",
          },
        ],
        boardLabels: {
          mainBoard: HR_PIPELINE_BOARD_TITLE,
          focusBoard: HR_PIPELINE_BOARD_TITLE,
          resultsTitle: HR_PIPELINE_BOARD_TITLE,
          resultsGroupTitle: "Schedule interviews",
          composerPlaceholder: `Message ${card.agentName}...`,
        },
        boardHandoff: {
          saveMessage: rewriteCandidatesBoardName(
            jadeScanFlow.BOARD_SAVE_MESSAGE,
          ),
          offerOptions: jadeScanFlow.BOARD_OFFER_OPTIONS.map((option) =>
            rewriteCandidatesBoardName(option),
          ),
          offerPositive: rewriteCandidatesBoardName(
            jadeScanFlow.BOARD_OFFER_POSITIVE,
          ),
          tourSteps: jadeScanFlow.BOARD_TOUR_STEPS.map((step) => ({
            ...step,
            text: rewriteCandidatesBoardName(step.text),
          })),
        },
        scanFlow: {
          boardTableGroups: HR_PIPELINE_BOARD_GROUPS,
          script: jadeScanFlow.NIKE_SCAN_SCRIPT.map((message) => ({
            ...message,
            text: rewriteCandidatesBoardName(message.text),
          })),
          dailyTriggerJob: {
            ...jadeScanFlow.DAILY_TRIGGER_JOB,
            description: rewriteCandidatesBoardName(
              jadeScanFlow.DAILY_TRIGGER_JOB.description,
            ),
          },
        },
        loading: {
          messages: PACKAGED_SOLUTION_LOADING_MESSAGES,
        },
      };
    },
    [],
  );

  // Persist user font modifications across reloads.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CUSTOM_FONTS, JSON.stringify(customFonts));
  }, [customFonts]);
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY_REMOVED_FONTS,
      JSON.stringify(removedFonts),
    );
  }, [removedFonts]);

  const showToast = (
    message: string,
    type: "negative" | "positive" = "negative",
  ) => {
    setToast({ open: true, message, type });
  };

  const commitHashRoute = useCallback((updates: Partial<HashRoute>) => {
    const nextRoute = { ...hashRouteRef.current, ...updates };
    const nextHash = buildHashRoute(nextRoute);
    hashRouteRef.current = nextRoute;

    setHashRoute((currentRoute) =>
      routesEqual(currentRoute, nextRoute) ? currentRoute : nextRoute,
    );

    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
  }, []);

  const handleActiveRailItemChange = useCallback(
    (activeRailItem: RailItemId) => {
      if (activeRailItem === "workspace" && liveBoardReady) {
        setWorkspaceEntryMode("home");
      }
      commitHashRoute({
        railItem: activeRailItem,
        agentsView:
          activeRailItem === "agents"
            ? "home"
            : hashRouteRef.current.agentsView,
        sidekickChatId: null,
      });
    },
    [commitHashRoute, liveBoardReady, setWorkspaceEntryMode],
  );

  const handleAgentsViewChange = useCallback(
    (agentsView: HashRoute["agentsView"]) => {
      commitHashRoute({
        railItem: "agents",
        agentsView,
        sidekickChatId: null,
      });
    },
    [commitHashRoute],
  );

  const handleSidekickChatOpen = useCallback(
    (sidekickChatId: string) => {
      commitHashRoute({
        railItem: "sidekick",
        sidekickChatId,
      });
    },
    [commitHashRoute],
  );

  // From general agent selection, hand off to the chosen live flow at its
  // loading step. The loading screen auto-advances to that flow's hero step on
  // completion. Bumping the session key remounts AgentsOnboardingView fresh.
  const handleGeneralAgentSelect = useCallback(
    (flowId: AgentFlowId, card: GeneralSolutionCard) => {
      resetWorkspaceSession();
      setStartInBoardChat(true);
      setSelectedFlowAgent(buildGeneralAgentOverride(card));
      setSelectedFlowId(flowId);
      setPrototypeStepIndex(getEntryPrototypeStepCount(flowId) - 1);
      setOnboardingSessionKey((key) => key + 1);
      commitHashRoute({
        railItem: "workspace",
        agentsView: "home",
        sidekickChatId: null,
      });
    },
    [buildGeneralAgentOverride, commitHashRoute, resetWorkspaceSession],
  );

  const handleWorkspaceHome = useCallback(() => {
    resetWorkspaceSession();
    setOnboardingSessionKey((key) => key + 1);
    setSelectedFlowAgent(null);
    setStartInBoardChat(false);
    setSelectedFlowId("general");
    setPrototypeStepIndex(0);
    commitHashRoute({
      railItem: "workspace",
      sidekickChatId: null,
    });
  }, [commitHashRoute, resetWorkspaceSession]);

  const handleSidekickHome = useCallback(() => {
    commitHashRoute({
      railItem: "sidekick",
      sidekickChatId: null,
    });
  }, [commitHashRoute]);

  const handleBackToOnboarding = useCallback(() => {
    setPanelForceOpen(false);
    setWorkspaceEntryMode("conversation");
    commitHashRoute({
      railItem: "workspace",
      sidekickChatId: null,
    });
  }, [commitHashRoute, setPanelForceOpen, setWorkspaceEntryMode]);

  const activeOnboardingFlow = getAgentFlow(selectedFlowId);
  const activeOnboardingAgentName =
    selectedFlowAgent?.agentName ?? activeOnboardingFlow.agentName;
  const activeOnboardingAvatarSrc =
    selectedFlowAgent?.assets?.avatar ?? activeOnboardingFlow.assets.avatar;
  const showOnboardingReturn =
    prototypeStepIndex >= entryStepCount &&
    selectedFlowId !== "general" &&
    (hashRoute.railItem !== "workspace" ||
      (liveBoardReady && workspaceEntryMode !== "conversation"));
  const onboardingReturnTaskLines =
    selectedFlowAgent?.onboardingReturnLines ??
    (selectedFlowAgent && isRubyAdCreativeOverride(selectedFlowAgent)
      ? rubyAdCreativeNextSteps().onboardingReturnLines
      : selectedFlowAgent && isLiamProjectManagerOverride(selectedFlowAgent)
        ? liamProjectManagerNextSteps().onboardingReturnLines
        : activeOnboardingFlow.onboardingReturnLines);
  const onboardingReturn = showOnboardingReturn
    ? {
        agentName: activeOnboardingAgentName,
        avatarSrc: activeOnboardingAvatarSrc,
        taskLines: onboardingReturnTaskLines,
        onClick: handleBackToOnboarding,
      }
    : undefined;

  const handleThemeChange = useCallback(
    (theme: string) => {
      const nextTheme = theme as RouteTheme;
      setActiveTheme(nextTheme);
      commitHashRoute({ theme: nextTheme });
    },
    [commitHashRoute],
  );

  const handleModeChange = useCallback(
    (mode: string) => {
      const nextMode = mode as AppMode;
      setActiveMode(nextMode);
      commitHashRoute({ mode: nextMode });
    },
    [commitHashRoute],
  );

  const handleHeadingFontChange = useCallback(
    (font: string) => {
      setActiveHeadingFont(font);
      commitHashRoute({ headingFont: font });
    },
    [commitHashRoute],
  );

  const handleTextFontChange = useCallback(
    (font: string) => {
      setActiveTextFont(font);
      commitHashRoute({ textFont: font });
    },
    [commitHashRoute],
  );

  const applyHashRouteState = useCallback((nextRoute: HashRoute) => {
    setActiveTheme(nextRoute.theme);
    setActiveMode(nextRoute.mode);
    setActiveHeadingFont(
      resolveRouteFont(nextRoute.headingFont, DEFAULT_HEADING_FONT),
    );
    setActiveTextFont(resolveRouteFont(nextRoute.textFont, DEFAULT_TEXT_FONT));
  }, []);

  useEffect(() => {
    hashRouteRef.current = hashRoute;
  }, [hashRoute]);

  useEffect(() => {
    const handleHashChange = () => {
      const nextRoute = parseHashRoute();
      hashRouteRef.current = nextRoute;
      setHashRoute((currentRoute) =>
        routesEqual(currentRoute, nextRoute) ? currentRoute : nextRoute,
      );
      applyHashRouteState(nextRoute);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [applyHashRouteState]);

  const handleAddCustomFont = (font: string) => {
    const trimmed = font.trim();
    if (!trimmed) return;
    // If the user previously removed this font, un-remove it on re-add.
    setRemovedFonts((prev) => prev.filter((f) => f !== trimmed));
    setCustomFonts((prev) =>
      prev.includes(trimmed) ? prev : [...prev, trimmed],
    );
  };

  const handleRemoveFont = (font: string) => {
    if (PROTECTED_FONTS.has(font)) return;
    const isCustom = customFonts.includes(font);
    if (isCustom) {
      setCustomFonts((prev) => prev.filter((f) => f !== font));
    } else {
      // It's a curated font — track it as hidden.
      setRemovedFonts((prev) => (prev.includes(font) ? prev : [...prev, font]));
    }
    // If active anywhere, fall back to that side's default.
    if (activeHeadingFont === font) {
      handleHeadingFontChange(DEFAULT_HEADING_FONT);
    }
    if (activeTextFont === font) {
      handleTextFontChange(DEFAULT_TEXT_FONT);
    }
  };

  useEffect(() => {
    initProduct(PRODUCT);
  }, []);

  useEffect(() => {
    THEME_CLASSES.forEach((cls) =>
      document.documentElement.classList.remove(cls),
    );
    if (activeTheme) document.documentElement.classList.add(activeTheme);
  }, [activeTheme]);

  useEffect(() => {
    MODE_CLASSES.forEach((cls) =>
      document.documentElement.classList.remove(cls),
    );
    if (activeMode) document.documentElement.classList.add(activeMode);
  }, [activeMode]);

  useEffect(() => {
    const fallback = `"Figtree", "Poppins", "Inter", "Helvetica Neue", Arial, sans-serif`;

    const headingCurated = CURATED_FONTS.find(
      (f) => f.value === activeHeadingFont,
    );
    loadGoogleFont(activeHeadingFont, headingCurated?.googleFontParam);
    const headingStack = `"${activeHeadingFont}", ${fallback}`;

    const textCurated = CURATED_FONTS.find((f) => f.value === activeTextFont);
    loadGoogleFont(activeTextFont, textCurated?.googleFontParam);
    const textStack = `"${activeTextFont}", ${fallback}`;

    // Vibe token for headings (Heading component, board group titles, etc.)
    document.documentElement.style.setProperty(
      "--title-font-family",
      headingStack,
    );
    // Vibe token for body text + the local SCSS module var.
    document.documentElement.style.setProperty("--font-family", textStack);
    document.documentElement.style.setProperty(
      "--boards-font-family",
      textStack,
    );
  }, [activeHeadingFont, activeTextFont]);

  const prototypeStepper = loaderPreviewOpen ? null : (
    <PrototypeStepper
      stepIndex={prototypeStepIndex}
      stepLabel={
        isGeneralOtherGallery
          ? "Agents gallery"
          : (prototypeSteps[prototypeStepIndex]?.label ?? "")
      }
      totalSteps={prototypeSteps.length}
      stepLabels={prototypeSteps.map((step) => step.label)}
      onPrevious={() => goToPrototypeStep(prototypeStepIndex - 1)}
      onNext={() => goToPrototypeStep(prototypeStepIndex + 1)}
      onSelectStep={goToPrototypeStep}
    />
  );

  const themeSwitcher = (
    <ThemeSwitcher
      activeTheme={activeTheme}
      onThemeChange={handleThemeChange}
      activeMode={activeMode}
      onModeChange={handleModeChange}
      activeHeadingFont={activeHeadingFont}
      onHeadingFontChange={handleHeadingFontChange}
      activeTextFont={activeTextFont}
      onTextFontChange={handleTextFontChange}
      customFonts={customFonts}
      removedFonts={removedFonts}
      onAddCustomFont={handleAddCustomFont}
      onRemoveFont={handleRemoveFont}
      onError={(message) => showToast(message, "negative")}
    />
  );

  const toastElement = (
    <Toast
      open={toast.open}
      type={toast.type}
      autoHideDuration={4000}
      onClose={() => setToast((t) => ({ ...t, open: false }))}
    >
      {toast.message}
    </Toast>
  );

  const renderWorkspace = () => (
    <WorkspaceRouter>
      <AgentsOnboardingView
        key={`${selectedFlowId}-${selectedFlowAgent?.agentName ?? "default"}-${onboardingSessionKey}`}
        prototypeStepIndex={prototypeStepIndex}
        startInBoardChat={startInBoardChat}
      />
    </WorkspaceRouter>
  );

  const renderFlowContent = () => {
    if (loaderPreviewOpen) {
      return <LoaderPreviewPage onBack={() => setLoaderPreviewOpen(false)} />;
    }

    if (prototypeStepIndex === 0 && selectedFlowId !== "general") {
      return (
        <FlowSelectionPage
          selectedFlowId={selectedFlowId}
          onSelectFlow={(flowId) => {
            setSelectedFlowAgent(null);
            setSelectedFlowId(flowId);
            setPrototypeStepIndex(flowId === "general" ? 0 : 1);
            commitHashRoute({
              railItem: "workspace",
              agentsView: "home",
              sidekickChatId: null,
            });
          }}
          onOpenLoaderPreview={() => setLoaderPreviewOpen(true)}
        />
      );
    }

    if (
      (prototypeStepIndex === 0 && selectedFlowId === "general") ||
      (prototypeStepIndex === 1 && selectedFlowId !== "general")
    ) {
      if (selectedFlowId === "general") {
        return <GeneralLandingPage onGetStarted={() => goToPrototypeStep(1)} />;
      }
      return (
        <RecruitingLandingPage onGetStarted={() => goToPrototypeStep(2)} />
      );
    }

    if (
      (prototypeStepIndex === 1 && selectedFlowId === "general") ||
      (prototypeStepIndex === 2 && selectedFlowId !== "general")
    ) {
      return (
        <RecruitingSignupPage
          isGeneralFlow={selectedFlowId === "general"}
          onContinue={() =>
            goToPrototypeStep(
              selectedFlowId === "general"
                ? generalAccountFormStepIndex
                : agentSelectionStepIndex,
            )
          }
        />
      );
    }

    if (
      prototypeStepIndex === agentSelectionStepIndex &&
      selectedFlowId !== "general"
    ) {
      return (
        <FlowAgentSelectionSetup
          onSelectAgent={(card) => {
            setSelectedFlowAgent(buildAgentOverride(card));
            goToPrototypeStep(accountCreatingStepIndex);
          }}
        />
      );
    }

    if (
      prototypeStepIndex === accountCreatingStepIndex &&
      selectedFlowId !== "general"
    ) {
      return (
        <RecruitingLoadingScreen
          variant="account"
          onComplete={() => goToPrototypeStep(loadingStepIndex)}
        />
      );
    }

    if (
      prototypeStepIndex === generalAccountFormStepIndex &&
      selectedFlowId === "general"
    ) {
      return (
        <GeneralAccountFormPage
          onBack={() => goToPrototypeStep(1)}
          onContinue={() => goToPrototypeStep(generalFocusStepIndex)}
        />
      );
    }

    if (
      (prototypeStepIndex === generalFocusStepIndex ||
        prototypeStepIndex === generalSolutionStepIndex) &&
      selectedFlowId === "general"
    ) {
      return (
        <GeneralAgentsSetupFlow
          initialPhase={
            prototypeStepIndex === generalFocusStepIndex ? "focus" : "selection"
          }
          focusId={generalFocusId}
          focusLabel={generalFocusLabel ?? undefined}
          onBack={() => goToPrototypeStep(generalAccountFormStepIndex)}
          onBackToFocus={() => goToPrototypeStep(generalFocusStepIndex)}
          onFocusComplete={(focusId, customLabel) => {
            setGeneralFocusId(focusId);
            setGeneralFocusLabel(customLabel ?? null);
            if (skipsGeneralSolutionSelection(focusId)) {
              const fallback = HR_SOLUTION_CARDS[1] ?? HR_SOLUTION_CARDS[0];
              handleGeneralAgentSelect(fallback.flowId, fallback);
              return;
            }
            goToPrototypeStep(generalSolutionStepIndex);
          }}
          onSelectAgent={handleGeneralAgentSelect}
        />
      );
    }

    if (
      prototypeStepIndex === loadingStepIndex &&
      selectedFlowId !== "general"
    ) {
      return (
        <RecruitingLoadingScreen
          variant="agent"
          autoCompleteAfterMs={6000}
          onComplete={() =>
            goToPrototypeStep(
              startInBoardChat ? entryStepCount + 2 : entryStepCount,
            )
          }
        />
      );
    }

    return (
      <AgentsViewProvider
        key={`agents-${hashRoute.agentsView}`}
        initialView={hashRoute.agentsView}
        onViewChange={handleAgentsViewChange}
        isFirstVisit={isGeneralInProductLanding}
      >
        <SidekickViewProvider
          key={`sidekick-${hashRoute.sidekickChatId ?? "home"}`}
          initialChatId={hashRoute.sidekickChatId}
          onChatOpen={handleSidekickChatOpen}
          onHome={handleSidekickHome}
        >
          <AgentBuilderProvider>
            <MainLayout
              product={PRODUCT}
              activeRailItem={hashRoute.railItem}
              onActiveRailItemChange={handleActiveRailItemChange}
              onWorkspaceHome={handleWorkspaceHome}
              onboardingReturn={onboardingReturn}
            >
              {(activeRailItem) => (
                <AppMainContent
                  activeRailItem={activeRailItem}
                  renderWorkspace={renderWorkspace}
                />
              )}
            </MainLayout>
            <AgentBuilderModal />
          </AgentBuilderProvider>
        </SidekickViewProvider>
      </AgentsViewProvider>
    );
  };

  return (
    <AgentFlowProvider
      flowId={selectedFlowId}
      agentOverride={selectedFlowAgent}
    >
      {renderFlowContent()}
      {prototypeStepper}
      {themeSwitcher}
      {toastElement}
    </AgentFlowProvider>
  );
}
