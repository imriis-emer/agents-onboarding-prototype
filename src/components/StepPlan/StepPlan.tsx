import { useEffect, useState } from "react";
import { Flex, Heading, Text } from "@vibe/core";
import styles from "./StepPlan.module.scss";

export interface PlannedStep {
  stepId: string;
  blockName: string;
  purpose: string;
}

export interface StepPlanProps {
  summary: string;
  steps: readonly PlannedStep[];
}

const STEP_FIRST_DELAY_MS = 700;
const STEP_INTERVAL_MS = 1500;

export function StepPlan({ summary, steps }: StepPlanProps) {
  const [visibleStepCount, setVisibleStepCount] = useState(0);

  useEffect(() => {
    setVisibleStepCount(0);
    const timers: number[] = steps.map((_, index) =>
      window.setTimeout(
        () => setVisibleStepCount((count) => Math.max(count, index + 1)),
        STEP_FIRST_DELAY_MS + index * STEP_INTERVAL_MS,
      ),
    );

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [steps]);

  return (
    <Flex
      direction="column"
      align="start"
      gap="medium"
      className={styles.root}
    >
      <Heading type="h2">My plan</Heading>
      <Flex direction="column" align="start" className={styles.markdown}>
        <Text element="p" className={styles.summary}>
          {summary}
        </Text>
        <ol className={styles.list}>
          {steps.slice(0, visibleStepCount).map((step, index) => (
            <li
              key={step.stepId}
              className={styles.listItem}
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <Text element="span" weight="bold">
                {step.blockName}
              </Text>
              <Text element="span">: {step.purpose}</Text>
            </li>
          ))}
        </ol>
      </Flex>
    </Flex>
  );
}
