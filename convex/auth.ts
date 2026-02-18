import GitHub from "@auth/core/providers/github";
import { convexAuth } from "@convex-dev/auth/server";
import { MutationCtx } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    GitHub({
      authorization: {
        params: {
          // Request scopes needed for repo access, webhooks, etc.
          scope: "read:user user:email repo",
        },
      },
      profile(githubProfile, tokens) {
        return {
          id: String(githubProfile.id),
          name: githubProfile.name ?? githubProfile.login,
          email: githubProfile.email,
          image: githubProfile.avatar_url,
          // Custom fields stored in the users table
          githubUsername: githubProfile.login,
          githubId: String(githubProfile.id),
          // Pass the access token through the profile so we can
          // capture it in afterUserCreatedOrUpdated
          githubAccessToken: tokens.access_token ?? "",
        };
      },
    }),
  ],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx: MutationCtx, args) {
      if (args.type !== "oauth") return;

      const profile = args.profile as Record<string, unknown>;
      const accessToken = profile.githubAccessToken as string | undefined;

      if (!accessToken) return;

      // Upsert the token in our secure githubTokens table
      const existing = await ctx.db
        .query("githubTokens")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .first();

      const now = Date.now();

      if (existing) {
        await ctx.db.patch(existing._id, {
          accessToken,
          scopes: "read:user user:email repo",
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("githubTokens", {
          userId: args.userId,
          accessToken,
          scopes: "read:user user:email repo",
          createdAt: now,
          updatedAt: now,
        });
      }
    },
  },
});
