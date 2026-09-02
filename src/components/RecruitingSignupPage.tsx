import { useState } from "react";
import { Button, TextField } from "@vibe/core";
import { useAgentFlow } from "../context/AgentFlowContext";
import { MondayMulticolorMark } from "./ProductLogos";
import { OnboardingSplitLayout } from "./OnboardingSplitLayout";
import generalSignupVisual from "../assets/packaged-onboarding/signup-visual.png";
import googleIcon from "../assets/recruiting-onboarding/google-icon.svg";
import styles from "./RecruitingSignupPage.module.scss";

const EMAIL_PLACEHOLDER = "name@company.com";

export function RecruitingSignupPage({
  onContinue,
  isGeneralFlow,
}: {
  onContinue: () => void;
  isGeneralFlow?: boolean;
}) {
  const flow = useAgentFlow();
  const isGeneral = isGeneralFlow ?? flow.id === "general";
  const [email, setEmail] = useState("");
  const canContinue = email.trim().length > 0;

  const formInner = (
    <div className={styles.formInner}>
      <div className={styles.headingBlock}>
        {isGeneral && (
          <div className={styles.logo}>
            <MondayMulticolorMark />
          </div>
        )}
        <h1 className={styles.title}>
          Welcome to monday.com
          <br />
          You lead, agents act.
        </h1>
        <p className={styles.tagline}>{flow.signup.tagline}</p>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.googleButton}
          onClick={onContinue}
        >
          <img className={styles.googleIcon} src={googleIcon} alt="" />
          Continue with Google
        </button>

        <div className={styles.dividerRow}>
          <span className={styles.dividerLine} aria-hidden="true" />
          <span className={styles.dividerLabel}>Or</span>
          <span className={styles.dividerLine} aria-hidden="true" />
        </div>

        <TextField
          className={styles.emailField}
          placeholder={EMAIL_PLACEHOLDER}
          value={email}
          onChange={setEmail}
          size="large"
        />

        <Button
          className={styles.continueButton}
          kind="primary"
          size="large"
          disabled={!canContinue}
          onClick={onContinue}
        >
          Continue
        </Button>
      </div>

      <div className={styles.legalBlock}>
        <p>
          By proceeding, you agree to the{" "}
          <a className={styles.link} href="#terms">
            Terms of Service
          </a>{" "}
          and{" "}
          <a className={styles.link} href="#privacy">
            Privacy Policy
          </a>
          .
        </p>
        <p className={styles.loginPrompt}>
          Already have an account?{" "}
          <a className={styles.link} href="#login">
            Log in
          </a>
        </p>
      </div>
    </div>
  );

  if (isGeneral) {
    return (
      <OnboardingSplitLayout visualSrc={generalSignupVisual} centered>
        {formInner}
      </OnboardingSplitLayout>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.formPanel}>
        {formInner}
      </div>

      <div
        className={`${styles.visualPanel} ${
          flow.id === "jade" ? styles.visualPanelJade : ""
        }`}
        aria-hidden="true"
      >
        <img className={styles.visualImage} src={flow.signup.visual} alt="" />
      </div>
    </div>
  );
}
