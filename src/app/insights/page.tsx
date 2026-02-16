export default function InsightsPage() {
    return (
        <div className="flex flex-col gap-8">
            <header>
                <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">Analysis</h1>
                <p className="text-zinc-400 mt-2">Deep dive into repository changes and agent evaluations.</p>
            </header>

            <div className="grid gap-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col gap-4">
                    <div className="h-1 w-full bg-zinc-800 overflow-hidden rounded-full">
                        <div className="h-full bg-zinc-400 w-1/3 animate-pulse" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <h3 className="text-zinc-100 font-medium text-lg">System Evaluation</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Analyzing the recent architectural changes. The diff indicates a shift towards a more modular structure, reducing coupling between components.
                        </p>
                    </div>
                    <div className="mt-4 font-mono text-xs text-zinc-500 space-y-1">
                        <div className="flex gap-4">
                            <span className="text-zinc-600">+</span>
                            <span>{"import {Module} from \"./types\""}</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-zinc-600">-</span>
                            <span className="line-through opacity-50">{"const Module = require(\"./types\")"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
