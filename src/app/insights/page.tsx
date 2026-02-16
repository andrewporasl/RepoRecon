"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

type AnalysisStatus = "thinking" | "complete";

interface DiffLine {
    type: "add" | "remove" | "context";
    content: string;
}

interface AnalysisCard {
    id: string;
    title: string;
    summary: string;
    status: AnalysisStatus;
    progress: number;
    diff: DiffLine[];
}

const mockAnalyses: AnalysisCard[] = [
    {
        id: "eval-001",
        title: "Module System Migration",
        summary:
            "The diff indicates a shift from CommonJS to ES Modules, reducing coupling between components and enabling tree-shaking for smaller bundle sizes.",
        status: "complete",
        progress: 100,
        diff: [
            { type: "remove", content: 'const Module = require("./types")' },
            { type: "remove", content: 'const { validate } = require("./utils")' },
            { type: "add", content: 'import { Module } from "./types"' },
            { type: "add", content: 'import { validate } from "./utils"' },
            { type: "context", content: "" },
            { type: "context", content: "export function processData(input: Module) {" },
            { type: "remove", content: "  const result = validate(input, false)" },
            { type: "add", content: "  const result = validate(input)" },
            { type: "context", content: "  return result" },
            { type: "context", content: "}" },
        ],
    },
    {
        id: "eval-002",
        title: "Authentication Refactor",
        summary:
            "Session management has been consolidated into a single middleware layer. Token refresh logic was extracted from individual route handlers into a centralized interceptor.",
        status: "thinking",
        progress: 62,
        diff: [
            { type: "context", content: "// middleware.ts" },
            { type: "add", content: "import { refreshToken } from './auth/refresh'" },
            { type: "add", content: "import { validateSession } from './auth/session'" },
            { type: "context", content: "" },
            { type: "remove", content: "export function middleware(req: Request) {" },
            { type: "add", content: "export async function middleware(req: Request) {" },
            { type: "add", content: "  const session = await validateSession(req)" },
            { type: "add", content: "  if (!session.valid) return refreshToken(req)" },
            { type: "context", content: "  return NextResponse.next()" },
            { type: "context", content: "}" },
        ],
    },
    {
        id: "eval-003",
        title: "Database Query Optimization",
        summary:
            "N+1 queries in the user listing endpoint have been replaced with a single joined query. Estimated response time improvement of 3.2x based on query plan analysis.",
        status: "thinking",
        progress: 28,
        diff: [
            { type: "context", content: "// users.repository.ts" },
            { type: "remove", content: "const users = await db.query('SELECT * FROM users')" },
            { type: "remove", content: "for (const user of users) {" },
            { type: "remove", content: "  user.posts = await db.query('SELECT * FROM posts WHERE author_id = ?', [user.id])" },
            { type: "remove", content: "}" },
            { type: "add", content: "const users = await db.query(`" },
            { type: "add", content: "  SELECT u.*, json_agg(p.*) as posts" },
            { type: "add", content: "  FROM users u" },
            { type: "add", content: "  LEFT JOIN posts p ON p.author_id = u.id" },
            { type: "add", content: "  GROUP BY u.id" },
            { type: "add", content: "`)" },
        ],
    },
];

function ProgressBar({ progress, status }: { progress: number; status: AnalysisStatus }) {
    const [animatedProgress, setAnimatedProgress] = useState(0);

    useEffect(() => {
        if (status === "complete") {
            setAnimatedProgress(100);
            return;
        }
        // Simulate slow progress for "thinking" cards
        const interval = setInterval(() => {
            setAnimatedProgress((prev) => {
                if (prev >= progress) {
                    clearInterval(interval);
                    return progress;
                }
                return prev + 0.5;
            });
        }, 50);
        return () => clearInterval(interval);
    }, [progress, status]);

    return (
        <div className="h-[2px] w-full bg-zinc-800/50 overflow-hidden">
            <motion.div
                className={status === "complete" ? "h-full bg-zinc-600" : "h-full bg-zinc-500"}
                initial={{ width: 0 }}
                animate={{ width: `${animatedProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            />
        </div>
    );
}

function DiffBlock({ lines }: { lines: DiffLine[] }) {
    return (
        <div className="mt-4 font-mono text-xs bg-zinc-950/50 rounded border border-zinc-800/50 overflow-hidden">
            {lines.map((line, i) => (
                <div
                    key={i}
                    className={`flex items-start px-3 py-0.5 ${
                        line.type === "add"
                            ? "bg-emerald-950/20"
                            : line.type === "remove"
                              ? "bg-rose-950/20"
                              : ""
                    }`}
                >
                    <span
                        className={`w-4 shrink-0 select-none text-right mr-3 ${
                            line.type === "add"
                                ? "text-emerald-700"
                                : line.type === "remove"
                                  ? "text-rose-700"
                                  : "text-zinc-700"
                        }`}
                    >
                        {line.type === "add" ? "+" : line.type === "remove" ? "-" : " "}
                    </span>
                    <span
                        className={`${
                            line.type === "remove"
                                ? "text-zinc-600 line-through"
                                : line.type === "add"
                                  ? "text-zinc-400"
                                  : "text-zinc-500"
                        }`}
                    >
                        {line.content}
                    </span>
                </div>
            ))}
        </div>
    );
}

function StatusLabel({ status }: { status: AnalysisStatus }) {
    return (
        <span
            className={`text-[10px] tracking-widest uppercase font-medium ${
                status === "complete" ? "text-zinc-500" : "text-zinc-600"
            }`}
        >
            {status === "complete" ? "COMPLETE" : "ANALYZING"}
        </span>
    );
}

export default function InsightsPage() {
    return (
        <div className="flex flex-col gap-8">
            <header>
                <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">Analysis</h1>
                <p className="text-zinc-400 mt-2">
                    Deep dive into repository changes and agent evaluations.
                </p>
            </header>

            <div className="grid gap-6">
                {mockAnalyses.map((analysis, index) => (
                    <motion.div
                        key={analysis.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex flex-col"
                    >
                        <ProgressBar progress={analysis.progress} status={analysis.status} />

                        <div className="p-6 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-zinc-100 font-medium text-lg">
                                    {analysis.title}
                                </h3>
                                <StatusLabel status={analysis.status} />
                            </div>

                            <p className="text-zinc-400 text-sm leading-relaxed">
                                {analysis.summary}
                            </p>

                            <DiffBlock lines={analysis.diff} />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
