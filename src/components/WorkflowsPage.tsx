import { Box, Button, Flex, Heading, Icon, IconButton, Text } from "@vibe/core";
import { AISkills, MoveArrowUp, Work } from "@mondaydotcomorg/icons";
import { ProductContextBanner } from "./ProductContextBanner";
import styles from "./WorkflowsPage.module.scss";

const TEMPLATE_CATEGORIES = [
  "All",
  "Sales & CRM",
  "Support",
  "Marketing",
  "Productivity",
  "HR",
] as const;

const WORKFLOW_TEMPLATES = [
  {
    title: "Meeting summarizer",
    description: "When an update is added to the meeting script, summarize it.",
  },
  {
    title: "Feedback Sentiment",
    description: "Analyze every feedback item and update the sentiment column.",
  },
  {
    title: "Tickets routing",
    description: "When a ticket is created, analyze its severity and route it.",
  },
  {
    title: "Bi-weekly competition news",
    description: "Every two weeks, summarize competitor signals for the team.",
  },
  {
    title: "Lead qualification",
    description: "When a new lead is created, analyze potential and priority.",
  },
  {
    title: "Customer churn risk alert",
    description: "When health score drops, notify owners and suggest next steps.",
  },
] as const;

export function WorkflowsPage() {
  return (
    <Box className={styles.root}>
      <ProductContextBanner
        tone="workflows"
        title="Meet Workflows - your AI automation builder"
        description={
          <>
            From now on, you can turn any process into an automated workflow.
            <br />
            Describe what needs to happen and Workflows builds the steps for you.
          </>
        }
        actionLabel="Show me how"
      />

      <section className={styles.heroBlock}>
        <div className={styles.hero}>
          <Heading type="h1" weight="bold" className={styles.heroTitle}>
            Let&apos;s build your workflow
          </Heading>
          <Text
            type="text2"
            color="secondary"
            ellipsis={false}
            className={styles.heroSubtitle}
          >
            Describe any work process and watch it become a workflow in seconds.
          </Text>
        </div>

        <div className={styles.composerBorder} data-tour-target="workflows-composer">
          <div className={styles.composerWrap}>
            <textarea
              className={styles.composerInput}
              aria-label="Describe a workflow"
              placeholder="When a new employee is added, use AI to create a personalized onboarding plan"
            />
            <Flex justify="end" className={styles.composerFooter}>
              <Button kind="primary" size="small" rightIcon={MoveArrowUp}>
                Build workflow
              </Button>
            </Flex>
          </div>
        </div>

        <div className={styles.orDivider}>
          <span />
          <Text type="text3" color="secondary">
            or
          </Text>
          <span />
        </div>

        <Button kind="secondary" size="small" leftIcon={Work}>
          Start from scratch
        </Button>
      </section>

      <section className={styles.templateSection} data-tour-target="workflows-templates">
        <Flex align="center" justify="space-between" className={styles.templateHeader}>
          <Text type="text1" weight="medium" color="primary">
            Start with a template
          </Text>
          <Flex align="center" gap="xs" className={styles.categoryTabs}>
            {TEMPLATE_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                className={`${styles.categoryTab} ${
                  category === "All" ? styles.categoryTabActive : ""
                }`}
              >
                {category}
              </button>
            ))}
          </Flex>
        </Flex>

        <div className={styles.templateGrid}>
          {WORKFLOW_TEMPLATES.map(({ title, description }) => (
            <article key={title} className={styles.templateCard}>
              <Text type="text2" weight="medium" color="primary" ellipsis>
                {title}
              </Text>
              <Text type="text3" color="secondary" ellipsis maxLines={2}>
                {description}
              </Text>
              <Flex align="center" gap="xs" className={styles.templateApps}>
                <Icon icon={AISkills} size={14} label="" />
                <IconButton
                  icon={Work}
                  kind="tertiary"
                  size="small"
                  aria-label={`${title} template apps`}
                />
              </Flex>
            </article>
          ))}
        </div>
      </section>
    </Box>
  );
}
