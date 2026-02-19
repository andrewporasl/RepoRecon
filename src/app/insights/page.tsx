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
            return;
        }
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

    const displayProgress = status === "complete" ? 100 : animatedProgress;

    return (
        <div className="h-[2px] w-full bg-border/50 overflow-hidden">
            <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${displayProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            />
        </div>
    );
}

function DiffBlock({ lines }: { lines: DiffLine[] }) {
    return (
        <div className="mt-4 font-mono text-xs bg-muted/30 rounded-lg border border-border overflow-hidden">
            {lines.map((line, i) => (
                <div
                    key={i}
                    className={`flex items-start px-3 py-1 ${line.type === "add"
                            ? "bg-emerald-500/5"
                            : line.type === "remove"
                                ? "bg-rose-500/5"
                                : ""
                        }`}
                >
                    <span
                        className={`w-4 shrink-0 select-none text-right mr-3 font-bold ${line.type === "add"
                                ? "text-emerald-600"
                                : line.type === "remove"
                                    ? "text-rose-600"
                                    : "text-muted-foreground/50"
                            }`}
                    >
                        {line.type === "add" ? "+" : line.type === "remove" ? "-" : " "}
                    </span>
                    <span
                        className={`${line.type === "remove"
                                ? "text-muted-foreground line-through opacity-70"
                                : line.type === "add"
                                    ? "text-foreground"
                                    : "text-muted-foreground"
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
            className={`text-[10px] tracking-widest uppercase font-semibold ${status === "complete" ? "text-primary" : "text-muted-foreground animate-pulse"
                }`}
        >
            {status === "complete" ? "Analysis Ready" : "Computing..."}
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
                setError("Using cached evaluation data");
                setAnalyses(fallbackAnalyses);
                setLoading(false);
            });
    }, []);

    return (
        <div className="flex flex-col gap-8 max-w-4xl mx-auto">
            <header>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">Agent Insights</h1>
                <p className="text-muted-foreground mt-2 leading-relaxed">
                    Repository evaluations and structural analysis generated by the intelligence engine.
                </p>
            </header>

            {error && (
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 border-l border-border pl-3">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex flex-col gap-8">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-card border border-border rounded-xl p-6 shadow-sm animate-pulse">
                            <div className="h-4 bg-muted rounded w-1/4 mb-4" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid gap-8">
                    {analyses.map((analysis, index) => (
                        <motion.div
                            key={analysis.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                            className="bg-card border border-border rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow"
                        >
                            <ProgressBar progress={analysis.progress} status={analysis.status} />

                            <div className="p-8 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-foreground font-semibold text-xl tracking-tight">
                                        {analysis.title}
                                    </h3>
                                    <StatusLabel status={analysis.status} />
                                </div>

                                <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
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
