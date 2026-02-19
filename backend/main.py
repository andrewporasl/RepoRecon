"""FastAPI application for RepoRecon backend."""

from datetime import datetime
import hashlib
import hmac
import os
from pathlib import Path
import subprocess
from urllib.parse import urlparse

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import requests
from dotenv import load_dotenv, set_key

from .models import (
    ActivityItem,
    DiagnosticItem,
    InsightCard,
    DiffLine,
    RuntimeDiagnosticsResponse,
    RuntimeConfigResponse,
    RuntimeConfigUpdate,
    TerminalRequest,
    TerminalResponse,
)
from .github_client import GitHubClient
from .webhook_handler import WebhookHandler

PROJECT_ROOT = Path(__file__).resolve().parents[1]
ENV_LOCAL_FILE_PATH = PROJECT_ROOT / ".env.local"
ENV_FILE_PATH = PROJECT_ROOT / ".env"

# Single source of truth for local dev: .env.local (Convex-managed)
load_dotenv(dotenv_path=ENV_LOCAL_FILE_PATH)
load_dotenv(dotenv_path=ENV_FILE_PATH)


def _derive_convex_site_url(value: str) -> str:
    try:
        parsed = urlparse(value)
        if parsed.scheme in {"http", "https"} and parsed.netloc.endswith(".convex.cloud"):
            return f"{parsed.scheme}://{parsed.netloc.replace('.convex.cloud', '.convex.site')}"
    except Exception:
        pass
    return ""


def _load_runtime_config() -> dict[str, str | float]:
    next_public_convex_url = os.getenv("NEXT_PUBLIC_CONVEX_URL", "").strip()
    convex_site_url = (
        os.getenv("CONVEX_SITE_URL", "").strip()
        or os.getenv("NEXT_PUBLIC_CONVEX_SITE_URL", "").strip()
        or _derive_convex_site_url(next_public_convex_url)
    )
    return {
        "GITHUB_TOKEN": os.getenv("GITHUB_TOKEN", ""),
        "GITHUB_REPO": os.getenv("GITHUB_REPO", ""),
        "GITHUB_TIMEOUT_SEC": float(os.getenv("GITHUB_TIMEOUT_SEC", "10")),
        "GITHUB_WEBHOOK_SECRET": os.getenv("GITHUB_WEBHOOK_SECRET", ""),
        "SMEE_URL": os.getenv("SMEE_URL", ""),
        "ALLOWED_ORIGINS": os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost"),
        "CONVEX_DEPLOYMENT": os.getenv("CONVEX_DEPLOYMENT", ""),
        "CONVEX_SITE_URL": convex_site_url,
        "NEXT_PUBLIC_CONVEX_URL": next_public_convex_url,
        "SITE_URL": os.getenv("SITE_URL", "http://localhost:3000").rstrip("/"),
        "AUTH_GITHUB_ID": os.getenv("AUTH_GITHUB_ID", ""),
        "AUTH_GITHUB_SECRET": os.getenv("AUTH_GITHUB_SECRET", ""),
        "AI_PROVIDER": os.getenv("AI_PROVIDER", "auto").strip().lower(),
        "OLLAMA_HOST": os.getenv("OLLAMA_HOST", "http://localhost:11434").rstrip("/"),
        "OLLAMA_MODEL": os.getenv("OLLAMA_MODEL", "llama3"),
        "LLM_API_BASE_URL": os.getenv("LLM_API_BASE_URL", "https://api.openai.com/v1").rstrip("/"),
        "LLM_API_MODEL": os.getenv("LLM_API_MODEL", "gpt-4o-mini"),
        "LLM_API_KEY": os.getenv("LLM_API_KEY", ""),
        "LLM_API_TIMEOUT_SEC": float(os.getenv("LLM_API_TIMEOUT_SEC", "20")),
    }


RUNTIME_CONFIG = _load_runtime_config()

app = FastAPI(
    title="RepoRecon Backend",
    description="GitHub repository analysis and monitoring service",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in str(RUNTIME_CONFIG["ALLOWED_ORIGINS"]).split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-GitHub-Event", "X-Hub-Signature-256"],
)

webhook_handler = WebhookHandler()

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

SYSTEM_PROMPT = (
    "You are 'Strategist', an advanced repository analysis AI for the RepoRecon system. "
    "Your persona is technical, concise, and tactical. You speak like a senior engineer or ops commander. "
    "You analyze code, architecture, and git history. "
    "Current context: The user is asking about the 'andrewporasl/RepoRecon' repository. "
    "Do not hallucinate files if you don't know them, but you can infer standard project structures. "
    "Keep responses short and high-density. Avoid fluff."
)


def _github_client() -> GitHubClient:
    return GitHubClient(
        token=str(RUNTIME_CONFIG["GITHUB_TOKEN"]),
        repo=str(RUNTIME_CONFIG["GITHUB_REPO"]),
        timeout_sec=float(RUNTIME_CONFIG["GITHUB_TIMEOUT_SEC"]),
    )


def _ensure_local_request(request: Request) -> None:
    client_host = request.client.host if request.client else ""
    allowed_hosts = {"127.0.0.1", "::1", "localhost", "::ffff:127.0.0.1"}
    if client_host not in allowed_hosts:
        raise HTTPException(status_code=403, detail="Config updates are allowed from localhost only")


def _persist_runtime_config(updates: dict[str, str | float]) -> None:
    if not ENV_LOCAL_FILE_PATH.exists():
        ENV_LOCAL_FILE_PATH.touch(mode=0o600)

    for key, value in updates.items():
        set_key(str(ENV_LOCAL_FILE_PATH), key, str(value))


def _is_absolute_http_url(value: str) -> bool:
    try:
        parsed = urlparse(value)
        return parsed.scheme in {"http", "https"} and bool(parsed.netloc)
    except Exception:
        return False


def _config_response() -> RuntimeConfigResponse:
    return RuntimeConfigResponse(
        github_repo=str(RUNTIME_CONFIG["GITHUB_REPO"]),
        github_timeout_sec=float(RUNTIME_CONFIG["GITHUB_TIMEOUT_SEC"]),
        smee_url=str(RUNTIME_CONFIG["SMEE_URL"]),
        allowed_origins=str(RUNTIME_CONFIG["ALLOWED_ORIGINS"]),
        convex_deployment=str(RUNTIME_CONFIG["CONVEX_DEPLOYMENT"]),
        convex_site_url=str(RUNTIME_CONFIG["CONVEX_SITE_URL"]),
        next_public_convex_url=str(RUNTIME_CONFIG["NEXT_PUBLIC_CONVEX_URL"]),
        site_url=str(RUNTIME_CONFIG["SITE_URL"]),
        ai_provider=str(RUNTIME_CONFIG["AI_PROVIDER"]),
        ollama_host=str(RUNTIME_CONFIG["OLLAMA_HOST"]),
        ollama_model=str(RUNTIME_CONFIG["OLLAMA_MODEL"]),
        llm_api_base_url=str(RUNTIME_CONFIG["LLM_API_BASE_URL"]),
        llm_api_model=str(RUNTIME_CONFIG["LLM_API_MODEL"]),
        llm_api_timeout_sec=float(RUNTIME_CONFIG["LLM_API_TIMEOUT_SEC"]),
        github_token_configured=bool(str(RUNTIME_CONFIG["GITHUB_TOKEN"]).strip()),
        github_webhook_secret_configured=bool(str(RUNTIME_CONFIG["GITHUB_WEBHOOK_SECRET"]).strip()),
        llm_api_key_configured=bool(str(RUNTIME_CONFIG["LLM_API_KEY"]).strip()),
        auth_github_id_configured=bool(str(RUNTIME_CONFIG["AUTH_GITHUB_ID"]).strip()),
        auth_github_secret_configured=bool(str(RUNTIME_CONFIG["AUTH_GITHUB_SECRET"]).strip()),
    )


def _sync_convex_auth_env() -> tuple[list[str], str]:
    deployment = str(RUNTIME_CONFIG["CONVEX_DEPLOYMENT"]).strip()
    if not deployment:
        return [], "CONVEX_DEPLOYMENT is not set. Skipping Convex env sync."

    to_sync = {
        "AUTH_GITHUB_ID": str(RUNTIME_CONFIG["AUTH_GITHUB_ID"]).strip(),
        "AUTH_GITHUB_SECRET": str(RUNTIME_CONFIG["AUTH_GITHUB_SECRET"]).strip(),
        "SITE_URL": str(RUNTIME_CONFIG["SITE_URL"]).strip(),
    }
    keys_to_update = [key for key, value in to_sync.items() if value]
    if not keys_to_update:
        return [], "No OAuth values to sync."

    for key in keys_to_update:
        result = subprocess.run(
            ["npx", "convex", "env", "set", key, to_sync[key]],
            cwd=PROJECT_ROOT,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=45,
            check=False,
        )
        if result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to sync {key} to Convex env. Ensure Convex CLI is logged in for this project.",
            )

    return keys_to_update, "Synced OAuth values to Convex deployment."


def _convex_env_key_set() -> set[str]:
    deployment = str(RUNTIME_CONFIG["CONVEX_DEPLOYMENT"]).strip()
    if not deployment:
        return set()
    result = subprocess.run(
        ["npx", "convex", "env", "list"],
        cwd=PROJECT_ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        timeout=20,
        check=False,
    )
    if result.returncode != 0:
        return set()

    keys: set[str] = set()
    for line in result.stdout.splitlines():
        if "=" not in line:
            continue
        key = line.split("=", 1)[0].strip()
        if key:
            keys.add(key)
    return keys


def _diagnostics() -> RuntimeDiagnosticsResponse:
    checks: list[DiagnosticItem] = []

    has_repo = bool(str(RUNTIME_CONFIG["GITHUB_REPO"]).strip())
    checks.append(
        DiagnosticItem(
            key="github_repo",
            status="ok" if has_repo else "error",
            message="GitHub repo configured." if has_repo else "Set GITHUB_REPO (owner/repo).",
        )
    )

    has_github_token = bool(str(RUNTIME_CONFIG["GITHUB_TOKEN"]).strip())
    checks.append(
        DiagnosticItem(
            key="github_token",
            status="ok" if has_github_token else "warning",
            message="GitHub token configured." if has_github_token else "Set GITHUB_TOKEN for backend GitHub API access.",
        )
    )

    provider = str(RUNTIME_CONFIG["AI_PROVIDER"]).strip().lower()
    has_api = bool(str(RUNTIME_CONFIG["LLM_API_KEY"]).strip())
    has_ollama = bool(str(RUNTIME_CONFIG["OLLAMA_HOST"]).strip())
    ai_ready = (
        provider == "mock"
        or (provider in {"auto", "ollama"} and has_ollama)
        or (provider in {"auto", "api"} and has_api)
    )
    checks.append(
        DiagnosticItem(
            key="ai_provider",
            status="ok" if ai_ready else "warning",
            message="AI provider appears configured." if ai_ready else "Configure Ollama host and/or LLM API key.",
        )
    )

    convex_url = bool(str(RUNTIME_CONFIG["NEXT_PUBLIC_CONVEX_URL"]).strip())
    checks.append(
        DiagnosticItem(
            key="next_public_convex_url",
            status="ok" if convex_url else "error",
            message="NEXT_PUBLIC_CONVEX_URL configured." if convex_url else "Set NEXT_PUBLIC_CONVEX_URL for frontend auth/client.",
        )
    )

    convex_site_url = bool(str(RUNTIME_CONFIG["CONVEX_SITE_URL"]).strip())
    checks.append(
        DiagnosticItem(
            key="convex_site_url",
            status="ok" if convex_site_url else "error",
            message="CONVEX_SITE_URL configured." if convex_site_url else "Set CONVEX_SITE_URL for Convex Auth OAuth routes.",
        )
    )

    site_url = str(RUNTIME_CONFIG["SITE_URL"]).strip()
    checks.append(
        DiagnosticItem(
            key="site_url",
            status="ok" if _is_absolute_http_url(site_url) else "error",
            message="SITE_URL configured for OAuth redirect target."
            if _is_absolute_http_url(site_url)
            else "Set SITE_URL to your app origin (for local dev usually http://localhost:3000).",
        )
    )

    local_auth_id = bool(str(RUNTIME_CONFIG["AUTH_GITHUB_ID"]).strip())
    local_auth_secret = bool(str(RUNTIME_CONFIG["AUTH_GITHUB_SECRET"]).strip())
    convex_env_keys = _convex_env_key_set()
    convex_auth_id = "AUTH_GITHUB_ID" in convex_env_keys
    convex_auth_secret = "AUTH_GITHUB_SECRET" in convex_env_keys
    oauth_ready = (local_auth_id and local_auth_secret) or (convex_auth_id and convex_auth_secret)
    checks.append(
        DiagnosticItem(
            key="github_oauth",
            status="ok" if oauth_ready else "error",
            message=(
                "GitHub OAuth credentials configured."
                if oauth_ready
                else "Set AUTH_GITHUB_ID and AUTH_GITHUB_SECRET for sign-in (locally or in Convex env)."
            ),
        )
    )

    ready = all(check.status != "error" for check in checks)
    return RuntimeDiagnosticsResponse(ready=ready, checks=checks)


def _terminal_fallback(user_message: str, reason: str) -> tuple[str, str]:
    response = (
        f"AI provider unavailable ({reason}).\n\n"
        "Configure either local Ollama or an API key-based provider."
    )
    if "status" in user_message.lower():
        response += "\n\nSystem Status: Online. Github: Connected."
    else:
        response += "\n\nI can only answer basic status prompts until a model provider is configured."
    return response, "fallback"


def _chat_with_ollama(user_message: str) -> str:
    response = requests.post(
        f"{RUNTIME_CONFIG['OLLAMA_HOST']}/api/chat",
        json={
            "model": RUNTIME_CONFIG["OLLAMA_MODEL"],
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            "stream": False,
        },
        timeout=float(RUNTIME_CONFIG["LLM_API_TIMEOUT_SEC"]),
    )
    response.raise_for_status()
    data = response.json()
    message = data.get("message", {}).get("content")
    if not message:
        raise ValueError("No content returned from Ollama")
    return message


def _chat_with_api(user_message: str) -> str:
    api_key = str(RUNTIME_CONFIG["LLM_API_KEY"]).strip().strip("'\"")
    if not api_key:
        raise ValueError("LLM_API_KEY is not configured")

    base_url = str(RUNTIME_CONFIG["LLM_API_BASE_URL"]).strip().strip("'\"").rstrip("/")
    model = str(RUNTIME_CONFIG["LLM_API_MODEL"]).strip().strip("'\"")

    response = requests.post(
        f"{base_url}/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            "temperature": 0.2,
        },
        timeout=float(RUNTIME_CONFIG["LLM_API_TIMEOUT_SEC"]),
    )
    response.raise_for_status()
    data = response.json()
    message = data.get("choices", [{}])[0].get("message", {}).get("content")
    if not message:
        raise ValueError("No content returned from API model")
    return message


def _chat_with_mock(user_message: str) -> str:
    snippet = user_message.strip().replace("\n", " ")[:180]
    return (
        "Mock provider response (no external model call).\n\n"
        f"Received: {snippet}\n\n"
        "This confirms terminal -> backend -> provider routing is working."
    )


def _resolve_provider(requested_provider: str) -> str:
    if requested_provider != "auto":
        return requested_provider
    provider = str(RUNTIME_CONFIG["AI_PROVIDER"])
    if provider in {"ollama", "api", "mock"}:
        return provider
    return "auto"


def _generate_terminal_response(user_message: str, requested_provider: str) -> tuple[str, str]:
    provider = _resolve_provider(requested_provider)

    if provider == "ollama":
        return _chat_with_ollama(user_message), "ollama"
    if provider == "api":
        return _chat_with_api(user_message), "api"
    if provider == "mock":
        return _chat_with_mock(user_message), "mock"

    try:
        return _chat_with_ollama(user_message), "ollama"
    except Exception:
        if str(RUNTIME_CONFIG["LLM_API_KEY"]):
            try:
                return _chat_with_api(user_message), "api"
            except requests.HTTPError as e:
                status_code = e.response.status_code if e.response is not None else 0
                if status_code == 401:
                    return _terminal_fallback(user_message, "Ollama unreachable and API key rejected (401)")
                if status_code == 429:
                    return _terminal_fallback(user_message, "Ollama unreachable and API rate limited (429)")
                return _terminal_fallback(user_message, f"Ollama unreachable and API failed ({status_code or 'unknown'})")
            except requests.Timeout:
                return _terminal_fallback(user_message, "Ollama unreachable and API timed out")
            except requests.RequestException:
                return _terminal_fallback(user_message, "Ollama unreachable and API provider unreachable")
            except Exception:
                return _terminal_fallback(user_message, "both Ollama and API provider failed")
        return _terminal_fallback(user_message, "Ollama unreachable and LLM_API_KEY missing")


def _verify_github_signature(raw_body: bytes, signature_header: str | None) -> bool:
    webhook_secret = str(RUNTIME_CONFIG["GITHUB_WEBHOOK_SECRET"])
    if not webhook_secret:
        return True
    if not signature_header or not signature_header.startswith("sha256="):
        return False
    digest = hmac.new(
        webhook_secret.encode("utf-8"),
        msg=raw_body,
        digestmod=hashlib.sha256,
    ).hexdigest()
    expected = f"sha256={digest}"
    return hmac.compare_digest(expected, signature_header)


@app.get("/")
async def root():
    return {
        "message": "RepoRecon Backend",
        "status": "running",
        "version": "0.1.0",
    }


@app.get("/api/config", response_model=RuntimeConfigResponse)
async def get_runtime_config(request: Request):
    _ensure_local_request(request)
    return _config_response()


@app.post("/api/config", response_model=RuntimeConfigResponse)
async def update_runtime_config(request: Request, payload: RuntimeConfigUpdate):
    _ensure_local_request(request)

    updates: dict[str, str | float] = {}
    if payload.github_token is not None:
        value = payload.github_token.strip()
        if value:
            updates["GITHUB_TOKEN"] = value
    if payload.github_repo is not None:
        value = payload.github_repo.strip()
        if value:
            updates["GITHUB_REPO"] = value
    if payload.github_timeout_sec is not None:
        updates["GITHUB_TIMEOUT_SEC"] = max(1.0, min(60.0, payload.github_timeout_sec))
    if payload.github_webhook_secret is not None:
        value = payload.github_webhook_secret.strip()
        if value:
            updates["GITHUB_WEBHOOK_SECRET"] = value
    if payload.smee_url is not None:
        value = payload.smee_url.strip()
        if value:
            updates["SMEE_URL"] = value
    if payload.allowed_origins is not None:
        value = payload.allowed_origins.strip()
        if value:
            updates["ALLOWED_ORIGINS"] = value
    if payload.convex_deployment is not None:
        value = payload.convex_deployment.strip()
        if value:
            updates["CONVEX_DEPLOYMENT"] = value
    if payload.convex_site_url is not None:
        value = payload.convex_site_url.strip()
        if value:
            if not _is_absolute_http_url(value):
                raise HTTPException(status_code=400, detail="CONVEX_SITE_URL must be an absolute http(s) URL")
            updates["CONVEX_SITE_URL"] = value
    if payload.next_public_convex_url is not None:
        value = payload.next_public_convex_url.strip()
        if value:
            if not _is_absolute_http_url(value):
                raise HTTPException(status_code=400, detail="NEXT_PUBLIC_CONVEX_URL must be an absolute http(s) URL")
            updates["NEXT_PUBLIC_CONVEX_URL"] = value
            if not str(RUNTIME_CONFIG.get("CONVEX_SITE_URL", "")).strip() and payload.convex_site_url is None:
                derived_site = _derive_convex_site_url(value)
                if derived_site:
                    updates["CONVEX_SITE_URL"] = derived_site
    if payload.site_url is not None:
        value = payload.site_url.strip().rstrip("/")
        if value:
            if not _is_absolute_http_url(value):
                raise HTTPException(status_code=400, detail="SITE_URL must be an absolute http(s) URL")
            updates["SITE_URL"] = value
    if payload.auth_github_id is not None:
        value = payload.auth_github_id.strip()
        if value:
            updates["AUTH_GITHUB_ID"] = value
    if payload.auth_github_secret is not None:
        value = payload.auth_github_secret.strip()
        if value:
            updates["AUTH_GITHUB_SECRET"] = value
    if payload.ai_provider is not None:
        updates["AI_PROVIDER"] = payload.ai_provider.strip().lower()
    if payload.ollama_host is not None:
        value = payload.ollama_host.strip().rstrip("/")
        if value:
            updates["OLLAMA_HOST"] = value
    if payload.ollama_model is not None:
        value = payload.ollama_model.strip()
        if value:
            updates["OLLAMA_MODEL"] = value
    if payload.llm_api_base_url is not None:
        value = payload.llm_api_base_url.strip().rstrip("/")
        if value and not _is_absolute_http_url(value):
            raise HTTPException(status_code=400, detail="LLM_API_BASE_URL must be an absolute http(s) URL")
        if value:
            updates["LLM_API_BASE_URL"] = value
    if payload.llm_api_model is not None:
        value = payload.llm_api_model.strip()
        if value:
            updates["LLM_API_MODEL"] = value
    if payload.llm_api_key is not None:
        value = payload.llm_api_key.strip()
        if value:
            updates["LLM_API_KEY"] = value
    if payload.llm_api_timeout_sec is not None:
        updates["LLM_API_TIMEOUT_SEC"] = max(1.0, min(120.0, payload.llm_api_timeout_sec))

    RUNTIME_CONFIG.update(updates)

    if payload.persist:
        _persist_runtime_config(updates)

    return _config_response()


@app.post("/api/config/sync-convex-auth")
async def sync_convex_auth_config(request: Request):
    _ensure_local_request(request)
    keys, message = _sync_convex_auth_env()
    return {"ok": True, "updated_keys": keys, "message": message}


@app.get("/api/config/diagnostics", response_model=RuntimeDiagnosticsResponse)
async def get_runtime_diagnostics(request: Request):
    _ensure_local_request(request)
    return _diagnostics()


@app.get("/api/activity", response_model=list[ActivityItem])
async def get_activity():
    try:
        activities = _github_client().get_recent_activity(limit=10)
        return [ActivityItem(**activity) for activity in activities]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch activity: {str(e)}")


@app.get("/api/insights", response_model=list[InsightCard])
async def get_insights():
    try:
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
    try:
        user_message = request.message.strip()
        if not user_message:
            raise HTTPException(status_code=400, detail="Empty message")

        ai_content, provider_used = _generate_terminal_response(user_message, request.provider)

        timestamp = datetime.now().strftime("%H:%M")
        terminal_messages.append({"role": "user", "content": user_message, "timestamp": timestamp})
        terminal_messages.append({"role": "agent", "content": ai_content, "timestamp": timestamp})

        return TerminalResponse(response=ai_content, timestamp=timestamp, provider_used=provider_used)

    except HTTPException:
        raise
    except requests.HTTPError as e:
        status_code = e.response.status_code if e.response is not None else 502
        error_code = ""
        error_message = ""
        if e.response is not None:
            try:
                error = (e.response.json() or {}).get("error", {})
                error_code = str(error.get("code", "")).strip().lower()
                error_message = str(error.get("message", "")).strip()
            except Exception:
                pass
        if status_code == 401:
            detail = "Model API rejected credentials (401). Check LLM_API_KEY."
        elif status_code == 429:
            if error_code == "insufficient_quota":
                detail = "Model API quota exceeded (429 insufficient_quota). Check billing/quota for LLM_API_KEY."
            else:
                detail = "Model API rate limit reached (429). Retry shortly."
        else:
            detail = f"Model API request failed ({status_code})."
        if error_message and status_code in {401, 429}:
            detail = f"{detail} {error_message}"
        raise HTTPException(status_code=502, detail=detail)
    except requests.Timeout:
        raise HTTPException(status_code=504, detail="Model provider timed out")
    except requests.RequestException:
        raise HTTPException(status_code=502, detail="Model provider is unreachable")
    except Exception:
        raise HTTPException(status_code=500, detail="Terminal processing failed")


@app.post("/webhooks/github")
async def handle_github_webhook(request: Request):
    try:
        raw_body = await request.body()
        signature = request.headers.get("X-Hub-Signature-256")
        if not _verify_github_signature(raw_body, signature):
            raise HTTPException(status_code=401, detail="Invalid webhook signature")

        payload = await request.json()
        event_type = request.headers.get("X-GitHub-Event", payload.get("type", "unknown"))
        event = webhook_handler.process_webhook(event_type, payload)
        return JSONResponse({"status": "received", "event": event})
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Webhook error")


@app.get("/health")
async def health_check():
    try:
        repo_info = _github_client().get_repo_info()
        return {
            "status": "healthy",
            "github_connected": bool(repo_info),
            "repo": str(RUNTIME_CONFIG["GITHUB_REPO"]),
            "ai_provider_default": str(RUNTIME_CONFIG["AI_PROVIDER"]),
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
