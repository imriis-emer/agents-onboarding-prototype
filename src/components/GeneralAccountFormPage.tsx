import { useState } from "react";
import { Button, TextField } from "@vibe/core";
import { MoveArrowRight } from "@mondaydotcomorg/icons";
import { MondayMulticolorMark } from "./ProductLogos";
import { OnboardingSplitLayout } from "./OnboardingSplitLayout";
import signupVisual from "../assets/packaged-onboarding/signup-visual.png";
import styles from "./GeneralAccountFormPage.module.scss";

export function GeneralAccountFormPage({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: () => void;
}) {
  const [fullName, setFullName] = useState("Alex Morgan");
  const [password, setPassword] = useState("1234001010");
  const [accountName, setAccountName] = useState("Morgan & Co");
  const [useFor, setUseFor] = useState("Work");
  const [phone, setPhone] = useState("(123) 456-7890");
  const canContinue =
    fullName.trim().length > 0 &&
    password.trim().length > 0 &&
    accountName.trim().length > 0;

  return (
    <OnboardingSplitLayout
      visualSrc={signupVisual}
      footer={
        <>
          <Button kind="tertiary" size="medium" onClick={onBack}>
            Back
          </Button>
          <Button
            kind="primary"
            size="medium"
            rightIcon={MoveArrowRight}
            disabled={!canContinue}
            onClick={onContinue}
          >
            Continue
          </Button>
        </>
      }
    >
      <div className={styles.logo}>
        <MondayMulticolorMark />
      </div>

      <div className={styles.headingBlock}>
        <h1 className={styles.title}>Create your account</h1>
      </div>

      <div className={styles.fields}>
        <TextField
          title="Full name"
          value={fullName}
          onChange={setFullName}
          size="medium"
        />
        <TextField
          title="Password"
          type="password"
          value={password}
          onChange={setPassword}
          size="medium"
        />
        <TextField
          title="Account name"
          value={accountName}
          onChange={setAccountName}
          size="medium"
        />
        <TextField
          title="What will you use monday.com for?"
          value={useFor}
          onChange={setUseFor}
          size="medium"
        />
        <div className={styles.phoneField}>
          <span className={styles.phoneLabel} id="account-phone-label">
            Phone number
          </span>
          <div className={styles.phoneRow} role="group" aria-labelledby="account-phone-label">
            <TextField
              value="(+972)"
              onChange={() => undefined}
              size="medium"
              aria-label="Country code"
            />
            <TextField
              value={phone}
              onChange={setPhone}
              size="medium"
              aria-label="Phone number"
            />
          </div>
        </div>
      </div>
    </OnboardingSplitLayout>
  );
}
