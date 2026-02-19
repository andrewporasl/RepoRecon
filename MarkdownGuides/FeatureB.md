# Feature B: Agent Insights

Agent Insights provides structural and architectural evaluations of the repository, presented as actionable cards with detailed code diffs.

## Implementation Details

- **Backend**: `backend/main.py` serves a collection of `InsightCard` objects.
- **Frontend**: `src/app/insights/page.tsx`
- **Key Features**:
  - **Animated Progress Bars**: Visualizes the "thinking" or "evaluation" state of the agent.
  - **Syntax-Highlighted Diffs**: Minimalist diff blocks using emerald and rose tints for additions and removals.
  - **Fallback State**: Client-side fallback data ensures the UI remains functional if the backend is unavailable.

## Evaluation Types
1. **Migration Analysis**: Identifying shifts in patterns (e.g., CJS to ESM).
2. **Security Audits**: Real-time detection of potential vulnerabilities.
3. **Architecture Reviews**: Evaluations against best practices.

## Design
Cards use the `@card` background (`#1f241f`) with a `primary` (`#86efac`) top-border accent. Typography is set to **Crimson Pro** for a classic, authoritative feel.
