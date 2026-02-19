"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type ConfigResponse = {
  github_repo: string;
  github_timeout_sec: number;
  smee_url: string;
  allowed_origins: string;
  convex_deployment: string;
  convex_site_url: string;
  next_public_convex_url: string;
  site_url: string;
  ai_provider: "auto" | "ollama" | "api" | "mock";
  ollama_host: string;
  ollama_model: string;
  llm_api_base_url: string;
  llm_api_model: string;
  llm_api_timeout_sec: number;
  github_token_configured: boolean;
  github_webhook_secret_configured: boolean;
  llm_api_key_configured: boolean;
  auth_github_id_configured: boolean;
  auth_github_secret_configured: boolean;
};

type DiagnosticsResponse = {
  ready: boolean;
  checks: Array<{
    key: string;
    status: "ok" | "warning" | "error";
    message: string;
  }>;
};

type SyncConvexAuthResponse = {
  ok: boolean;
  updated_keys: string[];
  message: string;
};

type FormState = {
  githubToken: string;
  githubRepo: string;
  githubTimeoutSec: string;
  githubWebhookSecret: string;
  smeeUrl: string;
  allowedOrigins: string;
  convexDeployment: string;
  convexSiteUrl: string;
  nextPublicConvexUrl: string;
  siteUrl: string;
  authGithubId: string;
  authGithubSecret: string;
  aiProvider: "auto" | "ollama" | "api" | "mock";
  ollamaHost: string;
  ollamaModel: string;
  llmApiBaseUrl: string;
  llmApiModel: string;
  llmApiKey: string;
  llmApiTimeoutSec: string;
  persist: boolean;
  syncConvexAuth: boolean;
};

const initialState: FormState = {
  githubToken: "",
  githubRepo: "",
  githubTimeoutSec: "10",
  githubWebhookSecret: "",
  smeeUrl: "",
  allowedOrigins: "http://localhost:3000,http://localhost",
  convexDeployment: "",
  convexSiteUrl: "",
  nextPublicConvexUrl: "",
  siteUrl: "http://localhost:3000",
  authGithubId: "",
  authGithubSecret: "",
  aiProvider: "auto",
  ollamaHost: "http://localhost:11434",
  ollamaModel: "llama3",
  llmApiBaseUrl: "https://api.openai.com/v1",
  llmApiModel: "gpt-4o-mini",
  llmApiKey: "",
  llmApiTimeoutSec: "20",
  persist: true,
  syncConvexAuth: true,
};

export default function SetupPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [configured, setConfigured] = useState({
    githubToken: false,
    githubWebhookSecret: false,
    llmApiKey: false,
    authGithubId: false,
    authGithubSecret: false,
  });
  const [diagnostics, setDiagnostics] = useState<DiagnosticsResponse | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch("/api/config");
        if (!response.ok) throw new Error("Failed to load config");
        const data: ConfigResponse = await response.json();

        setForm((prev) => ({
          ...prev,
          githubRepo: data.github_repo,
          githubTimeoutSec: String(data.github_timeout_sec),
          smeeUrl: data.smee_url,
          allowedOrigins: data.allowed_origins,
          convexDeployment: data.convex_deployment,
          convexSiteUrl: data.convex_site_url,
          nextPublicConvexUrl: data.next_public_convex_url,
          siteUrl: data.site_url,
          aiProvider: data.ai_provider,
          ollamaHost: data.ollama_host,
          ollamaModel: data.ollama_model,
          llmApiBaseUrl: data.llm_api_base_url,
          llmApiModel: data.llm_api_model,
          llmApiTimeoutSec: String(data.llm_api_timeout_sec),
        }));

        setConfigured({
          githubToken: data.github_token_configured,
          githubWebhookSecret: data.github_webhook_secret_configured,
          llmApiKey: data.llm_api_key_configured,
          authGithubId: data.auth_github_id_configured,
          authGithubSecret: data.auth_github_secret_configured,
        });
        const diagResponse = await fetch("/api/config/diagnostics");
        if (diagResponse.ok) {
          const diagData: DiagnosticsResponse = await diagResponse.json();
          setDiagnostics(diagData);
        }
      } catch {
        setStatus("Unable to load backend config. Start the API server first.");
      } finally {
        setLoading(false);
      }
    };

    void loadConfig();
  }, []);

  const canSubmit = useMemo(() => {
    return !!form.githubRepo.trim();
  }, [form.githubRepo]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || saving) return;

    setSaving(true);
    setStatus("");

    const payload: Record<string, unknown> = {
      github_repo: form.githubRepo,
      github_timeout_sec: Number(form.githubTimeoutSec),
      smee_url: form.smeeUrl,
      allowed_origins: form.allowedOrigins,
      convex_deployment: form.convexDeployment,
      ai_provider: form.aiProvider,
      ollama_host: form.ollamaHost.trim() || undefined,
      ollama_model: form.ollamaModel.trim() || undefined,
      llm_api_base_url: form.llmApiBaseUrl.trim() || undefined,
      llm_api_model: form.llmApiModel.trim() || undefined,
      llm_api_timeout_sec: Number(form.llmApiTimeoutSec),
      persist: form.persist,
    };

    if (form.convexSiteUrl.trim()) payload.convex_site_url = form.convexSiteUrl.trim();
    if (form.nextPublicConvexUrl.trim()) payload.next_public_convex_url = form.nextPublicConvexUrl.trim();
    if (form.siteUrl.trim()) payload.site_url = form.siteUrl.trim();
    if (form.githubToken.trim()) payload.github_token = form.githubToken.trim();
    if (form.githubWebhookSecret.trim()) payload.github_webhook_secret = form.githubWebhookSecret.trim();
    if (form.llmApiKey.trim()) payload.llm_api_key = form.llmApiKey.trim();
    if (form.authGithubId.trim()) payload.auth_github_id = form.authGithubId.trim();
    if (form.authGithubSecret.trim()) payload.auth_github_secret = form.authGithubSecret.trim();

    try {
      const response = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to save config");
      }

      const data: ConfigResponse = await response.json();
      setConfigured({
        githubToken: data.github_token_configured,
        githubWebhookSecret: data.github_webhook_secret_configured,
        llmApiKey: data.llm_api_key_configured,
        authGithubId: data.auth_github_id_configured,
        authGithubSecret: data.auth_github_secret_configured,
      });

      setForm((prev) => ({
        ...prev,
        githubToken: "",
        githubWebhookSecret: "",
        llmApiKey: "",
        authGithubId: "",
        authGithubSecret: "",
      }));
      const diagResponse = await fetch("/api/config/diagnostics");
      if (diagResponse.ok) {
        const diagData: DiagnosticsResponse = await diagResponse.json();
        setDiagnostics(diagData);
      }

      let convexSyncNote = "";
      if (form.syncConvexAuth) {
        const syncResponse = await fetch("/api/config/sync-convex-auth", {
          method: "POST",
        });
        if (syncResponse.ok) {
          const syncData: SyncConvexAuthResponse = await syncResponse.json();
          if (syncData.updated_keys.length > 0) {
            convexSyncNote = ` ${syncData.message}`;
          }
        } else {
          convexSyncNote =
            " OAuth values were saved locally but Convex env sync failed. Run `npx convex env set AUTH_GITHUB_ID ...`, `AUTH_GITHUB_SECRET ...`, and `SITE_URL ...`.";
        }
      }
      setStatus(
        `Saved. Config is live now. Restart backend/frontend for Convex or CORS changes, then run \`npx convex dev --once\` if OAuth config changed.${convexSyncNote}`
      );
    } catch {
      setStatus("Failed to save config. Check backend logs and retry.");
    } finally {
      setSaving(false);
    }
  };

  const fieldClass =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Setup</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure runtime keys and services from the UI. Sensitive values are never returned to the browser.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading configuration...</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6">
          <section className="space-y-3 rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider">Readiness</h2>
            {!diagnostics ? (
              <p className="text-sm text-muted-foreground">Diagnostics unavailable.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm">
                  Overall:{" "}
                  <span className={diagnostics.ready ? "text-primary" : "text-destructive"}>
                    {diagnostics.ready ? "Ready" : "Needs Attention"}
                  </span>
                </p>
                {diagnostics.checks.map((check) => (
                  <div key={check.key} className="text-xs text-muted-foreground">
                    <span
                      className={
                        check.status === "ok"
                          ? "text-primary"
                          : check.status === "warning"
                            ? "text-amber-400"
                            : "text-destructive"
                      }
                    >
                      [{check.status.toUpperCase()}]
                    </span>{" "}
                    {check.message}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3 rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider">GitHub</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">GitHub Token</span>
                <input
                  type="password"
                  value={form.githubToken}
                  onChange={(e) => setForm((p) => ({ ...p, githubToken: e.target.value }))}
                  className={fieldClass}
                  placeholder={configured.githubToken ? "Already configured (enter to replace)" : "ghp_..."}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">Repository (owner/repo)</span>
                <input
                  value={form.githubRepo}
                  onChange={(e) => setForm((p) => ({ ...p, githubRepo: e.target.value }))}
                  className={fieldClass}
                  required
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">GitHub Timeout Seconds</span>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={form.githubTimeoutSec}
                  onChange={(e) => setForm((p) => ({ ...p, githubTimeoutSec: e.target.value }))}
                  className={fieldClass}
                />
              </label>
            </div>
          </section>

          <section className="space-y-3 rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider">AI</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">Default Provider</span>
                <select
                  value={form.aiProvider}
                  onChange={(e) => setForm((p) => ({ ...p, aiProvider: e.target.value as FormState["aiProvider"] }))}
                  className={fieldClass}
                >
                  <option value="auto">auto</option>
                  <option value="ollama">ollama</option>
                  <option value="api">api</option>
                  <option value="mock">mock (test mode)</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">Ollama Host</span>
                <input
                  value={form.ollamaHost}
                  onChange={(e) => setForm((p) => ({ ...p, ollamaHost: e.target.value }))}
                  className={fieldClass}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">Ollama Model</span>
                <input
                  value={form.ollamaModel}
                  onChange={(e) => setForm((p) => ({ ...p, ollamaModel: e.target.value }))}
                  className={fieldClass}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">LLM API Base URL</span>
                <input
                  value={form.llmApiBaseUrl}
                  onChange={(e) => setForm((p) => ({ ...p, llmApiBaseUrl: e.target.value }))}
                  className={fieldClass}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">LLM API Model</span>
                <input
                  value={form.llmApiModel}
                  onChange={(e) => setForm((p) => ({ ...p, llmApiModel: e.target.value }))}
                  className={fieldClass}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">LLM API Key</span>
                <input
                  type="password"
                  value={form.llmApiKey}
                  onChange={(e) => setForm((p) => ({ ...p, llmApiKey: e.target.value }))}
                  className={fieldClass}
                  placeholder={configured.llmApiKey ? "Already configured (enter to replace)" : "sk-..."}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">LLM Timeout Seconds</span>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={form.llmApiTimeoutSec}
                  onChange={(e) => setForm((p) => ({ ...p, llmApiTimeoutSec: e.target.value }))}
                  className={fieldClass}
                />
              </label>
            </div>
          </section>

          <section className="space-y-3 rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider">Webhooks and App</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 md:col-span-2">
                <span className="text-xs text-muted-foreground">Allowed Origins (comma-separated)</span>
                <input
                  value={form.allowedOrigins}
                  onChange={(e) => setForm((p) => ({ ...p, allowedOrigins: e.target.value }))}
                  className={fieldClass}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">Webhook Secret</span>
                <input
                  type="password"
                  value={form.githubWebhookSecret}
                  onChange={(e) => setForm((p) => ({ ...p, githubWebhookSecret: e.target.value }))}
                  className={fieldClass}
                  placeholder={configured.githubWebhookSecret ? "Already configured (enter to replace)" : "optional"}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">SMEE URL</span>
                <input
                  value={form.smeeUrl}
                  onChange={(e) => setForm((p) => ({ ...p, smeeUrl: e.target.value }))}
                  className={fieldClass}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">Convex Deployment</span>
                <input
                  value={form.convexDeployment}
                  onChange={(e) => setForm((p) => ({ ...p, convexDeployment: e.target.value }))}
                  className={fieldClass}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">Convex Site URL</span>
                <input
                  value={form.convexSiteUrl}
                  onChange={(e) => setForm((p) => ({ ...p, convexSiteUrl: e.target.value }))}
                  className={fieldClass}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">NEXT_PUBLIC_CONVEX_URL</span>
                <input
                  value={form.nextPublicConvexUrl}
                  onChange={(e) => setForm((p) => ({ ...p, nextPublicConvexUrl: e.target.value }))}
                  className={fieldClass}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">SITE_URL (OAuth redirect base)</span>
                <input
                  value={form.siteUrl}
                  onChange={(e) => setForm((p) => ({ ...p, siteUrl: e.target.value }))}
                  className={fieldClass}
                  placeholder="http://localhost:3000"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">AUTH_GITHUB_ID</span>
                <input
                  type="password"
                  value={form.authGithubId}
                  onChange={(e) => setForm((p) => ({ ...p, authGithubId: e.target.value }))}
                  className={fieldClass}
                  placeholder={configured.authGithubId ? "Configured (enter to replace)" : "GitHub OAuth Client ID"}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">AUTH_GITHUB_SECRET</span>
                <input
                  type="password"
                  value={form.authGithubSecret}
                  onChange={(e) => setForm((p) => ({ ...p, authGithubSecret: e.target.value }))}
                  className={fieldClass}
                  placeholder={configured.authGithubSecret ? "Configured (enter to replace)" : "GitHub OAuth Client Secret"}
                />
              </label>
              <p className="text-xs text-muted-foreground md:col-span-2">
                GitHub OAuth callback URL should be{" "}
                <code>
                  {form.convexSiteUrl.trim() ? `${form.convexSiteUrl.replace(/\/$/, "")}/api/auth/callback/github` : "https://<your-deployment>.convex.site/api/auth/callback/github"}
                </code>
                .
              </p>
            </div>
          </section>

          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.persist}
                onChange={(e) => setForm((p) => ({ ...p, persist: e.target.checked }))}
              />
              Save to <code>.env.local</code> on the backend
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.syncConvexAuth}
                onChange={(e) => setForm((p) => ({ ...p, syncConvexAuth: e.target.checked }))}
              />
              Also sync OAuth vars to Convex env (<code>AUTH_GITHUB_ID</code>, <code>AUTH_GITHUB_SECRET</code>, <code>SITE_URL</code>)
            </label>
            <button
              type="submit"
              disabled={!canSubmit || saving}
              className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Configuration"}
            </button>
            {status && <p className="text-sm text-muted-foreground">{status}</p>}
          </div>
        </form>
      )}
    </div>
  );
}
