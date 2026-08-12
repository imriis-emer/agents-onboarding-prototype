import { MondayMulticolorMark } from "./ProductLogos";
import generalLandingCarousel from "../assets/agents-onboarding/general-landing-carousel.png";
import styles from "./GeneralLandingPage.module.scss";

const NAV_LINKS = ["AI platform", "Solutions", "Resources", "Enterprise"];

export function GeneralLandingPage({
  onGetStarted,
}: {
  onGetStarted: () => void;
}) {
  return (
    <div className={styles.page}>
      <div className={styles.gridBg} aria-hidden="true" />

      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <MondayMulticolorMark />
            <span className={styles.logoText}>monday.com</span>
          </div>
          <nav className={styles.nav}>
            {NAV_LINKS.map((link) => (
              <span key={link} className={styles.navLink}>
                {link}
                <span aria-hidden="true" className={styles.navCaret}>
                  ⌄
                </span>
              </span>
            ))}
          </nav>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.textLink}>Pricing</span>
          <button type="button" className={styles.outlineButton}>
            Contact sales
          </button>
          <button
            type="button"
            className={styles.accountButton}
            onClick={onGetStarted}
          >
            Go to my account <span aria-hidden="true">→</span>
          </button>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.lockup}>
          <MondayMulticolorMark />
          <span className={styles.lockupText}>
            <strong>monday</strong> agents
          </span>
        </div>
        <h1 className={styles.heroTitle}>Your unlimited workforce</h1>
        <p className={styles.heroSubtitle}>
          Expand what you can achieve with ready-made or custom AI agents that
          act where you already work.
        </p>
        <button
          type="button"
          className={styles.getStarted}
          onClick={onGetStarted}
        >
          Get started <span aria-hidden="true">→</span>
        </button>
      </section>

      <section className={styles.carousel} aria-label="Agent examples">
        <img
          className={styles.carouselImage}
          src={generalLandingCarousel}
          alt="Ready-made AI agents including RSVP Manager, Risk Analyzer, and Vendor Researcher"
        />
      </section>
    </div>
  );
}
