export default function Home() {
  return (
    <div className="flex flex-col gap-12">
      <section className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-100">
          System Overview
        </h1>
        <p className="max-w-2xl text-lg text-zinc-400 leading-relaxed">
          Welcome to RepoRecon. This environment is configured for repository
          reconnaissance and automated analysis. Navigate through the sidebar
          to explore real-time activity, agent insights, and the strategist terminal.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900/30 space-y-2">
          <h2 className="text-sm font-medium text-zinc-100 uppercase tracking-wider">Activity</h2>
          <p className="text-sm text-zinc-500">Real-time monitoring of repository events and PR updates.</p>
        </div>
        <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900/30 space-y-2">
          <h2 className="text-sm font-medium text-zinc-100 uppercase tracking-wider">Insights</h2>
          <p className="text-sm text-zinc-500">Deep structural analysis and architectural evaluations.</p>
        </div>
        <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900/30 space-y-2">
          <h2 className="text-sm font-medium text-zinc-100 uppercase tracking-wider">Terminal</h2>
          <p className="text-sm text-zinc-500">Direct interaction with the strategist agent system.</p>
        </div>
      </div>
    </div>
  );
}
