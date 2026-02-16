"""GitHub webhook event handler for SMEE forwarding."""

import json
from typing import Dict, Any
from datetime import datetime


class WebhookHandler:
    """Processes GitHub webhook events from SMEE."""

    def __init__(self):
        self.events = []

    def handle_push(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Handle push event."""
        return {
            "type": "push",
            "repo": payload.get("repository", {}).get("name"),
            "branch": payload.get("ref"),
            "pusher": payload.get("pusher", {}).get("name"),
            "commits": len(payload.get("commits", [])),
            "timestamp": datetime.now().isoformat(),
        }

    def handle_pull_request(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Handle pull request event."""
        pr = payload.get("pull_request", {})
        return {
            "type": "pull_request",
            "action": payload.get("action"),
            "number": pr.get("number"),
            "title": pr.get("title"),
            "author": pr.get("user", {}).get("login"),
            "timestamp": datetime.now().isoformat(),
        }

    def handle_issues(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Handle issues event."""
        issue = payload.get("issue", {})
        return {
            "type": "issue",
            "action": payload.get("action"),
            "number": issue.get("number"),
            "title": issue.get("title"),
            "author": issue.get("user", {}).get("login"),
            "timestamp": datetime.now().isoformat(),
        }

    def process_webhook(self, event_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Process incoming webhook event."""
        if event_type == "push":
            event = self.handle_push(payload)
        elif event_type == "pull_request":
            event = self.handle_pull_request(payload)
        elif event_type == "issues":
            event = self.handle_issues(payload)
        else:
            event = {"type": event_type, "timestamp": datetime.now().isoformat()}

        self.events.append(event)
        return event

    def get_recent_events(self, limit: int = 10) -> list:
        """Get recent webhook events."""
        return self.events[-limit:]
