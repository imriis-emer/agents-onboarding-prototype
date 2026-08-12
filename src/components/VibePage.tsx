import React from "react";
import { Box, Button, Flex, Heading, Icon, IconButton, Text } from "@vibe/core";
import {
  AttachSlanted,
  AISkills,
  Board,
  Emoji,
  Microphone,
  MoveArrowUp,
  Retry,
} from "@mondaydotcomorg/icons";
import { PromptChip } from "./AppMainContent";
import { ProductContextBanner } from "./ProductContextBanner";
import styles from "./VibePage.module.scss";
import { useCursorGlow } from "../hooks/useCursorGlow";

const APP_CARDS = [
  {
    title: "AI Research Repository",
    description:
      "Build a centralized research hub that organizes interviews and findings.",
    boardRef: "Customer Research",
    gradientStart: "#f5e6d0",
    gradientEnd: "#e8d5b5",
  },
  {
    title: "Sprint Velocity Hub",
    description:
      "Build a sprint analytics dashboard that tracks team delivery.",
    boardRef: "Sprint Planning",
    gradientStart: "#e0e8f5",
    gradientEnd: "#c8d8f0",
  },
  {
    title: "AI Enablement Hub",
    description: "Build a centralized project hub that AI teams can use daily.",
    boardRef: "Team Tasks",
    gradientStart: "#ede0f5",
    gradientEnd: "#dcc8f0",
  },
  {
    title: "Hackathon Command Center",
    description: "Build a hackathon management hub that organizes tracks.",
    boardRef: "Q3 Hackathon",
    gradientStart: "#e0f5e8",
    gradientEnd: "#c8f0d8",
  },
] as const;

const TEMPLATE_CHIPS = [
  "Knowledge Base",
  "Org Chart",
  "Quote Calculator",
] as const;

export function VibePage() {
  const composerRef = useCursorGlow<HTMLDivElement>();
  return (
    <Box className={styles.root}>
      <ProductContextBanner
        tone="vibe"
        title="Meet Vibe – your app builder"
        description={
          <>
            From now on, an idea is one prompt away from a working app.
            <br />
            Describe what your team needs, connect your boards, and Vibe builds
            it for you.
          </>
        }
        actionLabel="Show me how"
      />
      <div className={styles.heroBlock}>
        <div className={styles.hero}>
          <Heading type="h1" weight="bold" className={styles.heroTitle}>
            Build your ideas with Vibe
          </Heading>
          <Text
            type="text1"
            color="secondary"
            ellipsis={false}
            className={styles.heroSubtitle}
          >
            Hey Alex, let&apos;s build a new Vibe app for you
          </Text>
        </div>

        <div
          ref={composerRef}
          className={styles.composerBorder}
          data-tour-target="vibe-composer"
        >
          <div className={styles.composerWrap}>
            <textarea
              className={styles.composerInput}
              aria-label="Describe a Vibe app"
              placeholder="Build your new application..."
            />
            <Flex
              align="center"
              justify="space-between"
              className={styles.composerFooter}
            >
              <Flex align="center" gap="xs">
                <IconButton
                  icon={AttachSlanted}
                  size="small"
                  kind="tertiary"
                  aria-label="Attach file"
                />
                <IconButton
                  icon={Emoji}
                  size="small"
                  kind="tertiary"
                  aria-label="Add emoji"
                />
                <IconButton
                  icon={AISkills}
                  size="small"
                  kind="tertiary"
                  aria-label="AI features"
                />
                <Button kind="tertiary" size="small" leftIcon={AISkills}>
                  AI model
                </Button>
              </Flex>
              <Flex align="center" gap="xs">
                <Button kind="tertiary" size="small">
                  + Connect boards
                </Button>
                <IconButton
                  icon={Microphone}
                  size="small"
                  kind="tertiary"
                  aria-label="Voice input"
                />
                <IconButton
                  icon={MoveArrowUp}
                  kind="primary"
                  color="primary"
                  size="small"
                  aria-label="Send message"
                />
              </Flex>
            </Flex>
          </div>
        </div>
      </div>

      <div className={styles.appSection}>
        <Flex align="center" justify="space-between">
          <Flex align="center" gap="xs">
            <Text type="text1" weight="medium" color="primary">
              Start with an app made for you
            </Text>
            <Icon icon={AISkills} size={16} label="About suggested apps" />
          </Flex>
          <Button kind="tertiary" size="small" leftIcon={Retry}>
            Refresh
          </Button>
        </Flex>

        <div className={styles.appGrid} data-tour-target="vibe-prebuilt">
          {APP_CARDS.map(
            ({ title, description, boardRef, gradientStart, gradientEnd }) => (
              <article key={title} className={styles.appCard}>
                <div
                  className={styles.appThumbnail}
                  style={{
                    background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
                  }}
                  aria-hidden="true"
                />
                <div className={styles.appCardBody}>
                  <Text type="text2" weight="medium" color="primary" ellipsis>
                    {title}
                  </Text>
                  <Text type="text3" color="secondary" ellipsis maxLines={2}>
                    {description}
                  </Text>
                  <span className={styles.boardChip}>
                    <Icon
                      icon={Board}
                      size={12}
                      label=""
                      className={styles.boardChipIcon}
                    />
                    {boardRef}
                  </span>
                </div>
              </article>
            ),
          )}
        </div>
      </div>

      <div className={styles.templateSection}>
        <Flex align="center" justify="space-between">
          <Text type="text1" weight="medium" color="primary">
            Try a pre-built app template
          </Text>
          <Button kind="tertiary" size="small">
            View all templates →
          </Button>
        </Flex>
        <Flex className={styles.templateChips}>
          {TEMPLATE_CHIPS.map((chip) => (
            <PromptChip key={chip}>{chip}</PromptChip>
          ))}
        </Flex>
      </div>
    </Box>
  );
}
