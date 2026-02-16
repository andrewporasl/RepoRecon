# Backend Setup & Integration Guide

This document details the FastAPI backend setup for RepoRecon, including GitHub API integration, SMEE webhook forwarding, and frontend integration instructions.

## Overview

The backend provides three main API endpoints:
- `GET /api/activity` — Fetch recent activity (PRs, commits, issues)
- `GET /api/insights` — Fetch code analysis insights
- `POST /api/terminal` — Handle terminal/agent interactions

## Prerequisites

- Python 3.10+
- GitHub Personal Access Token (PAT)
- SMEE.io account (for webhook forwarding)
- `pip` package manager

## 1. GitHub Setup

### Create a Personal Access Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Name it: `RepoRecon`
4. Select scopes:
   - `repo` (full control of private repositories)
   - `read:user` (read user profile data)
5. Copy the token and save it safely

### Repository Details

- **Repository**: `andrewporasl/RepoRecon`
- **Tracking**: Pull requests, commits, issues, and code changes

## 2. SMEE Webhook Forwarding Setup

### Create a SMEE Channel

1. Go to [smee.io](https://smee.io)
2. Click "Start a new channel"
3. Copy your unique SMEE URL (e.g., `https://smee.io/abc123xyz`)
4. Keep this URL for later

### Configure GitHub Webhooks

1. Go to `https://github.com/andrewporasl/RepoRecon/settings/hooks`
2. Click "Add webhook"
3. **Payload URL**: Your SMEE URL
4. **Content type**: `application/json`
5. **Events**: Select:
   - Push events
   - Pull request events
   - Issues events
6. Click "Add webhook"

### Start SMEE Client Locally

```bash
npm install -g smee-client
smee -u https://smee.io/your-channel-url -t http://localhost:8000/webhooks/github
```

Replace `your-channel-url` with your actual SMEE URL.

## 3. FastAPI Backend Setup

### Installation

```bash
# Navigate to project root
cd /Users/andrewdover/Documents/RepoRecon

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn pydantic python-dotenv requests
```

### Environment Configuration

Create a `.env` file in the project root:

```env
GITHUB_TOKEN=your_personal_access_token_here
GITHUB_REPO=andrewporasl/RepoRecon
SMEE_URL=https://smee.io/your-channel-url
```

**Never commit `.env` to git.** Add it to `.gitignore`:

```bash
echo ".env" >> .gitignore
echo "venv/" >> .gitignore
```

### Run the Backend

```bash
# From project root with venv activated
python3 -m uvicorn backend.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

---

## 4. API Endpoints

### GET `/api/activity`

Fetches recent repository activity (PRs, commits, issues).

**Response:**
```json
[
  {
    "author": "username",
    "title": "Merged: Feature implementation",
    "timestamp": "2h ago",
    "type": "pull_request",
    "id": "pr-123"
  },
  ...
]
```

### GET `/api/insights`

Fetches code analysis insights (from GitHub API analysis or stored data).

**Response:**
```json
[
  {
    "id": "insight-001",
    "title": "Code Quality Analysis",
    "summary": "Analysis of recent commits...",
    "status": "complete",
    "progress": 100,
    "diff": [
      {"type": "add", "content": "import { module }"},
      {"type": "remove", "content": "const module = require(...)"}
    ]
  },
  ...
]
```

### POST `/api/terminal`

Handles terminal/agent interactions. Send messages to the Strategist agent.

**Request:**
```json
{
  "message": "Analyze the recent pull requests"
}
```

**Response:**
```json
{
  "response": "Agent response here...",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 5. Frontend Integration

### Feature A: Activity Feed

Update `src/app/activity/page.tsx` to fetch from the backend:

```typescript
"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  author: string;
  title: string;
  timestamp: string;
  type: string;
  id: string;
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activity")
      .then((res) => res.json())
      .then((data) => {
        setActivities(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch activities:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
          Activity Feed
        </h1>
        <p className="text-zinc-400 mt-2">
          Monitor system activities and pull requests in real-time.
        </p>
      </header>

      <div className="flex flex-col gap-1">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="group flex items-center justify-between p-4 rounded-lg transition-colors hover:bg-zinc-900/50 border border-transparent hover:border-zinc-800"
          >
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                AUTHOR: @{activity.author}
              </span>
              <span className="text-zinc-100">{activity.title}</span>
            </div>
            <span className="text-xs text-zinc-500">{activity.timestamp}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Feature C: Terminal

Update `src/app/terminal/page.tsx` to send messages to the backend:

```typescript
"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "agent";
  content: string;
  timestamp: string;
}

export default function TerminalPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      content: "I've completed the initial scan of the repository. What would you like me to focus on first?",
      timestamp: "20:10",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.KeyboardEvent) => {
    if (e.key !== "Enter" || !input.trim()) return;

    e.preventDefault();
    const userMessage = input;
    setInput("");
    setLoading(true);

    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    try {
      const response = await fetch("/api/terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      // Add agent response
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: data.response,
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: "Error communicating with the agent.",
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
          Terminal
        </h1>
        <p className="text-zinc-400 mt-2">Interact with the strategist agent.</p>
      </header>

      <div className="flex-1 overflow-y-auto space-y-6 pr-4">
        {messages.map((msg, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-zinc-100">
                {msg.role === "user" ? "You" : "Strategist"}
              </span>
              <span className="text-[10px] text-zinc-500">{msg.timestamp}</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">{msg.content}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-auto pt-8">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleSubmit}
            placeholder="Type a command or ask a question..."
            disabled={loading}
            className="w-full bg-transparent border-none outline-none text-zinc-100 placeholder:text-zinc-600 py-4 disabled:opacity-50"
          />
          <div className="absolute right-0 bottom-4 text-zinc-600 text-xs">
            {loading ? "..." : "Enter ↵"}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Feature B: Agent Insights (Already Implemented)

Feature B is already fully implemented and doesn't require backend integration changes. The mock data structure matches the API response format.

---

## 6. Backend Project Structure

```
/Users/andrewdover/Documents/RepoRecon/
├── backend/
│   ├── __init__.py
│   ├── main.py              # FastAPI app and routes
│   ├── github_client.py      # GitHub API client
│   ├── webhook_handler.py    # SMEE webhook handler
│   └── models.py             # Pydantic models
├── .env                      # Environment variables (not in git)
├── venv/                     # Python virtual environment
└── requirements.txt          # Python dependencies
```

---

## 7. Running Everything Together

### Terminal 1: SMEE Forwarding
```bash
smee -u https://smee.io/your-channel-url -t http://localhost:8000/webhooks/github
```

### Terminal 2: FastAPI Backend
```bash
cd /Users/andrewdover/Documents/RepoRecon
source venv/bin/activate
python3 -m uvicorn backend.main:app --reload --port 8000
```

### Terminal 3: Next.js Frontend
```bash
cd /Users/andrewdover/Documents/RepoRecon
npm run dev
```

Then visit `http://localhost:3000`

---

## 8. Troubleshooting

- **401 GitHub API errors**: Check your `GITHUB_TOKEN` in `.env`
- **SMEE not forwarding**: Ensure the webhook target URL matches your backend port
- **CORS errors**: Add CORS middleware to FastAPI (see backend setup)
- **Activity Feed empty**: Check GitHub API limits (60 requests/hour for unauthenticated, 5000/hour with token)

---

## Next Steps

1. Create the FastAPI backend files (see Backend.md)
2. Set up GitHub PAT and SMEE
3. Update Feature A and C with integration code above
4. Test the full pipeline

