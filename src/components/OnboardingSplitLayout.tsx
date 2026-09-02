import type { ReactNode } from "react";
import styles from "./OnboardingSplitLayout.module.scss";

export function OnboardingSplitLayout({
  visualSrc,
  children,
  footer,
  wide = false,
  centered = false,
}: {
  visualSrc: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  centered?: boolean;
}) {
  return (
    <div className={styles.page}>
      <div
        className={`${styles.formPanel} ${
          centered ? styles.formPanelCentered : ""
        }`}
      >
        <div
          className={`${styles.formBody} ${
            centered ? styles.formBodyCentered : ""
          } ${wide ? styles.formBodyWide : ""}`}
        >
          {children}
        </div>
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>

      <div className={styles.visualPanel} aria-hidden="true">
        <img className={styles.visualImage} src={visualSrc} alt="" />
      </div>
    </div>
  );
}
