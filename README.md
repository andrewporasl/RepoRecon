# RepoRecon

**RepoRecon** is an advanced repository analysis environment designed for high-density information display and AI-driven insights. It provides a refined interface for monitoring system activity, performing architectural evaluations, and interacting with a strategist agent.

## System Architecture

The project is built on **Next.js 16** and uses a premium **Dark Pastel-Green** design system with a classic serif aesthetic.

- **Activity Feed**: Real-time monitoring of PRs and commits with a focus on high-density information.
- **Agent Insights**: Structured architectural analysis with specialized "Thinking" states and integrated code diffs.
- **Strategist Terminal**: A conversational interface for direct agent interaction, powered by local AI.

## Design Philosophy

- **Theme**: Dark Pastel-Green. Deep dark backgrounds (`#181c18`) with soft mint/pastel green accents (`#86efac`).
- **Typography**: **Crimson Pro** (Classic Serif) for headers and interface, **Geist Mono** for code and terminal.
- **Aesthetic**: Refined, classic, yet highly functional.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **AI Engine**: Ollama (local llama3)
- **Backend**: FastAPI (Python)
- **Animation**: Framer Motion
- **Database**: Convex

## Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- **Ollama** installed and running (`ollama serve`).
- GitHub Personal Access Token.

### 2. Environment Setup
Create a `.env` file in the root directory (see `.env.example`).
```bash
GITHUB_TOKEN=ghp_yourtoken
GITHUB_REPO=owner/repo
```

### 3. Run Everything (Recommmended)
This command will install dependencies and run all services (Frontend, Backend, Database) concurrently:

```bash
# Windows
.\start-dev.bat

# Or using npm
npm run dev:all
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Convex Dashboard**: (Link in terminal output)

## Project Structure

- `/src/app/activity`: Activity Feed implementation.
- `/src/app/insights`: Agent Analysis and evaluation modules.
- `/src/app/terminal`: Strategist interactive terminal.
- `/backend`: FastAPI Python server with Ollama integration.
- `/MarkdownGuides`: Design tokens and feature specifications.
