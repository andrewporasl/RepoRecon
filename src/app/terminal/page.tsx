export default function TerminalPage() {
    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <header className="mb-8">
                <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">Terminal</h1>
                <p className="text-zinc-400 mt-2">Interact with the strategist agent.</p>
            </header>

            <div className="flex-1 overflow-y-auto space-y-6 pr-4">
                <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-zinc-100">Strategist</span>
                        <span className="text-[10px] text-zinc-500">20:10</span>
                    </div>
                    <p className="text-zinc-400 leading-relaxed">
                        I've completed the initial scan of the repository. What would you like me to focus on first?
                    </p>
                </div>
            </div>

            <div className="mt-auto pt-8">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Type a command or ask a question..."
                        className="w-full bg-transparent border-none outline-none text-zinc-100 placeholder:text-zinc-600 py-4"
                    />
                    <div className="absolute right-0 bottom-4 text-zinc-600 text-xs">
                        Enter ↵
                    </div>
                </div>
            </div>
        </div>
    );
}
