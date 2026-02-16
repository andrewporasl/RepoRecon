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

const fallbackAnalyses: AnalysisCard[] = [
    {
        id: "eval-001",
        title: "Module System Migration",
        summary:
            "The diff indicates a shift from CommonJS to ES Modules, reducing coupling between components and enabling tree-shaking for smaller bundle sizes.",
        status: "complete",
        progress: 100,
        diff: [
            { type: "remove", content: 'const Module = require("./types")' },
            { type: "add", content: 'import { Module } from "./types"' },
            { type: "context", content: "export function processData(input: Module) {" },
            { type: "context", content: "  return result" },
            { type: "context", content: "}" },
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
    const [analyses, setAnalyses] = useState<AnalysisCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/insights")
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data) => {
                setAnalyses(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch insights, using fallback:", err);
                setError("Backend unavailable — showing cached data");
                setAnalyses(fallbackAnalyses);
                setLoading(false);
            });
    }, []);

    return (
        <div className="flex flex-col gap-8">
            <header>
                <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">Analysis</h1>
                <p className="text-zinc-400 mt-2">
                    Deep dive into repository changes and agent evaluations.
                </p>
            </header>

            {error && (
                <div className="text-xs text-zinc-600 bg-zinc-900/50 border border-zinc-800 rounded px-3 py-2">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex flex-col gap-6">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 animate-pulse">
                            <div className="h-4 bg-zinc-800 rounded w-1/3 mb-4" />
                            <div className="h-3 bg-zinc-800 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            ) : (
            <div className="grid gap-6">
                {analyses.map((analysis, index) => (
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
            )}
        </div>
    );
}
