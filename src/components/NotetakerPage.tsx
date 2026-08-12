import React from "react";
import { Box, Button, Heading, Icon, Text } from "@vibe/core";
import { AISkills, Check, Doc, Work } from "@mondaydotcomorg/icons";
import { ProductContextBanner } from "./ProductContextBanner";
import notetakerPreview from "../assets/notetaker-preview.png";
import styles from "./NotetakerPage.module.scss";

interface BenefitCard {
  title: string;
  description: string;
  icon: React.FC<{ size?: string | number; className?: string }>;
}

const BENEFITS: BenefitCard[] = [
  {
    title: "Actionable summaries, no cluttered notes",
    description:
      "Get chapter-based recaps, smart action item lists, and AI-generated highlights, all shareable and stored in one place.",
    icon: AISkills,
  },
  {
    title: "Get instant answers when you need them",
    description:
      "Ask our built-in AI anything about your meetings and receive immediate insights on next steps, missing details, owners, and more.",
    icon: Doc,
  },
  {
    title: "Built into your workflows",
    description:
      "Embedded into your workflows, Notetaker can share summaries, trigger automations, and activate AI.",
    icon: Work,
  },
];

function MeetingPreview() {
  return (
    <div className={styles.previewWrap}>
      <img
        className={styles.previewImage}
        src={notetakerPreview}
        alt="Notetaker meeting preview with video, quick actions, summary, and AI question input"
      />
    </div>
  );
}

export function NotetakerPage() {
  return (
    <Box className={styles.root}>
      <ProductContextBanner
        tone="notetaker"
        title="Meet Notetaker – your AI meeting partner"
        description={
          <>
            From now on, no meeting goes unrecorded or unfollowed-up.
            <br />
            Invite it to a call and it captures the discussion, summarizes it,
            and surfaces what to do next.
          </>
        }
      />
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <Heading type="h1" weight="bold" className={styles.heroTitle}>
            Turn discussions
            <br />
            into <span>results</span>
          </Heading>
          <Text
            type="text1"
            color="primary"
            ellipsis={false}
            className={styles.heroDescription}
          >
            Automatically record, summarize, and turn meetings into clear next
            steps, all within monday.com, where your work already lives.
          </Text>
          <div className={styles.creditNotice}>
            <Icon icon={Check} size={16} label="" />
            <Text type="text3" color="primary">
              Notetaker will be consuming AI Credits.
            </Text>
          </div>
          <div className={styles.heroActions}>
            <Button kind="primary" size="medium" className={styles.primaryCta}>
              Get started for free
            </Button>
            <Button kind="secondary" size="medium" className={styles.demoCta}>
              Watch a demo
            </Button>
          </div>
          <Text type="text3" color="secondary" className={styles.terms}>
            You control when the Notetaker joins your calls. By getting started,
            you agree to our Terms & Conditions.
          </Text>
        </div>
        <MeetingPreview />
      </section>

      <div className={styles.benefitGrid}>
        {BENEFITS.map(({ title, description, icon }) => (
          <article key={title} className={styles.benefitCard}>
            <Icon
              icon={icon}
              size={24}
              label=""
              className={styles.benefitIcon}
            />
            <Text type="text1" weight="medium" color="primary" ellipsis={false}>
              {title}
            </Text>
            <Text type="text2" color="secondary" ellipsis={false}>
              {description}
            </Text>
          </article>
        ))}
      </div>
    </Box>
  );
}
