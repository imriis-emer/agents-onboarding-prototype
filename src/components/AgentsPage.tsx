import { useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chips,
  Clickable,
  Flex,
  Heading,
  Icon,
  IconButton,
  Label,
  Text,
} from "@vibe/core";
import {
  AISkills,
  Attach,
  Board,
  DropdownChevronLeft,
  DropdownChevronRight,
  Info,
  Mention,
  MoveArrowUp,
} from "@mondaydotcomorg/icons";
import {
  CATEGORY_SECTIONS,
  GALLERY_CATEGORIES,
  MONDAY_TEAM_STORY,
  PERSONALIZED_AGENTS,
  PROMPT_TEMPLATES,
  SECTION_IDS,
  SKILL_ICONS,
  TEMPLATE_PROMPTS,
  type GalleryAgent,
  type GalleryCategory,
  type GalleryCategorySection,
  type PersonalizedAgent,
} from "../data/agentsGallery";
import { ProductContextBanner } from "./ProductContextBanner";
import { useAgentBuilder } from "../context/AgentBuilderContext";
import { useAgentsView } from "../context/AgentsViewContext";
import { useCursorGlow } from "../hooks/useCursorGlow";
import styles from "./AgentsPage.module.scss";

function SectionNav() {
  return (
    <Flex align="center" gap="xs">
      <IconButton
        icon={DropdownChevronLeft}
        size="xs"
        kind="tertiary"
        disabled
        aria-label="Previous"
      />
      <IconButton
        icon={DropdownChevronRight}
        size="xs"
        kind="tertiary"
        aria-label="Next"
      />
    </Flex>
  );
}

function SkillStack() {
  return (
    <div className={styles.skillStack} aria-hidden="true">
      <span className={styles.skillBadge}>
        <img src={SKILL_ICONS.gmail} alt="" width={15} height={15} />
      </span>
      <span className={styles.skillBadge}>
        <img src={SKILL_ICONS.slack} alt="" width={15} height={15} />
      </span>
      <span className={`${styles.skillBadge} ${styles.skillBadgeLetter}`}>
        <img src={SKILL_ICONS.letter1} alt="" width={12} height={12} />
      </span>
      <span className={`${styles.skillBadge} ${styles.skillBadgeLetterWarm}`}>
        <img src={SKILL_ICONS.letter2} alt="" width={12} height={12} />
      </span>
      <span className={`${styles.skillBadge} ${styles.skillBadgeLetterCool}`}>
        <img src={SKILL_ICONS.letter3} alt="" width={12} height={12} />
      </span>
    </div>
  );
}

function FeaturedBanner({
  featured,
}: {
  featured: GalleryCategorySection["featured"];
}) {
  return (
    <article className={styles.featuredCard}>
      <img
        className={styles.featuredIllustration}
        src={featured.illustration}
        alt=""
        aria-hidden="true"
      />
      <div className={styles.featuredCopy}>
        <Heading type="h3" weight="medium" className={styles.featuredTitle}>
          {featured.title}
        </Heading>
        <Text type="text1" color="secondary" ellipsis={false}>
          {featured.description}
        </Text>
      </div>
      <div className={styles.featuredIconWell} aria-hidden="true">
        <span
          className={styles.featuredIconTile}
          style={{ background: featured.iconColor }}
        >
          <img src={featured.icon} alt="" width={32} height={32} />
        </span>
        <span
          className={`${styles.featuredIconTile} ${styles.featuredIconTileFront}`}
          style={{ background: featured.iconColor }}
        >
          <img src={featured.icon} alt="" width={32} height={32} />
        </span>
      </div>
    </article>
  );
}

function GalleryAgentCard({
  agent,
  onSelect,
}: {
  agent: GalleryAgent;
  onSelect?: () => void;
}) {
  return (
    <Clickable
      className={styles.agentCard}
      onClick={onSelect}
      aria-label={`Use ${agent.name}, ${agent.role}`}
    >
      <div className={styles.agentCardHeader}>
        <div className={styles.agentAvatarGlow} />
        <div className={styles.agentAvatar}>
          <img src={agent.avatar} alt="" />
        </div>
      </div>
      <div className={styles.agentCardBody}>
        <Label text={agent.name} kind="fill" color="primary" size="medium" />
        <Text
          type="text1"
          weight="medium"
          className={styles.agentRole}
          ellipsis
        >
          {agent.role}
        </Text>
        <Text type="text2" className={styles.agentDescription} ellipsis={false}>
          {agent.description}
        </Text>
        <Flex
          align="center"
          justify="space-between"
          className={styles.agentCardFooter}
        >
          <SkillStack />
          <Flex align="center" gap="xs" className={styles.usage}>
            <img
              src={SKILL_ICONS.usage}
              alt=""
              width={16}
              height={16}
              aria-hidden="true"
            />
            <Text type="text2" color="secondary">
              320
            </Text>
          </Flex>
        </Flex>
      </div>
    </Clickable>
  );
}

function PersonalizedAgentCard({
  agent,
  onSelect,
}: {
  agent: PersonalizedAgent;
  onSelect?: () => void;
}) {
  return (
    <Clickable
      className={styles.personalizedCard}
      onClick={onSelect}
      aria-label={`Use ${agent.name}, ${agent.role}`}
    >
      <div className={styles.personalizedAvatar}>
        <img src={agent.avatar} alt="" />
      </div>
      <Flex
        direction="column"
        justify="space-between"
        className={styles.personalizedBody}
      >
        <div className={styles.personalizedCopy}>
          <Label text={agent.name} kind="fill" color="primary" size="medium" />
          <Text type="text1" weight="medium" ellipsis>
            {agent.role}
          </Text>
          <Text type="text2" color="secondary" ellipsis={false}>
            {agent.description}
          </Text>
        </div>
        <Flex
          align="end"
          justify="space-between"
          className={styles.personalizedFooter}
        >
          <div className={styles.basedOn}>
            <Text type="text3" color="secondary">
              Based on:
            </Text>
            <Flex align="center" gap="xs">
              <Chips
                label={agent.basedOn}
                leftIcon={Board}
                readOnly
                className={styles.boardChip}
              />
              <Icon icon={Info} size={16} />
            </Flex>
          </div>
          <div className={styles.personalizedSkills} aria-hidden="true">
            <span className={styles.skillBadgeLarge}>
              <img src={SKILL_ICONS.slack} alt="" width={18} height={18} />
            </span>
            <span className={styles.skillBadgeLarge}>
              <img src={SKILL_ICONS.gmail} alt="" width={18} height={18} />
            </span>
            <span className={styles.skillBadgeLarge}>
              <img src={SKILL_ICONS.monday} alt="" width={18} height={18} />
            </span>
          </div>
        </Flex>
      </Flex>
    </Clickable>
  );
}

function MondayTeamCard() {
  const { openConfig } = useAgentBuilder();
  const story = MONDAY_TEAM_STORY;

  return (
    <article className={styles.testimonialCard}>
      <div className={styles.testimonialPortrait}>
        <img src={story.portrait} alt="" />
      </div>
      <Flex direction="column" className={styles.testimonialBody} gap="medium">
        <div>
          <Text type="text1" weight="medium" ellipsis={false}>
            {story.title}
          </Text>
          <Text type="text2" color="secondary" ellipsis={false}>
            {story.description}
          </Text>
        </div>
        <div className={styles.valueBox}>
          <Text type="text3" color="secondary" className={styles.valueLabel}>
            The business value
          </Text>
          <Text type="text2" ellipsis={false}>
            {story.value}
          </Text>
        </div>
        <Flex align="end" justify="space-between">
          <div>
            <Text type="text3" color="secondary">
              Built by:
            </Text>
            <Flex align="center" gap="xs" className={styles.builtBy}>
              <Avatar
                size="small"
                type="img"
                src={story.builderAvatar}
                aria-label={story.builtBy}
              />
              <Label
                text={story.builtBy}
                kind="fill"
                color="primary"
                size="medium"
              />
            </Flex>
          </div>
          <Button
            kind="secondary"
            size="small"
            onClick={() =>
              openConfig({
                name: "Petro",
                expertise: story.description,
              })
            }
          >
            Get agent
          </Button>
        </Flex>
      </Flex>
    </article>
  );
}

export function AgentsPage() {
  const [activeCategory, setActiveCategory] =
    useState<GalleryCategory>("Made for you");
  const { openConfig } = useAgentBuilder();
  const { isFirstVisit } = useAgentsView();
  const [prompt, setPrompt] = useState("");
  const composerRef = useCursorGlow<HTMLDivElement>();
  const scrollRootRef = useRef<HTMLDivElement>(null);

  const selectAgent = (agent: GalleryAgent) => {
    openConfig({
      name: agent.name,
      expertise: agent.description,
    });
  };

  const scrollToCategory = (category: GalleryCategory) => {
    setActiveCategory(category);
    const section = document.getElementById(SECTION_IDS[category]);
    const scroller = scrollRootRef.current;
    if (!section || !scroller) return;

    const nextTop =
      section.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top +
      scroller.scrollTop -
      12;
    scroller.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" });
  };

  return (
    <div ref={scrollRootRef} className={styles.scrollRoot}>
      <Box className={styles.root}>
        {!isFirstVisit && (
          <ProductContextBanner
            tone="agents"
            title="Meet Agents – your AI teammates"
            description={
              <>
                From now on, you&apos;ve got a team that works even when
                you&apos;re not watching.
                <br />
                They follow up on tasks, reply to tickets, and close gaps - you
                set the guardrails.
              </>
            }
            actionLabel="Show me how"
          />
        )}

        <div className={styles.discoverySection}>
          <Flex align="center" justify="end" className={styles.discoveryTopRow}>
            <Flex align="center" gap="small" className={styles.headerActions}>
              <Button kind="tertiary" size="small" leftIcon={AISkills}>
                Bring your agent
              </Button>
              <Button kind="tertiary" size="small" onClick={() => openConfig()}>
                + Start from blank
              </Button>
            </Flex>
          </Flex>

          <div className={styles.heroBlock}>
            <div className={styles.hero}>
              <Heading type="h1" weight="normal" className={styles.heroTitle}>
                Build your <span className={styles.gradientWord}>Agent</span>
              </Heading>
              <Text
                type="text1"
                color="secondary"
                ellipsis={false}
                className={styles.heroSubtitle}
              >
                Hey {isFirstVisit ? "Imri" : "Alex"}, add a teammate that gets
                the work done for you
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
                  placeholder="Describe the agent you want to create"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
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
                      <Button kind="tertiary" size="small" leftIcon={Mention}>
                        Add context
                      </Button>
                    </span>
                    <IconButton
                      icon={Attach}
                      size="small"
                      kind="tertiary"
                      aria-label="Attach file"
                    />
                  </Flex>
                  <IconButton
                    icon={MoveArrowUp}
                    kind="primary"
                    size="small"
                    color="primary"
                    aria-label="Send message"
                    className={styles.composerSendButton}
                  />
                </Flex>
              </div>
            </div>

            <Flex
              align="center"
              justify="center"
              gap="xs"
              className={styles.templateChips}
            >
              {PROMPT_TEMPLATES.map((template) => (
                <Button
                  key={template}
                  kind="secondary"
                  size="small"
                  onClick={() => setPrompt(TEMPLATE_PROMPTS[template])}
                >
                  {template}
                </Button>
              ))}
            </Flex>
          </div>

          <div className={styles.discoverHeader}>
            <Heading type="h3" weight="light" className={styles.discoverTitle}>
              Discover <span className={styles.gradientWordSmall}>Agents</span>
            </Heading>
            <Text
              type="text1"
              color="secondary"
              ellipsis={false}
              className={styles.discoverSubtitle}
            >
              Explore ready-to-use agents that handle your work, from daily
              tasks to complex workflows. Just pick one and go.
            </Text>
            <div
              className={styles.categoryFilters}
              role="tablist"
              aria-label="Agent categories"
            >
              {GALLERY_CATEGORIES.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <Clickable
                    key={category}
                    role="tab"
                    aria-label={category}
                    className={[
                      styles.categoryFilter,
                      isActive ? styles.categoryFilterActive : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => scrollToCategory(category)}
                  >
                    {category}
                  </Clickable>
                );
              })}
            </div>
          </div>

          <section
            id={SECTION_IDS["Made for you"]}
            className={styles.marketplaceSection}
            aria-labelledby="agents-made-for-you-title"
          >
            <Flex
              align="center"
              justify="space-between"
              className={styles.sectionHeader}
            >
              <div>
                <Heading
                  id="agents-made-for-you-title"
                  type="h3"
                  weight="medium"
                  className={styles.marketplaceTitle}
                >
                  Agents made for you
                </Heading>
                <Text type="text1" color="secondary">
                  Personalized based on your workspace activity
                </Text>
              </div>
              <SectionNav />
            </Flex>
            <div className={styles.personalizedGrid}>
              {PERSONALIZED_AGENTS.map((agent) => (
                <PersonalizedAgentCard
                  key={agent.id}
                  agent={agent}
                  onSelect={() => selectAgent(agent)}
                />
              ))}
            </div>
          </section>

          {CATEGORY_SECTIONS.map((section) => (
            <section
              key={section.id}
              id={SECTION_IDS[section.id]}
              className={styles.marketplaceSection}
              aria-labelledby={`${section.id}-title`}
            >
              <Flex
                align="center"
                justify="space-between"
                className={styles.sectionHeader}
              >
                <Heading
                  id={`${section.id}-title`}
                  type="h3"
                  weight="medium"
                  className={styles.marketplaceTitle}
                >
                  {section.title}
                </Heading>
                <SectionNav />
              </Flex>
              <div className={styles.galleryGrid}>
                <FeaturedBanner featured={section.featured} />
                {section.agents.map((agent) => (
                  <GalleryAgentCard
                    key={agent.id}
                    agent={agent}
                    onSelect={() => selectAgent(agent)}
                  />
                ))}
              </div>
            </section>
          ))}

          <section
            id={SECTION_IDS["From monday.com"]}
            className={styles.marketplaceSection}
            aria-labelledby="from-monday-title"
          >
            <Flex
              align="center"
              justify="space-between"
              className={styles.sectionHeader}
            >
              <div>
                <Heading
                  id="from-monday-title"
                  type="h3"
                  weight="medium"
                  className={styles.marketplaceTitle}
                >
                  From the monday team
                </Heading>
                <Text type="text1" color="secondary">
                  See how we use agents to transform their work
                </Text>
              </div>
              <SectionNav />
            </Flex>
            <div className={styles.testimonialGrid}>
              <MondayTeamCard />
              <MondayTeamCard />
            </div>
          </section>
        </div>
      </Box>
    </div>
  );
}
