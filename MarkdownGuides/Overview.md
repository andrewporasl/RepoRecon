# RepoRecon Overview

RepoRecon is a specialized reconnaissance environment for repository intelligence. It combines real-time event monitoring, structural analysis, and conversational AI into a single, cohesive dashboard.

## Key Goals
- **High-Density Monitoring**: Providing as much useful information as possible without cognitive overload.
- **Local AI Sovereignty**: Using Ollama to ensure analysis remains local and private.
- **Refined Aesthetics**: A custom dark pastel-green theme that emphasizes focus and technical precision.

## System Structure
1. **Frontend (Next.js 16)**: The user interface, built with Tailwind CSS v4 and Framer Motion.
2. **Backend (FastAPI)**: The orchestration layer, handling GitHub API calls and Ollama routing.
3. **Intelligence (Ollama)**: The local LLM engine (Llama 3) providing conversational reasoning.
4. **Data Sync (Convex)**: Managing shared state and authentication across the platform.

## Quick Links
- [Setup Summary](../SETUP_SUMMARY.md)
- [Backend Quickstart](../BACKEND_QUICKSTART.md)
- [Feature A: Activity Feed](./FeatureA.md)
- [Feature B: Insights](./FeatureB.md)
- [Feature C: Terminal](./FeatureC.md)
