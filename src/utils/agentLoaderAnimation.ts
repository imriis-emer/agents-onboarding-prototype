export const AGENT_LOADING_MESSAGES = [
  "Your agent is waking up…",
  "Getting briefed on the goal…",
  "Picking up the right tools…",
  "Running a quick warm-up…",
  "Your agent is almost ready…",
  "Your agent is nearly here…",
] as const;

export const JADE_LOADING_MESSAGES = [
  "Your HR Agent is waking up…",
  "Getting briefed on the goal…",
  "Loading hiring skills…",
  "Sharpening sourcing instincts…",
  "Your agent is almost ready…",
  "Your agent is nearly here…",
] as const;

export const LIA_LOADING_MESSAGES = [
  "Your Marketing Agent is waking up…",
  "Getting briefed on the goal…",
  "Loading marketing skills…",
  "Sharpening marketing instincts…",
  "Your agent is almost ready…",
  "Your agent is nearly here…",
] as const;

export const ACCOUNT_CREATING_MESSAGES = ["Creating your account…"] as const;

export function messageWithoutDots(message: string): string {
  return message.replace(/(?:\.{3}|…)$/, "");
}

export interface AgentLoaderElements {
  messageEl: HTMLElement;
  textEl: HTMLElement;
  dotsEl: HTMLElement;
}

export interface RunAnimationOptions {
  signal?: AbortSignal;
  /** When false, runs one full pass through all messages then stops. Default: true */
  loop?: boolean;
  /** Number of full passes through all messages before stopping. */
  cycles?: number;
}

const CHAR_DELAY_MS = 44;
const HOLD_MS = 2000;
const FADE_MS = 150;

export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      window.clearTimeout(timeoutId);
      reject(new DOMException("Aborted", "AbortError"));
    };

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function resetDots(dotsEl: HTMLElement) {
  dotsEl.classList.remove("isVisible", "isThinking");
  dotsEl.querySelectorAll<HTMLElement>("[data-dot]").forEach((dot) => {
    dot.classList.remove("isVisible");
  });
}

export async function typeText(
  textEl: HTMLElement,
  text: string,
  signal?: AbortSignal,
): Promise<void> {
  textEl.textContent = "";

  for (let index = 0; index < text.length; index += 1) {
    await sleep(CHAR_DELAY_MS, signal);
    textEl.textContent = text.slice(0, index + 1);
  }
}

export async function showDots(
  dotsEl: HTMLElement,
  _signal?: AbortSignal,
): Promise<void> {
  dotsEl.classList.add("isVisible", "isThinking");
}

export async function transitionToNextMessage(
  elements: AgentLoaderElements,
  signal?: AbortSignal,
): Promise<void> {
  const { messageEl, textEl, dotsEl } = elements;

  messageEl.style.opacity = "0";
  await sleep(FADE_MS, signal);

  textEl.textContent = "";
  resetDots(dotsEl);

  requestAnimationFrame(() => {
    messageEl.style.opacity = "1";
  });
}

export async function runAnimation(
  elements: AgentLoaderElements,
  messages: readonly string[],
  options: RunAnimationOptions = {},
): Promise<void> {
  const { signal, loop = true, cycles } = options;

  let index = 0;
  let isFirstMessage = true;
  let completedCycles = 0;

  while (!signal?.aborted) {
    if (!isFirstMessage) {
      await transitionToNextMessage(elements, signal);
    } else {
      elements.messageEl.style.opacity = "1";
      isFirstMessage = false;
    }

    await typeText(
      elements.textEl,
      messageWithoutDots(messages[index] ?? ""),
      signal,
    );
    await showDots(elements.dotsEl, signal);
    await sleep(HOLD_MS, signal);

    const isLastMessage = index >= messages.length - 1;
    if (isLastMessage) {
      completedCycles += 1;
      if (cycles !== undefined && completedCycles >= cycles) {
        return;
      }
      if (!loop && cycles === undefined) {
        return;
      }
    }

    index = (index + 1) % messages.length;
  }
}
