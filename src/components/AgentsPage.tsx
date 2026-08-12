import React, { useRef, useState } from "react";
import { Box, Button, Flex, Heading, IconButton, Text } from "@vibe/core";
import {
  AISkills,
  AttachSlanted,
  DropdownChevronDown,
  MoveArrowUp,
} from "@mondaydotcomorg/icons";
import { AGENT_TEMPLATES, type AgentTemplate } from "../data/agentTemplates";
import { ProductContextBanner } from "./ProductContextBanner";
import { useAgentBuilder } from "../context/AgentBuilderContext";
import { useCursorGlow } from "../hooks/useCursorGlow";
import styles from "./AgentsPage.module.scss";

const DEFAULT_PROMPT =
  "Monitors tasks and automatically translates content into required languages. Maintains professional context and consistent terminology. Keeps global teams aligned.";

const CATEGORY_FILTERS = [
  "For project managers",
  "For marketing managers",
  "For operations managers",
  "Sales",
  "Productivity",
  "By monday.com",
] as const;

type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

const TEMPLATE_IDS_BY_CATEGORY: Record<CategoryFilter, readonly string[]> = {
  "For project managers": ["project-manager", "chief-of-staff"],
  "For marketing managers": ["social-media"],
  "For operations managers": ["recruiting", "chief-of-staff"],
  Sales: ["lead-qualifier"],
  Productivity: ["project-manager", "lead-qualifier", "chief-of-staff"],
  "By monday.com": AGENT_TEMPLATES.map((template) => template.id),
};

function AgentMarketplaceCard({
  template,
  onSelect,
}: {
  template: AgentTemplate;
  onSelect?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleEnter = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.muted = true;
    void video.play().catch(() => undefined);
  };

  const handleLeave = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  return (
    <article className={styles.marketplaceCard}>
      <button
        type="button"
        className={styles.marketplaceCardButton}
        onClick={onSelect}
        aria-label={`Use ${template.name} agent template`}
      >
        <div
          className={styles.marketplaceCardMedia}
          style={{
            background: `linear-gradient(135deg, color-mix(in srgb, ${template.accent} 18%, white) 0%, color-mix(in srgb, ${template.accent} 8%, white) 100%)`,
          }}
        >
          {template.videoSrc ? (
            <video
              ref={videoRef}
              className={styles.marketplaceCardImage}
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
          ) : (
            <img
              className={styles.marketplaceCardImage}
              src={template.image}
              alt=""
              aria-hidden="true"
            />
          )}
        </div>
        <div className={styles.marketplaceCardBody}>
          <Text type="text2" weight="medium" color="primary" ellipsis={false}>
            {template.name}
          </Text>
          <Text type="text3" color="secondary" ellipsis maxLines={2}>
            {template.description}
          </Text>
        </div>
      </button>
    </article>
  );
}

export function AgentsPage() {
  const [activeCategory, setActiveCategory] =
    useState<CategoryFilter>("For project managers");
  const { openConfig } = useAgentBuilder();
  const composerRef = useCursorGlow<HTMLDivElement>();

  const filteredTemplates = AGENT_TEMPLATES.filter((template) =>
    TEMPLATE_IDS_BY_CATEGORY[activeCategory].includes(template.id),
  );

  return (
    <Box className={styles.root}>
      <ProductContextBanner
        tone="agents"
        title="Meet Agents – your AI teammates"
        description={
          <>
            From now on, you&apos;ve got a team that works even when you&apos;re
            not watching.
            <br />
            They follow up on tasks, reply to tickets, and close gaps - you set
            the guardrails.
          </>
        }
        actionLabel="Show me how"
      />

      <div className={styles.discoverySection}>
        <Flex align="start" justify="space-between" className={styles.discoveryTopRow}>
          <div className={styles.discoveryTopSpacer} aria-hidden="true" />
          <Flex align="center" gap="small" className={styles.headerActions}>
            <Button kind="tertiary" size="small">
              Bring your agent
            </Button>
            <Button kind="secondary" size="small" onClick={() => openConfig()}>
              + Start from blank
            </Button>
          </Flex>
        </Flex>

        <div className={styles.heroBlock}>
          <div className={styles.hero}>
            <Heading type="h2" weight="bold" className={styles.heroTitle}>
              Meet your <span className={styles.gradientWord}>agents</span>
            </Heading>
            <Text
              type="text1"
              color="secondary"
              ellipsis={false}
              className={styles.heroSubtitle}
            >
              Hey Alex, pick a pre-built agent or build one with just a simple
              description
            </Text>
          </div>

          <div
            ref={composerRef}
            className={styles.composerBorder}
            data-tour-target="agents-composer"
          >
            <div className={styles.composerWrap}>
              <textarea
                className={styles.composerInput}
                aria-label="Describe a new agent"
                defaultValue={DEFAULT_PROMPT}
              />
              <Flex
                align="center"
                justify="space-between"
                className={styles.composerFooter}
              >
                <Flex align="center" gap="xs">
                  <span
                    className={styles.contextTourTarget}
                    data-tour-target="agents-context"
                  >
                    <Button kind="tertiary" size="small">
                      + Add context
                    </Button>
                  </span>
                  <IconButton
                    icon={AttachSlanted}
                    size="small"
                    kind="tertiary"
                    aria-label="Attach file"
                  />
                </Flex>
                <Flex align="center" gap="xs">
                  <Button
                    kind="tertiary"
                    size="small"
                    leftIcon={AISkills}
                    rightIcon={DropdownChevronDown}
                  >
                    AI model
                  </Button>
                  <IconButton
                    icon={MoveArrowUp}
                    kind="secondary"
                    size="small"
                    aria-label="Send message"
                    className={styles.composerSendButton}
                  />
                </Flex>
              </Flex>
            </div>
          </div>
        </div>

        <div className={styles.categoryFilters} role="tablist" aria-label="Agent categories">
          {CATEGORY_FILTERS.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={[
                  styles.categoryFilter,
                  isActive ? styles.categoryFilterActive : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            );
          })}
        </div>

        <section className={styles.marketplaceSection} aria-labelledby="agents-marketplace-title">
          <Heading
            id="agents-marketplace-title"
            type="h3"
            weight="medium"
            className={styles.marketplaceTitle}
          >
            {activeCategory}
          </Heading>

          <div className={styles.marketplaceGrid}>
            {filteredTemplates.map((template) => (
              <AgentMarketplaceCard
                key={template.id}
                template={template}
                onSelect={() =>
                  openConfig({
                    name: template.name,
                    expertise: template.description,
                  })
                }
              />
            ))}
          </div>
        </section>
      </div>
    </Box>
  );
}
