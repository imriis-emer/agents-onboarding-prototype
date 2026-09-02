import { useState } from "react";
import { Button } from "@vibe/core";
import { MoveArrowRight } from "@mondaydotcomorg/icons";
import { MondayMulticolorMark } from "./ProductLogos";
import { OnboardingSplitLayout } from "./OnboardingSplitLayout";
import {
  GENERAL_FOCUS_OPTIONS,
  getFocusVisualSrc,
} from "../data/generalOnboardingData";
import splitStyles from "./OnboardingSplitLayout.module.scss";
import styles from "./GeneralFocusQuestionPage.module.scss";

export function GeneralFocusQuestionPage({
  onBack,
  onContinue,
  onFocusChange,
  initialFocusId = "",
  embedded = false,
  hideCards = false,
  hideFooter = false,
  isExiting = false,
}: {
  onBack: () => void;
  onContinue: (focusId: string, customLabel?: string) => void;
  onFocusChange?: (focusId: string) => void;
  initialFocusId?: string;
  embedded?: boolean;
  hideCards?: boolean;
  hideFooter?: boolean;
  isExiting?: boolean;
}) {
  const [selectedFocusId, setSelectedFocusId] = useState(initialFocusId);
  const canContinue = selectedFocusId.length > 0;

  const selectFocus = (focusId: string) => {
    setSelectedFocusId(focusId);
    onFocusChange?.(focusId);
  };

  const handleContinue = () => {
    if (!canContinue) return;
    onContinue(selectedFocusId);
  };

  const body = (
    <>
      <div className={styles.logo}>
        <MondayMulticolorMark />
      </div>

      <div
        className={`${styles.headingBlock} ${
          isExiting ? styles.contentExit : ""
        }`}
      >
        <h1 className={styles.title}>What&apos;s your main focus right now?</h1>
        <p className={styles.subtitle}>You can always add more in the future</p>
      </div>

      <div
        className={`${styles.cardsSection} ${
          hideCards ? styles.cardsSectionHidden : ""
        } ${isExiting ? styles.contentExit : ""}`}
      >
        <div className={styles.cardGrid}>
          {GENERAL_FOCUS_OPTIONS.map((option) => {
            const isSelected = option.id === selectedFocusId;
            return (
              <button
                key={option.id}
                type="button"
                className={`${styles.focusCard} ${
                  option.fullWidth ? styles.focusCardFull : ""
                } ${isSelected ? styles.focusCardSelected : ""}`}
                onClick={() => selectFocus(option.id)}
              >
                <span className={styles.focusCardTitle}>{option.title}</span>
                {option.description ? (
                  <span className={styles.focusCardDescription}>
                    {option.description}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );

  const footer = (
    <>
      <Button kind="tertiary" size="medium" onClick={onBack}>
        Back
      </Button>
      <Button
        kind="primary"
        size="medium"
        rightIcon={MoveArrowRight}
        disabled={!canContinue}
        onClick={handleContinue}
      >
        Continue
      </Button>
    </>
  );

  if (embedded) {
    return (
      <div className={splitStyles.formFill}>
        <div className={`${splitStyles.formBody} ${splitStyles.formBodyWide}`}>
          {body}
        </div>
        <div
          className={`${splitStyles.footer} ${
            hideFooter ? splitStyles.footerHidden : ""
          } ${isExiting ? styles.contentExit : ""}`}
        >
          {footer}
        </div>
      </div>
    );
  }

  return (
    <OnboardingSplitLayout
      visualSrc={getFocusVisualSrc(selectedFocusId)}
      wide
      footer={hideFooter ? undefined : footer}
    >
      {body}
    </OnboardingSplitLayout>
  );
}
