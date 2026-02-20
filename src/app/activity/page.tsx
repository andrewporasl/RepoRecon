"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Activity {
    id: string;
    type: string;
    title: string;
    author: string;
    timestamp: string;
}

export default function ActivityPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const res = await fetch("/api/activity");
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                setActivities(data);
            } catch (error) {
                console.error("Failed to load activity feed", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();
    }, []);

    return (
        <div className="flex flex-col gap-8">
            <header>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">Activity Feed</h1>
                <p className="text-muted-foreground mt-2">Monitor system activities and pull requests in real-time.</p>
            </header>

            <div className="flex flex-col gap-1 min-h-[200px]">
                {loading ? (
                    <div className="text-muted-foreground text-sm animate-pulse">Loading feed...</div>
                ) : (
                    <AnimatePresence>
                        {activities.map((activity, i) => (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group flex items-center justify-between p-4 rounded-lg transition-colors hover:bg-muted border border-transparent hover:border-border"
                            >
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                                        AUTHOR: @{activity.author}
                                    </span>
                                    <div className="text-foreground flex items-center gap-2 font-medium">
                                        {activity.type === 'pull_request' && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 shadow-sm" />}
                                        {activity.type === 'commit' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 shadow-sm" />}
                                        {activity.type === 'issue' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 shadow-sm" />}
                                        {activity.title}
                                    </div>
                                </div>
                                <span className="text-xs text-muted-foreground font-mono">{activity.timestamp}</span>
                            </motion.div>
                        ))}
                        {activities.length === 0 && (
                            <div className="text-muted-foreground text-sm">No recent activity found.</div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
