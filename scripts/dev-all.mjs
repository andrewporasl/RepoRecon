import { existsSync, readFileSync } from "node:fs";
import { platform } from "node:os";
import { join } from "node:path";
import { spawn, spawnSync } from "node:child_process";

const root = process.cwd();
const isWindows = platform() === "win32";
const envLocalPath = join(root, ".env.local");
const pyExec = isWindows
  ? join(root, ".venv", "Scripts", "python.exe")
  : join(root, ".venv", "bin", "python");

if (!existsSync(pyExec)) {
  console.error("[dev:all] Missing .venv Python. Run: npm run setup");
  process.exit(1);
}

const pyCheck = spawnSync(pyExec, ["-c", "import fastapi, uvicorn"], {
  cwd: root,
  stdio: "ignore",
});
if (pyCheck.status !== 0) {
  console.error(
    "[dev:all] Python dependencies are missing (fastapi/uvicorn). Run: npm run setup (requires internet)."
  );
  process.exit(1);
}

function readEnvValue(key) {
  if (!existsSync(envLocalPath)) return "";
  const content = readFileSync(envLocalPath, "utf8");
  const line = content
    .split(/\r?\n/)
    .find((entry) => entry.trim().startsWith(`${key}=`));
  if (!line) return "";
  const raw = line.split("=").slice(1).join("=").trim();
  if ((raw.startsWith("'") && raw.endsWith("'")) || (raw.startsWith('"') && raw.endsWith('"'))) {
    return raw.slice(1, -1).trim();
  }
  return raw;
}

const convexDeployment = readEnvValue("CONVEX_DEPLOYMENT");
const shouldRunConvex = Boolean(convexDeployment);

if (!shouldRunConvex) {
  console.warn(
    "[dev:all] CONVEX_DEPLOYMENT is not set. Skipping `convex dev` for now; configure Convex in /setup."
  );
}

const commands = [
  shouldRunConvex ? '"npx convex dev"' : null,
  '"next dev"',
  `"${pyExec} -m uvicorn backend.main:app --reload --port 8000"`,
].filter(Boolean);

const names = shouldRunConvex ? "Convex,Next,API" : "Next,API";
const colors = shouldRunConvex ? "yellow,blue,green" : "blue,green";

const cmd = [
  "npx concurrently",
  `--names "${names}"`,
  `--prefix-colors "${colors}"`,
  ...commands,
].join(" ");

const child = spawn(cmd, {
  cwd: root,
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
