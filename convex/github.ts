import { v } from "convex/values";
import { action, internalQuery } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

/**
 * Internal query to get the user's GitHub profile and OAuth token.
 * Server-side only — never exposed to the client.
 */
export const getUserWithToken = internalQuery({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) return null;

        const tokenDoc = await ctx.db
            .query("githubTokens")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();

        return {
            user,
            accessToken: tokenDoc?.accessToken ?? null,
        };
    },
});

/**
 * Fetch recent GitHub events for the authenticated user.
 * Uses the GitHub Events API with the user's OAuth token.
 */
export const fetchUserEvents = action({
    args: {
        page: v.optional(v.number()),
    },
    handler: async (ctx, args): Promise<any[]> => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const result: any = await ctx.runQuery(internal.github.getUserWithToken, {
            userId,
        });

        if (!result?.user?.githubUsername) {
            throw new Error("GitHub username not found");
        }
        if (!result.accessToken) {
            throw new Error("GitHub access token not found. Please sign out and sign in again.");
        }

        const page: number = args.page ?? 1;
        const username: string = result.user.githubUsername;
        const token: string = result.accessToken;

        // Fetch received events (activity from repos the user watches + their own)
        const eventsRes: Response = await fetch(
            `https://api.github.com/users/${username}/received_events?per_page=30&page=${page}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/vnd.github.v3+json",
                    "User-Agent": "RepoRecon",
                },
            }
        );

        if (!eventsRes.ok) {
            const errorText = await eventsRes.text();
            throw new Error(`GitHub API error: ${eventsRes.status} - ${errorText}`);
        }

        const events: any[] = await eventsRes.json();

        // Transform events into our activity format
        return events.map((event: any) => {
            const { type, actor, repo, payload, created_at } = event;

            let title = "";
            let eventType = "unknown";
            let url = "";

            switch (type) {
                case "PushEvent": {
                    const commitCount = payload.commits?.length ?? 0;
                    const commitMsg = payload.commits?.[0]?.message?.split("\n")[0] ?? "";
                    title = commitCount > 1
                        ? `Pushed ${commitCount} commits: "${commitMsg}"`
                        : `Pushed: "${commitMsg}"`;
                    eventType = "push";
                    url = `https://github.com/${repo.name}/compare/${payload.before?.slice(0, 7)}...${payload.head?.slice(0, 7)}`;
                    break;
                }

                case "PullRequestEvent":
                    title = `${payload.action === "opened" ? "Opened" : payload.action === "closed" && payload.pull_request?.merged ? "Merged" : payload.action} PR: ${payload.pull_request?.title}`;
                    eventType = "pull_request";
                    url = payload.pull_request?.html_url ?? "";
                    break;

                case "IssuesEvent":
                    title = `${payload.action} issue: ${payload.issue?.title}`;
                    eventType = "issue";
                    url = payload.issue?.html_url ?? "";
                    break;

                case "IssueCommentEvent":
                    title = `Commented on: ${payload.issue?.title}`;
                    eventType = "comment";
                    url = payload.comment?.html_url ?? "";
                    break;

                case "CreateEvent":
                    title = `Created ${payload.ref_type}${payload.ref ? `: ${payload.ref}` : ""}`;
                    eventType = "create";
                    url = `https://github.com/${repo.name}`;
                    break;

                case "DeleteEvent":
                    title = `Deleted ${payload.ref_type}: ${payload.ref}`;
                    eventType = "delete";
                    url = `https://github.com/${repo.name}`;
                    break;

                case "WatchEvent":
                    title = `Starred ${repo.name}`;
                    eventType = "star";
                    url = `https://github.com/${repo.name}`;
                    break;

                case "ForkEvent":
                    title = `Forked ${repo.name}`;
                    eventType = "fork";
                    url = payload.forkee?.html_url ?? "";
                    break;

                case "ReleaseEvent":
                    title = `${payload.action} release: ${payload.release?.tag_name}`;
                    eventType = "release";
                    url = payload.release?.html_url ?? "";
                    break;

                default:
                    title = type.replace("Event", "");
                    eventType = type.toLowerCase().replace("event", "");
                    url = `https://github.com/${repo.name}`;
            }

            return {
                id: event.id,
                type: eventType,
                title,
                repo: repo.name,
                author: actor.login,
                authorAvatar: actor.avatar_url,
                timestamp: created_at,
                url,
            };
        });
    },
});
