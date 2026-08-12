import { useEffect, useRef } from "react";
import { useAgentFlow } from "../context/AgentFlowContext";
import mondayLoaderGif from "../assets/recruiting-onboarding/monday-loader.gif";
import {
  runAnimation,
  ACCOUNT_CREATING_MESSAGES,
} from "../utils/agentLoaderAnimation";
import { LOADER_CANVAS_WIDTH_PX } from "../data/loaderCanvasDimensions";
import styles from "./RecruitingLoadingScreen.module.scss";

interface RecruitingLoadingScreenProps {
  onComplete?: () => void;
  autoCompleteAfterMs?: number;
  /** Loop indefinitely for preview/iteration. */
  preview?: boolean;
  /** Embed inside a card instead of full viewport. */
  compact?: boolean;
  /** 2× size for preview iteration only. */
  large?: boolean;
  /** Agent wake-up sequence vs post-signup account creation. */
  variant?: "agent" | "account";
}

export function RecruitingLoadingScreen({
  onComplete,
  autoCompleteAfterMs,
  preview = false,
  compact = false,
  large = false,
  variant = "agent",
}: RecruitingLoadingScreenProps) {
  const flow = useAgentFlow();
  const messages =
    variant === "account" ? ACCOUNT_CREATING_MESSAGES : flow.loading.messages;
  const messageRef = useRef<HTMLParagraphElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const dotsRef = useRef<HTMLSpanElement>(null);
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const messageEl = messageRef.current;
    const textEl = textRef.current;
    const dotsEl = dotsRef.current;

    if (!messageEl || !textEl || !dotsEl) return;

    const controller = new AbortController();
    completedRef.current = false;

    runAnimation(
      { messageEl, textEl, dotsEl },
      messages,
      preview
        ? { signal: controller.signal, loop: true }
        : variant === "account"
          ? { signal: controller.signal, cycles: 1 }
          : { signal: controller.signal, cycles: 3 },
    )
      .then(() => {
        if (autoCompleteAfterMs !== undefined || completedRef.current) return;
        completedRef.current = true;
        onCompleteRef.current?.();
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        throw error;
      });

    return () => controller.abort();
  }, [autoCompleteAfterMs, messages, preview, variant]);

  useEffect(() => {
    if (preview || autoCompleteAfterMs === undefined) return;

    const timeoutId = window.setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      onCompleteRef.current?.();
    }, autoCompleteAfterMs);

    return () => window.clearTimeout(timeoutId);
  }, [autoCompleteAfterMs, preview]);

  return (
    <div
      className={[
        compact ? styles.compact : styles.page,
        large && styles.large,
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-live="polite"
    >
      <div
        className={styles.canvas}
        style={{ width: LOADER_CANVAS_WIDTH_PX, maxWidth: "100%" }}
      >
        <div className={styles.row}>
          <img
            src={mondayLoaderGif}
            alt=""
            className={styles.loader}
            aria-hidden="true"
          />
          <p ref={messageRef} className={styles.message}>
            <span ref={textRef} className={styles.messageText} />
            <span ref={dotsRef} className={styles.dots}>
              <span className={styles.dot} data-dot>
                .
              </span>
              <span className={styles.dot} data-dot>
                .
              </span>
              <span className={styles.dot} data-dot>
                .
              </span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
