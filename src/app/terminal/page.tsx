"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    role: "user" | "agent";
    content: string;
    timestamp: string;
}

export default function TerminalPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "agent",
            content: "Hello. I'm ready to analyze your repository.",
            timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input;
        setInput("");
        setLoading(true);

        const newMsg: Message = {
            role: "user",
            content: userMessage,
            timestamp: new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };

        setMessages((prev) => [...prev, newMsg]);

        try {
            const response = await fetch("/api/terminal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage }),
            });

            if (!response.ok) throw new Error("Failed to fetch response");

            const data = await response.json();

            setMessages((prev) => [
                ...prev,
                {
                    role: "agent",
                    content: data.response || "No response received.",
                    timestamp: new Date().toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                },
            ]);
        } catch (error) {
            console.error("Failed to send message:", error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "agent",
                    content: "I'm having trouble connecting to the backend. Please check your connection.",
                    timestamp: new Date().toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex-none py-6 text-center">
                <h1 className="text-xl font-semibold text-foreground tracking-tight">Strategist</h1>
                <p className="text-sm text-muted-foreground mt-1">Repository Intelligence Agent</p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-8 px-4 py-6 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
                <AnimatePresence initial={false}>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                            <div className={`max-w-[85%] rounded-2xl px-5 py-4 leading-relaxed ${msg.role === 'user'
                                    ? 'bg-secondary text-secondary-foreground rounded-tr-sm'
                                    : 'bg-transparent text-foreground pl-0'
                                }`}>
                                {msg.role === 'agent' && (
                                    <div className="text-xs font-semibold text-primary mb-1 uppercase tracking-wider">
                                        Strategist
                                    </div>
                                )}
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 text-muted-foreground text-sm pl-0"
                    >
                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-75" />
                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-150" />
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex-none pt-4 pb-6 px-4 bg-background/80 backdrop-blur-sm sticky bottom-0">
                <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything..."
                        disabled={loading}
                        className="w-full bg-white dark:bg-zinc-900 border border-input rounded-xl px-5 py-4 pr-12 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={loading || !input}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-primary transition-colors disabled:opacity-30"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                    </button>
                </form>
                <p className="text-center text-[10px] text-muted-foreground mt-2">
                    AI can make mistakes. Please verify important information.
                </p>
            </div>
        </div>
    );
}
