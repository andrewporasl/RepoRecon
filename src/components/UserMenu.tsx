"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { User, LogOut } from "lucide-react";

export function UserMenu() {
    const { isAuthenticated, isLoading } = useConvexAuth();
    const { signIn, signOut } = useAuthActions();
    const user = useQuery(
        api.users.currentUser,
        isAuthenticated ? {} : "skip"
    );
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary/30 rounded-full animate-pulse" />
                <span className="font-sans">Loading...</span>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <button
                onClick={() => void signIn("github")}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-md 
                bg-primary/10 border border-primary/20 text-primary 
                hover:bg-primary/20 hover:border-primary/40
                transition-all duration-200 text-sm font-medium font-sans"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Sign in with GitHub
            </button>
        );
    }

    // Authenticated state — show user info
    return (
        <button
            onClick={() => void signOut()}
            className="flex items-center justify-between w-full px-3 py-2 rounded-md 
            text-muted-foreground hover:text-foreground hover:bg-accent 
            transition-colors duration-150 group font-sans"
        >
            <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <User size={13} />
                </div>
                <div className="flex flex-col items-start">
                    <span className="text-xs font-medium text-foreground leading-tight">Account</span>
                    <span className="text-[10px] text-primary/70 leading-tight">Connected</span>
                </div>
            </div>
            <LogOut size={13} className="opacity-40 group-hover:opacity-70 transition-opacity" />
        </button>
    );
}
