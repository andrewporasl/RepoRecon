import type { Metadata } from "next";
import { Crimson_Pro, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { UserMenu } from "@/components/UserMenu";

const crimsonPro = Crimson_Pro({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RepoRecon",
  description: "Repository Reconnaisance & Analysis",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='12' fill='%23181c18'/><circle cx='50' cy='50' r='28' fill='none' stroke='%2386efac' stroke-width='8'/><circle cx='50' cy='50' r='10' fill='%2386efac'/></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${crimsonPro.variable} ${geistMono.variable} antialiased bg-background text-foreground font-sans min-h-screen flex`}
      >
        <ConvexClientProvider>
          {/* Sidebar */}
          <aside className="w-60 bg-sidebar flex flex-col p-5 gap-5 shrink-0 border-r border-sidebar-border">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-2 py-1 mt-1">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none" />
              </svg>
              <span className="text-lg font-semibold tracking-tight text-foreground">
                RepoRecon
              </span>
            </div>

            {/* Nav */}
            <nav className="flex flex-col gap-0.5 mt-1">
              {[
                { name: "Overview", href: "/" },
                { name: "Activity Feed", href: "/activity" },
                { name: "Agent Insights", href: "/insights" },
                { name: "Terminal", href: "/terminal" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* User */}
            <div className="mt-auto">
              <UserMenu />
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 overflow-y-auto bg-background">
            <div className="max-w-4xl mx-auto px-8 py-10">
              {children}
            </div>
          </main>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
