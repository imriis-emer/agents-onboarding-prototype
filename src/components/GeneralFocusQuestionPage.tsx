import { useState } from "react";
import { Button, TextField } from "@vibe/core";
import { Edit, MoveArrowRight } from "@mondaydotcomorg/icons";
import { MondayMulticolorMark } from "./ProductLogos";
import generalSignupVisual from "../assets/agents-onboarding/general-signup-visual.png";
import { GENERAL_FOCUS_OPTIONS } from "../data/generalOnboardingData";
import styles from "./GeneralFocusQuestionPage.module.scss";

const CUSTOM_FOCUS_ID = "custom";

export function GeneralFocusQuestionPage({
  onBack,
  onContinue,
  embedded = false,
  hideCards = false,
  hideFooter = false,
  isExiting = false,
}: {
  onBack: () => void;
  onContinue: (focusId: string, customLabel?: string) => void;
  embedded?: boolean;
  hideCards?: boolean;
  hideFooter?: boolean;
  isExiting?: boolean;
}) {
  const [selectedFocusId, setSelectedFocusId] = useState<string | null>(null);
  const [customFocus, setCustomFocus] = useState("");
  const isCustomSelected = selectedFocusId === CUSTOM_FOCUS_ID;
  const canContinue =
    selectedFocusId !== null &&
    (selectedFocusId !== CUSTOM_FOCUS_ID || customFocus.trim().length > 0);

  const handleSelectPreset = (focusId: string) => {
    setSelectedFocusId(focusId);
    setCustomFocus("");
  };

  const handleCustomFocusChange = (value: string) => {
    setCustomFocus(value);
    setSelectedFocusId(CUSTOM_FOCUS_ID);
  };

  const handleContinue = () => {
    if (!canContinue || selectedFocusId === null) return;
    if (isCustomSelected && customFocus.trim()) {
      onContinue(CUSTOM_FOCUS_ID, customFocus.trim());
      return;
    }
    onContinue(selectedFocusId);
  };

  const formContent = (
    <div className={styles.formInner}>
      <div className={styles.topBar}>
        <Button kind="tertiary" size="medium" onClick={onBack}>
          <span className={styles.backArrow} aria-hidden="true">
            &larr;
          </span>
          Back
        </Button>
      </div>

      <div className={styles.logo}>
        <MondayMulticolorMark />
      </div>

      <div
        className={`${styles.headingBlock} ${
          isExiting ? styles.contentExit : ""
        }`}
      >
        <h1 className={styles.title}>
          What&apos;s your main focus right now at Nike.com?
        </h1>
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
                  isSelected ? styles.focusCardSelected : ""
                }`}
                onClick={() => handleSelectPreset(option.id)}
              >
                <span className={styles.focusCardTitle}>{option.title}</span>
                <span className={styles.focusCardDescription}>
                  {option.description}
                </span>
              </button>
            );
          })}

          <div
            className={`${styles.somethingElseCard} ${
              isCustomSelected ? styles.somethingElseCardActive : ""
            }`}
          >
            <span className={styles.somethingElseIcon} aria-hidden="true">
              <Edit />
            </span>
            <TextField
              className={styles.somethingElseInput}
              placeholder="Something else..."
              value={customFocus}
              onChange={handleCustomFocusChange}
              onFocus={() => setSelectedFocusId(CUSTOM_FOCUS_ID)}
              size="medium"
            />
          </div>
        </div>
      </div>

      <div
        className={`${styles.footer} ${
          hideFooter ? styles.footerHidden : ""
        } ${isExiting ? styles.contentExit : ""}`}
      >
        <div aria-hidden="true" />
        <Button
          kind="primary"
          size="medium"
          rightIcon={MoveArrowRight}
          disabled={!canContinue}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );

  if (embedded) {
    return <div className={styles.formPanelEmbedded}>{formContent}</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.formPanel}>{formContent}</div>

      <div className={styles.visualPanel} aria-hidden="true">
        <img className={styles.visualImage} src={generalSignupVisual} alt="" />
      </div>
    </div>
  );
}
