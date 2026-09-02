import homepageScreenshot from "../assets/packaged-onboarding/homepage.png";
import styles from "./GeneralLandingPage.module.scss";

export function GeneralLandingPage({
  onGetStarted,
}: {
  onGetStarted: () => void;
}) {
  return (
    <button
      type="button"
      className={styles.page}
      onClick={onGetStarted}
      aria-label="Get Started"
    >
      <img
        className={styles.screenshot}
        src={homepageScreenshot}
        alt="People and agents working as one team"
      />
    </button>
  );
}
