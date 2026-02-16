"""FastAPI application for RepoRecon backend."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

from .models import (
    ActivityItem,
    InsightCard,
    DiffLine,
    TerminalRequest,
    TerminalResponse,
)
from .github_client import GitHubClient
from .webhook_handler import WebhookHandler

load_dotenv()

app = FastAPI(
    title="RepoRecon Backend",
    description="GitHub repository analysis and monitoring service",
    version="0.1.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize clients
github = GitHubClient()
webhook_handler = WebhookHandler()

# In-memory storage for insights and terminal messages
insights_db = [
    {
        "id": "insight-001",
        "title": "Module System Migration",
        "summary": "The diff indicates a shift from CommonJS to ES Modules, reducing coupling between components and enabling tree-shaking for smaller bundle sizes.",
        "status": "complete",
        "progress": 100,
        "diff": [
            {"type": "remove", "content": 'const Module = require("./types")'},
            {"type": "remove", "content": 'const { validate } = require("./utils")'},
            {"type": "add", "content": 'import { Module } from "./types"'},
            {"type": "add", "content": 'import { validate } from "./utils"'},
            {"type": "context", "content": ""},
            {"type": "context", "content": "export function processData(input: Module) {"},
            {"type": "remove", "content": "  const result = validate(input, false)"},
            {"type": "add", "content": "  const result = validate(input)"},
            {"type": "context", "content": "  return result"},
            {"type": "context", "content": "}"},
        ],
    },
]

terminal_messages = [
    {
        "role": "agent",
        "content": "I've completed the initial scan of the repository. What would you like me to focus on first?",
        "timestamp": "20:10",
    }
]


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "RepoRecon Backend",
        "status": "running",
        "version": "0.1.0",
    }


@app.get("/api/activity", response_model=list[ActivityItem])
async def get_activity():
    """Fetch recent repository activity."""
    try:
        activities = github.get_recent_activity(limit=10)
        return [ActivityItem(**activity) for activity in activities]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch activity: {str(e)}")


@app.get("/api/insights", response_model=list[InsightCard])
async def get_insights():
    """Fetch code analysis insights."""
    try:
        # Return insights from database
        # In a real app, this would generate insights based on recent commits
        insights = []
        for insight in insights_db:
            insights.append(
                InsightCard(
                    id=insight["id"],
                    title=insight["title"],
                    summary=insight["summary"],
                    status=insight["status"],
                    progress=insight["progress"],
                    diff=[DiffLine(**line) for line in insight["diff"]],
                )
            )
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch insights: {str(e)}")


@app.post("/api/terminal", response_model=TerminalResponse)
async def handle_terminal_message(request: TerminalRequest):
    """Handle terminal/agent message."""
    try:
        message = request.message.strip()

        if not message:
            raise HTTPException(status_code=400, detail="Empty message")

        # Simple agent responses based on keywords
        if "analyze" in message.lower():
            response = "Analyzing the repository structure and recent changes. Found 3 significant commits in the past week. Code quality metrics are stable."
        elif "activity" in message.lower() or "recent" in message.lower():
            response = "Recent activity shows 2 merged PRs, 5 new commits, and 1 open issue. All tests passing."
        elif "pr" in message.lower() or "pull" in message.lower():
            response = "Currently tracking 2 open pull requests. Both have passed code review and are ready for merge."
        elif "help" in message.lower() or "?" in message.lower():
            response = "I can help you analyze the repository. Try asking about: recent activity, pull requests, code quality, or specific files."
        else:
            response = f"Processing your request: '{message}'. Analysis in progress. Please check the Insights tab for detailed findings."

        # Add to message history
        from datetime import datetime
        timestamp = datetime.now().strftime("%H:%M")
        terminal_messages.append(
            {
                "role": "user",
                "content": message,
                "timestamp": timestamp,
            }
        )
        terminal_messages.append(
            {
                "role": "agent",
                "content": response,
                "timestamp": timestamp,
            }
        )

        return TerminalResponse(response=response, timestamp=timestamp)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terminal error: {str(e)}")


@app.post("/webhooks/github")
async def handle_github_webhook(payload: dict):
    """Handle GitHub webhook events from SMEE."""
    try:
        event_type = payload.get("type", "unknown")
        event = webhook_handler.process_webhook(event_type, payload)
        return JSONResponse({"status": "received", "event": event})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Webhook error: {str(e)}")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        repo_info = github.get_repo_info()
        return {
            "status": "healthy",
            "github_connected": bool(repo_info),
            "repo": os.getenv("GITHUB_REPO"),
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
