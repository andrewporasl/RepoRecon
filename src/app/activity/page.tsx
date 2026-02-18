"use client";

import { useAction, useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect, useCallback } from "react";

// Event type → icon and color
const EVENT_STYLES: Record<string, { icon: string; color: string; bg: string }> = {
    push: { icon: "↑", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    pull_request: { icon: "⎇", color: "text-violet-400", bg: "bg-violet-500/10" },
    issue: { icon: "●", color: "text-amber-400", bg: "bg-amber-500/10" },
    comment: { icon: "💬", color: "text-blue-400", bg: "bg-blue-500/10" },
    create: { icon: "+", color: "text-green-400", bg: "bg-green-500/10" },
    delete: { icon: "×", color: "text-red-400", bg: "bg-red-500/10" },
    star: { icon: "★", color: "text-yellow-400", bg: "bg-yellow-500/10" },
    fork: { icon: "⑂", color: "text-cyan-400", bg: "bg-cyan-500/10" },
    release: { icon: "🏷", color: "text-pink-400", bg: "bg-pink-500/10" },
    unknown: { icon: "•", color: "text-zinc-400", bg: "bg-zinc-500/10" },
};

function timeAgo(isoString: string): string {
    const now = new Date();
    const then = new Date(isoString);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
}

type ActivityEvent = {
    id: string;
    type: string;
    title: string;
    repo: string;
    author: string;
    authorAvatar: string;
    timestamp: string;
    url: string;
};

export default function ActivityPage() {
    const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
    const fetchEvents = useAction(api.github.fetchUserEvents);
    const [events, setEvents] = useState<ActivityEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadEvents = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        setError(null);
        try {
            const data = await fetchEvents({ page: 1 });
            setEvents(data);
        } catch (err: any) {
            setError(err.message ?? "Failed to fetch events");
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, fetchEvents]);

    useEffect(() => {
        if (isAuthenticated) {
            loadEvents();
        }
    }, [isAuthenticated, loadEvents]);

    // Not logged in state
    if (!authLoading && !isAuthenticated) {
        return (
            <div className="flex flex-col gap-8">
                <header>
                    <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">Activity Feed</h1>
                    <p className="text-zinc-400 mt-2">Monitor system activities and pull requests in real-time.</p>
                </header>
                <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-lg border border-zinc-800 bg-zinc-900/20">
                    <svg className="w-12 h-12 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <p className="text-zinc-500 text-sm">Sign in with GitHub to view your activity feed.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">Activity Feed</h1>
                    <p className="text-zinc-400 mt-2">Real-time events from your GitHub ecosystem.</p>
                </div>
                <button
                    onClick={loadEvents}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
            bg-zinc-900/50 border border-zinc-800 text-zinc-300
            hover:bg-zinc-800/80 hover:border-zinc-700 hover:text-zinc-100
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200 cursor-pointer"
                >
                    <svg
                        className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {loading ? "Refreshing..." : "Refresh"}
                </button>
            </header>

            {/* Error state */}
            {error && (
                <div className="p-4 rounded-lg border border-red-900/50 bg-red-950/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Loading skeleton */}
            {(loading && events.length === 0) && (
                <div className="flex flex-col gap-1">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                            <div className="w-8 h-8 rounded-full bg-zinc-800" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-zinc-800 rounded w-3/4" />
                                <div className="h-2 bg-zinc-800/60 rounded w-1/3" />
                            </div>
                            <div className="h-2 bg-zinc-800/40 rounded w-16" />
                        </div>
                    ))}
                </div>
            )}

            {/* Events list */}
            {events.length > 0 && (
                <div className="flex flex-col gap-0.5">
                    {events.map((event) => {
                        const style = EVENT_STYLES[event.type] ?? EVENT_STYLES.unknown;

                        return (
                            <a
                                key={event.id}
                                href={event.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-start gap-4 p-4 rounded-lg 
                  transition-all duration-150
                  hover:bg-zinc-900/50 border border-transparent hover:border-zinc-800"
                            >
                                {/* Event type icon */}
                                <div className={`w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                                    <span className={`text-sm font-bold ${style.color}`}>{style.icon}</span>
                                </div>

                                {/* Content */}
                                <div className="flex flex-col gap-1 min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                                            {event.type.replace("_", " ")}
                                        </span>
                                        <span className="text-[10px] text-zinc-600">•</span>
                                        <span className="text-[10px] text-zinc-600 font-mono">{event.repo}</span>
                                    </div>
                                    <span className="text-sm text-zinc-200 group-hover:text-zinc-100 transition-colors truncate">
                                        {event.title}
                                    </span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <img
                                            src={event.authorAvatar}
                                            alt={event.author}
                                            className="w-4 h-4 rounded-full"
                                        />
                                        <span className="text-xs text-zinc-500">@{event.author}</span>
                                    </div>
                                </div>

                                {/* Timestamp */}
                                <span className="text-xs text-zinc-600 shrink-0 mt-1 group-hover:text-zinc-500 transition-colors">
                                    {timeAgo(event.timestamp)}
                                </span>
                            </a>
                        );
                    })}
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && events.length === 0 && isAuthenticated && (
                <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-lg border border-zinc-800 bg-zinc-900/20">
                    <span className="text-2xl">📡</span>
                    <p className="text-zinc-500 text-sm">No recent events found. Start watching some repos!</p>
                </div>
            )}
        </div>
    );
}
