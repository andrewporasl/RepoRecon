"""Pydantic models for API requests and responses."""

from pydantic import BaseModel, Field
from typing import List, Literal


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
    message: str = Field(min_length=1, max_length=4000)
    provider: Literal["auto", "ollama", "api", "mock"] = "auto"


class TerminalResponse(BaseModel):
    """Terminal/agent message response."""
    response: str
    timestamp: str
    provider_used: Literal["ollama", "api", "mock", "fallback"]


class RuntimeConfigUpdate(BaseModel):
    """Runtime and persisted backend configuration update."""
    github_token: str | None = None
    github_repo: str | None = None
    github_timeout_sec: float | None = None
    github_webhook_secret: str | None = None
    smee_url: str | None = None
    allowed_origins: str | None = None
    convex_deployment: str | None = None
    convex_site_url: str | None = None
    next_public_convex_url: str | None = None
    site_url: str | None = None
    auth_github_id: str | None = None
    auth_github_secret: str | None = None
    ai_provider: Literal["auto", "ollama", "api", "mock"] | None = None
    ollama_host: str | None = None
    ollama_model: str | None = None
    llm_api_base_url: str | None = None
    llm_api_model: str | None = None
    llm_api_key: str | None = None
    llm_api_timeout_sec: float | None = None
    persist: bool = True


class RuntimeConfigResponse(BaseModel):
    """Current backend configuration (secrets never returned raw)."""
    github_repo: str
    github_timeout_sec: float
    smee_url: str
    allowed_origins: str
    convex_deployment: str
    convex_site_url: str
    next_public_convex_url: str
    site_url: str
    ai_provider: Literal["auto", "ollama", "api", "mock"]
    ollama_host: str
    ollama_model: str
    llm_api_base_url: str
    llm_api_model: str
    llm_api_timeout_sec: float
    github_token_configured: bool
    github_webhook_secret_configured: bool
    llm_api_key_configured: bool
    auth_github_id_configured: bool
    auth_github_secret_configured: bool


class DiagnosticItem(BaseModel):
    key: str
    status: Literal["ok", "warning", "error"]
    message: str


class RuntimeDiagnosticsResponse(BaseModel):
    ready: bool
    checks: list[DiagnosticItem]
