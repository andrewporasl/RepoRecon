import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const schema = defineSchema({
    ...authTables,

    // Extend default users table with GitHub-specific fields
    users: defineTable({
        name: v.optional(v.string()),
        image: v.optional(v.string()),
        email: v.optional(v.string()),
        emailVerificationTime: v.optional(v.number()),
        phone: v.optional(v.string()),
        phoneVerificationTime: v.optional(v.number()),
        isAnonymous: v.optional(v.boolean()),
        // Custom GitHub fields
        githubUsername: v.optional(v.string()),
        githubId: v.optional(v.string()),
    })
        .index("email", ["email"])
        .index("phone", ["phone"]),

    // Store GitHub access tokens securely (server-side only)
    githubTokens: defineTable({
        userId: v.id("users"),
        // The access token from GitHub OAuth — encrypted at rest by Convex
        accessToken: v.string(),
        scopes: v.string(),
        createdAt: v.float64(),
        updatedAt: v.float64(),
    }).index("by_user", ["userId"]),

    // Track which repos a user is subscribed to
    subscribedRepos: defineTable({
        userId: v.id("users"),
        repoOwner: v.string(),
        repoName: v.string(),
        fullName: v.string(), // "owner/repo"
        subscribedAt: v.float64(),
    })
        .index("by_user", ["userId"])
        .index("by_user_and_repo", ["userId", "fullName"]),
});

export default schema;
