# TODO List: RepoRecon Implementation

Based on the `MarkdownGuides`, the following tasks remain to fully implement the system features:

## Feature A: Activity Feed
- [x] Connect feed to actual data source (or expanded mock data).
- [x] Implement hover states for PR rows (subtle background change to `zinc-900/50`).
- [x] Add uppercase metadata labels (e.g., AUTHOR: @user) with specific tracking/size.

## Feature B: Agent Insights
- [ ] Implement real analysis content rendering.
- [ ] refine "Thinking" state progress bar behavior at the top of analysis cards.
- [ ] Style code diffs with muted pastels or gutter symbols (+/-) rather than bright colors.

## Feature C: The Terminal (Strategist)
- [x] Implement command processing logic for the Strategist agent.
- [x] Connect the input field to a backend or state manager.
- [x] Refine the "Slack-style" thread layout (plain text on background).

## Global UI/UX
- [ ] Implement smooth micro-animations using `framer-motion`.
- [ ] Ensure "comfortable" padding (p-6, gap-8) across all new components.
- [ ] Add subtle inner-glow or ring offsets for card separation instead of heavy shadows.
