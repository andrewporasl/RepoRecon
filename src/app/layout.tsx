import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { UserMenu } from "@/components/UserMenu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RepoRecon",
  description: "Repository Reconnaisance & Analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-400 font-sans min-h-screen flex`}
      >
        <ConvexClientProvider>
          {/* Sidebar: Ghost Frame */}
          <aside className="w-64 border-r border-zinc-800 flex flex-col p-6 gap-8 shrink-0">
            <div className="flex items-center gap-2 px-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-zinc-100 tracking-tight">RepoRecon</span>
            </div>

            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                className="px-3 py-2 rounded-md hover:bg-zinc-900/50 hover:text-zinc-100 transition-colors text-sm font-medium"
              >
                Overview
              </Link>
              <Link
                href="/activity"
                className="px-3 py-2 rounded-md hover:bg-zinc-900/50 hover:text-zinc-100 transition-colors text-sm font-medium"
              >
                Activity Feed
              </Link>
              <Link
                href="/insights"
                className="px-3 py-2 rounded-md hover:bg-zinc-900/50 hover:text-zinc-100 transition-colors text-sm font-medium"
              >
                Agent Insights
              </Link>
              <Link
                href="/terminal"
                className="px-3 py-2 rounded-md hover:bg-zinc-900/50 hover:text-zinc-100 transition-colors text-sm font-medium"
              >
                Terminal
              </Link>
            </nav>

            {/* Push UserMenu to bottom of sidebar */}
            <div className="mt-auto">
              <UserMenu />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {children}
            </div>
          </main>
        </ConvexClientProvider>
      </body>
    </html>
  );
}


