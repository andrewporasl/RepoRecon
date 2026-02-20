# Feature C: Strategist Terminal

The Strategist Terminal is a conversational interface that allows users to interact directly with the repository intelligence engine.

## Implementation Details

- **Engine**: Local **Ollama** server running the `llama3` model.
- **Backend**: `backend/main.py` routes requests to the local Ollama API (port 11434).
- **Frontend**: `src/app/terminal/page.tsx`
- **Persona**: The agent acts as "Strategist" — a senior technical lead with a concise, tactical communication style.

## Requirements

1. **Ollama Service**: Must be running (`ollama serve`).
2. **Model**: `llama3:latest` must be pulled (`ollama pull llama3`).

## UI/UX Patterns
- **Chat Bubbles**: Minimal, secondary-colored bubbles for user messages; clean, unboxed text for agent responses.
- **Micro-Animations**: Bouncing dots indicate "Agent is thinking" state.
- **Sticky Input**: The command bar is anchored to the bottom with a blur effect for persistent accessibility.
