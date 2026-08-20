import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Icon, TextField } from "@vibe/core";
import { CloseSmall, Menu, OpenInTab } from "@mondaydotcomorg/icons";
import { PlanInActionThinking } from "./NikeScanWidgets";
import { useAgentFlow } from "../context/AgentFlowContext";
import {
  LIA_BRAND_RESEARCH_STEPS,
  LIA_BRAND_VOICE_OPTIONS,
  LIA_BRAND_VOICE_SKIP,
  LIA_BRAND_VOICE_TITLE,
  LIA_BRAND_VOICE_URL_PLACEHOLDER,
  LIA_DRAFTING_STEPS,
  LIA_LINKEDIN_POST,
  LIA_LINKEDIN_VIDEO_ARTIFACT,
} from "../data/liaSocialFlow";
import styles from "./AgentsOnboardingView.module.scss";

export function LiaBrandResearchCard() {
  const flow = useAgentFlow();
  return (
    <PlanInActionThinking
      steps={LIA_BRAND_RESEARCH_STEPS}
      avatar={flow.assets.avatar}
    />
  );
}

export function LiaDraftingCard() {
  const flow = useAgentFlow();
  return (
    <PlanInActionThinking
      steps={LIA_DRAFTING_STEPS}
      avatar={flow.assets.avatar}
    />
  );
}

export function BrandVoiceCard({
  onSelect,
  onSkip,
}: {
  onSelect: (value: string) => void;
  onSkip: () => void;
}) {
  const [urlValue, setUrlValue] = useState("");

  const submitUrl = () => {
    const value = urlValue.trim();
    if (!value) return;
    onSelect(value);
  };

  return (
    <div className={`${styles.actionCard} ${styles.actionCardQuestionStyle}`}>
      <div className={styles.actionCardHeader}>
        <p className={styles.actionCardTitle}>{LIA_BRAND_VOICE_TITLE}</p>
      </div>
      <div className={styles.actionCardOptions}>
        <button
          type="button"
          className={styles.actionOption}
          onClick={() => onSelect(LIA_BRAND_VOICE_OPTIONS[0])}
        >
          <span className={styles.actionOptionIndex}>1</span>
          <span className={styles.actionOptionLabel}>
            {LIA_BRAND_VOICE_OPTIONS[0]}
          </span>
        </button>
        <div className={styles.actionCustomRow}>
          <span className={styles.actionOptionIndex}>2</span>
          <TextField
            className={styles.actionCustomField}
            placeholder={LIA_BRAND_VOICE_URL_PLACEHOLDER}
            value={urlValue}
            onChange={setUrlValue}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submitUrl();
              }
            }}
            size="medium"
          />
        </div>
      </div>
      <button type="button" className={styles.teamInviteSkip} onClick={onSkip}>
        <span aria-hidden="true">→</span> {LIA_BRAND_VOICE_SKIP}
      </button>
    </div>
  );
}

export function LiaChipCard({
  options,
  onSelect,
}: {
  options: readonly string[];
  onSelect: (option: string) => void;
}) {
  const lastOption = options[options.length - 1] ?? "";
  const hasCustomOption = lastOption.toLowerCase().includes("write here");
  const chipOptions = hasCustomOption ? options.slice(0, -1) : options;
  const [customValue, setCustomValue] = useState("");

  const submitCustom = () => {
    const value = customValue.trim();
    if (!value) return;
    onSelect(value);
  };

  return (
    <div className={`${styles.actionCard} ${styles.actionCardQuestionStyle}`}>
      <div className={styles.actionCardOptions}>
        {chipOptions.map((label, index) => (
          <button
            key={label}
            type="button"
            className={styles.actionOption}
            onClick={() => onSelect(label)}
          >
            <span className={styles.actionOptionIndex}>{index + 1}</span>
            <span className={styles.actionOptionLabel}>{label}</span>
          </button>
        ))}
        {hasCustomOption ? (
          <div className={styles.actionCustomRow}>
            <span className={styles.actionOptionIndex}>
              {chipOptions.length + 1}
            </span>
            <TextField
              className={styles.actionCustomField}
              placeholder={lastOption}
              value={customValue}
              onChange={setCustomValue}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  submitCustom();
                }
              }}
              size="medium"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function LinkedInPostCard() {
  const flow = useAgentFlow();
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    if (!showVideoModal) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowVideoModal(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showVideoModal]);

  return (
    <div className={styles.linkedInPostArtifact}>
      <div className={styles.linkedInPostCard}>
        <pre className={styles.linkedInPostBody}>{LIA_LINKEDIN_POST}</pre>
      </div>
      <div className={styles.linkedInVideoArtifact}>
        <img
          className={styles.linkedInVideoThumb}
          src={flow.assets.heroPoster}
          alt=""
          aria-hidden="true"
        />
        <div className={styles.linkedInVideoMeta}>
          <p className={styles.linkedInVideoTitle}>
            {LIA_LINKEDIN_VIDEO_ARTIFACT.title}
          </p>
          <p className={styles.linkedInVideoSubtitle}>
            {LIA_LINKEDIN_VIDEO_ARTIFACT.meta}
          </p>
        </div>
        <div className={styles.linkedInVideoActions}>
          <button
            type="button"
            className={styles.boardArtifactPreview}
            onClick={() => setShowVideoModal(true)}
          >
            <span
              className={styles.boardArtifactPreviewIcon}
              aria-hidden="true"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 2.5C3.5 2.5 1.44 4.23 0.75 6.5c0.69 2.27 2.75 4 5.25 4s4.56-1.73 5.25-4C10.56 4.23 8.5 2.5 6 2.5Z"
                  stroke="currentColor"
                  strokeWidth="1.1"
                />
                <circle
                  cx="6"
                  cy="6.5"
                  r="1.6"
                  stroke="currentColor"
                  strokeWidth="1.1"
                />
              </svg>
            </span>
            Preview
          </button>
          <button
            type="button"
            className={styles.boardArtifactExpand}
            aria-label="Expand video"
          >
            <Icon icon={OpenInTab} size={16} />
          </button>
          <button
            type="button"
            className={styles.boardArtifactExpand}
            aria-label="Video options"
          >
            <Icon icon={Menu} size={16} />
          </button>
        </div>
      </div>
      {showVideoModal &&
        createPortal(
          <div
            className={styles.videoModalOverlay}
            role="dialog"
            aria-modal="true"
            aria-label={`${flow.agentName} introduction video`}
            onClick={() => setShowVideoModal(false)}
          >
            <div
              className={styles.videoModalContent}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className={styles.videoModalClose}
                aria-label="Close video"
                onClick={() => setShowVideoModal(false)}
              >
                <Icon icon={CloseSmall} size={20} />
              </button>
              <video
                className={styles.videoModalVideo}
                src={flow.assets.videoSrc}
                poster={flow.assets.heroPoster}
                controls
                autoPlay
                playsInline
              />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export function PostSaveActionsCard({
  options,
  onSelect,
}: {
  options: readonly string[];
  onSelect: (option: string) => void;
}) {
  return (
    <div className={`${styles.actionCard} ${styles.actionCardQuestionStyle}`}>
      <div className={styles.actionCardOptions}>
        {options.map((label, index) => (
          <button
            key={label}
            type="button"
            className={styles.actionOption}
            onClick={() => onSelect(label)}
          >
            <span className={styles.actionOptionIndex}>{index + 1}</span>
            <span className={styles.actionOptionLabel}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
