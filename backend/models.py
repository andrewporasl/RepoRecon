"""Pydantic models for API requests and responses."""

from pydantic import BaseModel
from typing import List, Literal
from datetime import datetime


class DiffLine(BaseModel):
    """Code diff line."""
    type: Literal["add", "remove", "context"]
    content: str


class ActivityItem(BaseModel):
    """Activity feed item."""
    author: str
    title: str
    timestamp: str
    type: str
    id: str


class InsightCard(BaseModel):
    """Code analysis insight card."""
    id: str
    title: str
    summary: str
    status: Literal["thinking", "complete"]
    progress: int
    diff: List[DiffLine]


class TerminalRequest(BaseModel):
    """Terminal/agent message request."""
    message: str


class TerminalResponse(BaseModel):
    """Terminal/agent message response."""
    response: str
    timestamp: str
