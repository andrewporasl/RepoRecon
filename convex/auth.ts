import GitHub from "@auth/core/providers/github";
import { convexAuth } from "@convex-dev/auth/server";

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
          // Custom fields we store in the users table
          githubUsername: githubProfile.login,
          githubId: String(githubProfile.id),
        };
      },
    }),
  ],
});
