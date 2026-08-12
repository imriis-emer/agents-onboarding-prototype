import { useRef } from "react";
import { MondayMulticolorMark } from "./ProductLogos";
import { AGENT_TEMPLATES, type AgentTemplate } from "../data/agentTemplates";
import type { AgentFlowId } from "../data/agentFlows";
import styles from "./AgentTemplateGallery.module.scss";

interface AgentTemplateGalleryProps {
  onSelectAgent: (flowId: AgentFlowId) => void;
}

function CardMediaVisual({ template }: { template: AgentTemplate }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!template.videoSrc) {
    return (
      <img
        className={styles.cardImage}
        src={template.image}
        alt=""
        aria-hidden="true"
      />
    );
  }

  const handleEnter = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.muted = false;
    video.volume = 1;
    void video.play().catch(() => {
      // Autoplay-with-sound may be blocked until a gesture; fall back to muted.
      video.muted = true;
      void video.play().catch(() => undefined);
    });
  };

  const handleLeave = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    video.muted = true;
  };

  return (
    <video
      ref={videoRef}
      className={styles.cardImage}
      src={template.videoSrc}
      poster={template.poster ?? template.image}
      preload="metadata"
      playsInline
      loop
      muted
      aria-hidden="true"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
    />
  );
}

export function AgentTemplateGallery({
  onSelectAgent,
}: AgentTemplateGalleryProps) {
  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.logo}>
          <MondayMulticolorMark />
          <span className={styles.logoText}>monday.com</span>
        </div>
        <span className={styles.workspacePill}>Ohad's Space</span>
      </header>

      <main className={styles.content}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Choose an agent to get started</h1>
          <p className={styles.subtitle}>
            Pick a ready-made agent for your team. You can add more and build
            your own anytime.
          </p>
        </div>

        <div className={styles.grid}>
          {AGENT_TEMPLATES.map((template) => {
            const isLive = Boolean(template.flowId);
            // Showcase cards (e.g. Liam) play a hover video but have no live
            // flow to route to; only true demo cards get the "Example" markers.
            const isDemo = !template.flowId && !template.videoSrc;

            return (
              <button
                key={template.id}
                type="button"
                className={[
                  styles.card,
                  isLive
                    ? styles.cardLive
                    : isDemo
                      ? styles.cardDemo
                      : styles.cardShowcase,
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={isDemo}
                aria-disabled={isDemo}
                onClick={() => {
                  if (template.flowId) onSelectAgent(template.flowId);
                }}
              >
                <div className={styles.cardMedia}>
                  <CardMediaVisual template={template} />
                  <span
                    className={styles.cardTag}
                    style={{ backgroundColor: template.accent }}
                  >
                    {template.category}
                  </span>
                  {isDemo && <span className={styles.demoBadge}>Example</span>}
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.cardName}>{template.name}</p>
                  <p className={styles.cardDescription}>
                    {template.description}
                  </p>
                  <span className={styles.cardCta}>
                    Start with {template.name}
                    <span aria-hidden="true">→</span>
                  </span>
                </div>
              </button>
            );
          })}

          <div className={[styles.card, styles.cardBuild].join(" ")}>
            <div className={styles.buildInner}>
              <span className={styles.buildPlus} aria-hidden="true">
                +
              </span>
              <p className={styles.buildTitle}>Build your own agent</p>
              <p className={styles.buildDescription}>
                Describe a job in your own words and let monday build it.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
