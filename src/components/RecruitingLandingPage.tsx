import { useAgentFlow } from "../context/AgentFlowContext";
import { MondayMulticolorMark } from "./ProductLogos";
import { DEMO_AVATAR_1 } from "../demo/demoPeople";
import styles from "./RecruitingLandingPage.module.scss";

const TRUST_LOGOS = [
  "HOLT CAT",
  "Canva",
  "Coca-Cola",
  "OXY",
  "LIONSGATE",
  "Carrefour",
  "BD",
  "Glossier.",
  "Universal Music Group",
] as const;

function GetStartedButton({
  className,
  onClick,
}: {
  className?: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className={className} onClick={onClick}>
      Get Started
      <span aria-hidden="true">→</span>
    </button>
  );
}

export function RecruitingLandingPage({
  onGetStarted,
}: {
  onGetStarted: () => void;
}) {
  const flow = useAgentFlow();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <MondayMulticolorMark />
          <span className={styles.logoText}>monday.com</span>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.outlineButton}>
            Contact sales
          </button>
          <GetStartedButton
            className={styles.primaryButton}
            onClick={onGetStarted}
          />
        </div>
      </header>

      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          {flow.landing.heroTitleLine1}
          <span className={styles.gradientLine}>{flow.landing.heroTitleLine2}</span>
        </h1>
        <p className={styles.heroSubtitle}>{flow.landing.heroSubtitle}</p>
        <div className={styles.heroCta}>
          <GetStartedButton
            className={styles.primaryButton}
            onClick={onGetStarted}
          />
        </div>
        <p className={styles.heroFinePrint}>
          No credit card needed ✦ Unlimited time on Free plan
        </p>
      </section>

      <section className={styles.trust}>
        <p className={styles.trustLabel}>Trusted by 250,000+ customers worldwide</p>
        <div className={styles.logoRow}>
          {TRUST_LOGOS.map((logo) => (
            <span key={logo} className={styles.logoRowItem}>
              {logo}
            </span>
          ))}
        </div>
      </section>

      <div className={styles.showcaseWrap}>
        <section className={styles.showcase} aria-label="Product preview">
          <div className={styles.showcaseContent}>
            <div className={styles.previewStack}>
              <article className={styles.featureCard}>
                <img
                  className={styles.featureAvatar}
                  src={DEMO_AVATAR_1}
                  alt=""
                  aria-hidden="true"
                />
                <p className={styles.featureText}>{flow.landing.featureText}</p>
              </article>

              <article className={styles.pipelineCard}>
                <div className={styles.pipelineHeader}>
                  {flow.landing.pipelineHeader}
                </div>
                <div className={styles.pipelineGroup}>{flow.landing.pipelineGroup}</div>
                <table className={styles.pipelineTable}>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Status</th>
                      <th>Role / Position</th>
                      <th>Owner</th>
                      <th>CV</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{flow.landing.pipelineSampleName}</td>
                      <td>
                        <span className={styles.statusPill}>
                          {flow.landing.pipelineStatusLabel}
                        </span>
                      </td>
                      <td>{flow.landing.pipelineSampleRole}</td>
                      <td>—</td>
                      <td>—</td>
                    </tr>
                  </tbody>
                </table>
              </article>
            </div>

            <div className={styles.characterWrap}>
              <img
                className={styles.character}
                src={flow.assets.agentFull}
                alt=""
                aria-hidden="true"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
