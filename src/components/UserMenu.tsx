"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useRef, useEffect } from "react";

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
            <div className="flex items-center gap-2 px-3 py-2">
                <div className="w-4 h-4 rounded-full border-2 border-zinc-600 border-t-zinc-300 animate-spin" />
                <span className="text-xs text-zinc-500">Connecting...</span>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <button
                onClick={() => void signIn("github")}
                className="group flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg 
          bg-zinc-900/50 border border-zinc-800 
          hover:bg-zinc-800/80 hover:border-zinc-700 
          transition-all duration-200 cursor-pointer"
            >
                <svg
                    className="w-5 h-5 text-zinc-400 group-hover:text-zinc-200 transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">
                    Sign in with GitHub
                </span>
            </button>
        );
    }

    // Authenticated state — show user info
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
          hover:bg-zinc-900/50 transition-all duration-200 cursor-pointer"
            >
                {/* Avatar */}
                {user?.image ? (
                    <img
                        src={user.image}
                        alt={user.name ?? "User"}
                        className="w-8 h-8 rounded-full ring-2 ring-zinc-700 group-hover:ring-zinc-600 transition-all"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-800 ring-2 ring-zinc-700 flex items-center justify-center">
                        <span className="text-xs font-medium text-zinc-400">
                            {(user?.name ?? "?")[0].toUpperCase()}
                        </span>
                    </div>
                )}

                {/* Name & username */}
                <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="text-sm font-medium text-zinc-200 truncate w-full">
                        {user?.name ?? "Loading..."}
                    </span>
                    {user?.githubUsername && (
                        <span className="text-[11px] text-zinc-500 truncate w-full">
                            @{user.githubUsername}
                        </span>
                    )}
                </div>

                {/* Chevron */}
                <svg
                    className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl shadow-black/50 overflow-hidden z-50">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-zinc-800">
                        <p className="text-sm font-medium text-zinc-200">{user?.name}</p>
                        <p className="text-xs text-zinc-500">{user?.email ?? `@${user?.githubUsername}`}</p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                        <a
                            href={`https://github.com/${user?.githubUsername}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 transition-colors"
                            onClick={() => setDropdownOpen(false)}
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            GitHub Profile
                        </a>

                        <button
                            onClick={() => {
                                setDropdownOpen(false);
                                void signOut();
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-zinc-400 
                hover:bg-red-950/30 hover:text-red-400 transition-colors cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
