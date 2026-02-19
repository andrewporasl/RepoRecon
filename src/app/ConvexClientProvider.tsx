"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

function getConvexUrl(): string | null {
    const value = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!value) return null;
    try {
        const parsed = new URL(value);
        if (!["http:", "https:"].includes(parsed.protocol)) return null;
        return value;
    } catch {
        return null;
    }
}

const convexUrl = getConvexUrl();
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    if (!convex) {
        return (
            <>
                <div className="fixed top-3 right-3 z-50 p-3 rounded-md border border-destructive/40 bg-destructive/10 text-destructive text-xs">
                    Missing <code>NEXT_PUBLIC_CONVEX_URL</code>. Configure it in <code>.env.local</code> and restart.
                </div>
                {children}
            </>
        );
    }
    return <ConvexAuthProvider client={convex}>{children}</ConvexAuthProvider>;
}
