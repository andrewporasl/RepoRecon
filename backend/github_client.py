"""GitHub API client for fetching repository data."""

import os
import requests
from typing import List, Dict, Any
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_REPO = os.getenv("GITHUB_REPO", "andrewporasl/RepoRecon")


class GitHubClient:
    """Client for interacting with GitHub API."""

    BASE_URL = "https://api.github.com"

    def __init__(self, token: str = GITHUB_TOKEN, repo: str = GITHUB_REPO):
        self.token = token
        self.repo = repo
        self.headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json",
        }

    def get_recent_activity(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Fetch recent pulls, commits, and issues."""
        activities = []

        # Fetch recent pull requests
        try:
            prs_url = f"{self.BASE_URL}/repos/{self.repo}/pulls"
            params = {"state": "all", "sort": "updated", "direction": "desc", "per_page": 5}
            response = requests.get(prs_url, headers=self.headers, params=params)
            response.raise_for_status()

            for pr in response.json():
                activities.append({
                    "author": pr["user"]["login"],
                    "title": f"{'Merged' if pr['merged_at'] else 'Opened'}: {pr['title']}",
                    "timestamp": self._time_ago(pr["updated_at"]),
                    "type": "pull_request",
                    "id": f"pr-{pr['number']}",
                })
        except Exception as e:
            print(f"Error fetching PRs: {e}")

        # Fetch recent commits
        try:
            commits_url = f"{self.BASE_URL}/repos/{self.repo}/commits"
            params = {"per_page": 5}
            response = requests.get(commits_url, headers=self.headers, params=params)
            response.raise_for_status()

            for commit in response.json():
                message = commit["commit"]["message"].split("\n")[0]
                activities.append({
                    "author": commit["commit"]["author"]["name"],
                    "title": f"Commit: {message}",
                    "timestamp": self._time_ago(commit["commit"]["author"]["date"]),
                    "type": "commit",
                    "id": f"commit-{commit['sha'][:7]}",
                })
        except Exception as e:
            print(f"Error fetching commits: {e}")

        # Fetch recent issues
        try:
            issues_url = f"{self.BASE_URL}/repos/{self.repo}/issues"
            params = {"state": "all", "sort": "updated", "direction": "desc", "per_page": 3}
            response = requests.get(issues_url, headers=self.headers, params=params)
            response.raise_for_status()

            for issue in response.json():
                if "pull_request" not in issue:  # Skip PRs (already fetched)
                    activities.append({
                        "author": issue["user"]["login"],
                        "title": f"Issue: {issue['title']}",
                        "timestamp": self._time_ago(issue["updated_at"]),
                        "type": "issue",
                        "id": f"issue-{issue['number']}",
                    })
        except Exception as e:
            print(f"Error fetching issues: {e}")

        # Sort by most recent and return
        return sorted(activities, key=lambda x: x["timestamp"], reverse=True)[:limit]

    def get_repo_info(self) -> Dict[str, Any]:
        """Fetch repository metadata."""
        try:
            url = f"{self.BASE_URL}/repos/{self.repo}"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching repo info: {e}")
            return {}

    @staticmethod
    def _time_ago(iso_timestamp: str) -> str:
        """Convert ISO timestamp to relative time."""
        try:
            dt = datetime.fromisoformat(iso_timestamp.replace("Z", "+00:00"))
            now = datetime.now(dt.tzinfo)
            delta = now - dt

            seconds = delta.total_seconds()
            if seconds < 60:
                return "just now"
            elif seconds < 3600:
                minutes = int(seconds / 60)
                return f"{minutes}m ago"
            elif seconds < 86400:
                hours = int(seconds / 3600)
                return f"{hours}h ago"
            elif seconds < 604800:
                days = int(seconds / 86400)
                return f"{days}d ago"
            else:
                weeks = int(seconds / 604800)
                return f"{weeks}w ago"
        except Exception:
            return "recently"
