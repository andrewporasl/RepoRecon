# RepoRecon

**RepoRecon** is an advanced repository analysis environment designed for high-density information display and AI-driven insights. It provides a refined interface for monitoring system activity, performing architectural evaluations, and interacting with a strategist agent.

## System Architecture

The project is built on **Next.js 16** and uses a minimalist, premium design system centered around deep zinc tones and crisp, thin borders.

- **Activity Feed**: Real-time monitoring of PRs and commits with a focus on high-density information.
- **Agent Insights**: Structured architectural analysis with specialized "Thinking" states and low-contrast code diffs.
- **Strategist Terminal**: A conversational interface for direct agent interaction, featuring a Slack-style thread layout.

## Design Philosophy

- **Background**: `zinc-950` (Deep charcoal).
- **Surface**: `zinc-900` with `zinc-800` borders.
- **Typography**: Geist Sans for interface, Geist Mono for code and terminal.
- **Ghost Frame**: A transparent sidebar system with 1px borders to maximize content space while maintaining context.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: Sonner

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the system overview.

## Project Structure

- `/src/app/activity`: Activity Feed implementation.
- `/src/app/insights`: Agent Analysis and evaluation modules.
- `/src/app/terminal`: Strategist interactive terminal.
- `/MarkdownGuides`: Design tokens and feature specifications.
