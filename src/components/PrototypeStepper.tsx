import { Icon } from "@vibe/core";
import { MoveArrowLeft, MoveArrowRight } from "@mondaydotcomorg/icons";
import styles from "./PrototypeStepper.module.scss";

interface PrototypeStepperProps {
  stepIndex: number;
  stepLabel: string;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSelectStep: (index: number) => void;
  stepLabels: readonly string[];
}

export function PrototypeStepper({
  stepIndex,
  stepLabel,
  totalSteps,
  onPrevious,
  onNext,
  onSelectStep,
  stepLabels,
}: PrototypeStepperProps) {
  const atStart = stepIndex <= 0;
  const atEnd = stepIndex >= totalSteps - 1;

  return (
    <div className={styles.root} aria-label="Prototype screen stepper">
      <button
        type="button"
        className={styles.navButton}
        onClick={onPrevious}
        disabled={atStart}
        aria-label="Previous screen"
      >
        <Icon icon={MoveArrowLeft} size={16} />
      </button>

      <div className={styles.selectWrap}>
        <span className={styles.meta}>
          {stepIndex + 1}/{totalSteps}
        </span>
        <select
          className={styles.select}
          value={stepIndex}
          onChange={(event) => onSelectStep(Number(event.target.value))}
          aria-label={`Prototype screen: ${stepLabel}`}
        >
          {stepLabels.map((label, index) => (
            <option key={label} value={index}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        className={styles.navButton}
        onClick={onNext}
        disabled={atEnd}
        aria-label="Next screen"
      >
        <Icon icon={MoveArrowRight} size={16} />
      </button>
    </div>
  );
}
