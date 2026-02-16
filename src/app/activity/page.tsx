export default function ActivityPage() {
    return (
        <div className="flex flex-col gap-8">
            <header>
                <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">Activity Feed</h1>
                <p className="text-zinc-400 mt-2">Monitor system activities and pull requests in real-time.</p>
            </header>

            <div className="flex flex-col gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className="group flex items-center justify-between p-4 rounded-lg transition-colors hover:bg-zinc-900/50 border border-transparent hover:border-zinc-800"
                    >
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">AUTHOR: @explorer</span>
                            <span className="text-zinc-100">Updated documentation for core engine #12{i}</span>
                        </div>
                        <span className="text-xs text-zinc-500">2h ago</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
