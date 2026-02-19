import { copyFileSync, existsSync, rmSync } from "node:fs";
import { platform } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const isWindows = platform() === "win32";

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: false,
    cwd: root,
    ...opts,
  });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(" ")}`);
  }
}

function readPythonVersion(cmd, args = ["--version"]) {
  const res = spawnSync(cmd, args, { cwd: root, encoding: "utf8" });
  if (res.status !== 0) return null;
  const raw = `${res.stdout || ""} ${res.stderr || ""}`.trim();
  const match = raw.match(/Python\s+(\d+)\.(\d+)\.(\d+)/i);
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    text: `${match[1]}.${match[2]}.${match[3]}`,
  };
}

function isSupportedPython(v) {
  if (!v) return false;
  if (v.major !== 3) return false;
  return v.minor >= 10 && v.minor <= 12;
}

function findPython() {
  const candidates = isWindows
    ? [
        ["py", ["-3.12", "--version"], ["py", "-3.12"]],
        ["py", ["-3.11", "--version"], ["py", "-3.11"]],
        ["py", ["-3.10", "--version"], ["py", "-3.10"]],
        ["py", ["-3", "--version"], ["py", "-3"]],
        ["python", ["--version"], ["python"]],
      ]
    : [
        ["python3.12", ["--version"], ["python3.12"]],
        ["python3.11", ["--version"], ["python3.11"]],
        ["python3.10", ["--version"], ["python3.10"]],
        ["python3", ["--version"], ["python3"]],
        ["python", ["--version"], ["python"]],
      ];

  for (const [cmd, versionArgs, execArgs] of candidates) {
    const version = readPythonVersion(cmd, versionArgs);
    if (isSupportedPython(version)) {
      return { cmd, execArgs, version };
    }
  }

  throw new Error("Supported Python not found. Install Python 3.10, 3.11, or 3.12.");
}

try {
  const python = findPython();
  const venvPath = join(root, ".venv");
  const pyExec = isWindows
    ? join(venvPath, "Scripts", "python.exe")
    : join(venvPath, "bin", "python");

  console.log("[setup] Installing Node dependencies...");
  run("npm", ["install"]);

  if (existsSync(pyExec)) {
    const venvVersion = readPythonVersion(pyExec);
    if (!isSupportedPython(venvVersion)) {
      console.log(
        `[setup] Existing .venv uses unsupported Python ${venvVersion?.text ?? "unknown"}, recreating with ${python.version.text}...`
      );
      rmSync(venvPath, { recursive: true, force: true });
    }
  }

  if (!existsSync(venvPath)) {
    console.log("[setup] Creating Python virtual environment...");
    if (python.cmd === "py") {
      run("py", [...python.execArgs.slice(1), "-m", "venv", ".venv"]);
    } else {
      run(python.cmd, ["-m", "venv", ".venv"]);
    }
  }

  console.log("[setup] Installing Python dependencies...");
  run(pyExec, ["-m", "pip", "install", "--upgrade", "pip"]);
  try {
    run(pyExec, ["-m", "pip", "install", "-r", "requirements.txt"]);
  } catch (error) {
    console.error(
      "[setup] Python dependency install failed. Check internet/DNS or your package index mirror, then retry."
    );
    throw error;
  }

  const envPath = join(root, ".env.local");
  if (!existsSync(envPath)) {
    console.log("[setup] Creating .env.local from .env.example...");
    copyFileSync(join(root, ".env.example"), envPath);
  }

  console.log("\n[setup] Complete.");
  console.log("Next: npm run dev:all");
  console.log("Then open: http://localhost:3000/setup");
} catch (error) {
  console.error(`\n[setup] ${error.message}`);
  process.exit(1);
}
