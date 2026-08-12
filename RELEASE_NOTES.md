# Release notes

## Header fix & video modal — 2026-07-08

Branch: `header-fix-and-video-modal`

Polish pass on the agents onboarding conversation view: fixes a header overlap
regression, guarantees the agent's latest activity is always readable above the
composer, adds a play-in-place intro video for Lia, and corrects two Lia flow
details (a stray nav board and the workspace name).

### Summary

| Area | Change | Type |
|---|---|---|
| Agent identity header | Header no longer overlaps conversation text; now an in-flow top-left element with a scroll fade | Fix |
| Conversation scroll | Top fade-mask under the header for all agents (main view + board-view panel) | Enhancement |
| Conversation scroll | Last agent activity always fully visible above the composer; sticky auto-follow restored | Fix |
| Lia — intro video | Preview button opens a video modal that plays Lia's intro clip | Feature |
| Lia — left nav | Removed the stray "Active Campaigns" board that appeared after the daily job | Fix |
| Lia — workspace | Renamed "Ohad's Space" → "Ohad's Marketing Space" | Copy |

### Details

#### 1. Agent identity header overlap + conversation fade

The agent identity header (avatar + "Name, Role") was absolutely positioned over
the scroll area, so conversation text rendered behind it and looked broken.

- The header is now a normal in-flow, top-left element (`flex-shrink: 0`) that
  occupies real layout space, so text can no longer sit behind it.
- A top fade-mask (`mask-image: linear-gradient(to bottom, transparent 0, #000 28px)`)
  was added to the conversation scroll container so content softly dissolves as it
  scrolls under the header. This lives on the shared `.chatScroll`, so it applies to
  **all agents** (Jade and Lia), and was also added to the board-view chat panel
  (`.jadeChatMessages`) for consistency.
- The scroll is top-aligned (`justify-content: flex-start`) and the obsolete
  `chatScrollHero` class was removed, fixing a large empty gap that appeared at the
  top of short conversations after the hero video exited.

#### 2. Lia intro video modal

Lia's LinkedIn post widget had a non-functional "Preview" button.

- The Preview button now opens a portaled video modal (rendered via
  `createPortal` to `document.body`) that plays Lia's intro video.
- Closable via the "X" button, backdrop click, or the Escape key.
- Uses the flow's own `videoSrc` and `heroPoster`, with an entrance animation.

#### 3. Last activity always visible above the composer

The agent's latest activity (e.g. a "Thinking…" / plan card) could be clipped
behind the composer.

- Root cause 1: auto-scroll aligns a zero-height anchor to the viewport bottom, so
  the last message landed flush against the composer; the 100px scroll padding sat
  *below* the anchor where it never became clearance.
- Root cause 2: that same 100px exceeded the 96px "at bottom" threshold, which
  disabled sticky auto-follow after every scroll, so new activity never scrolled
  into view.
- Fix: give the scroll anchor real height (`var(--space-32)`) so the last activity
  clears the composer, and reduce the content bottom padding to `var(--space-24)`
  so it stays under the follow threshold. Applies to the main conversation and the
  board-view chat panel via the shared anchor.

#### 4. Lia left-nav board + workspace name

- After Lia's "Content Drafting" daily job was set, a stray **"Active Campaigns"**
  board appeared in the left nav. The scheduled `setKnowledgeBoards` call in
  `handleAutomationSelect` was missing the `lia-draft` branch, so it overwrote the
  correct `[mainBoard]` state with `[openItemsBoard, focusBoard]`. The scheduled
  call now mirrors the first, so Lia keeps only **"Social Media Content"**.
- Lia's workspace label was renamed from **"Ohad's Space"** to
  **"Ohad's Marketing Space"**.

### Files changed

- `src/components/AgentsOnboardingView.tsx`
- `src/components/AgentsOnboardingView.module.scss`
- `src/components/LiaSocialWidgets.tsx`
- `src/data/agentFlows.ts`

### Commits

- `f6fdf0c` — Fix agent header overlap and add Lia intro video modal
- `fe69122` — Keep the agent's last activity fully visible above the composer
- `d55ea0b` — Fix Lia nav board and workspace name
