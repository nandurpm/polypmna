import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

const MAX_HISTORY_MESSAGES = 120;

async function requireUserId(ctx: { auth: Parameters<typeof getAuthUserId>[0]["auth"] }) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new Error("Authentication required");
  return userId;
}

export const getHistory = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const limit = Math.min(Math.max(Math.floor(args.limit ?? MAX_HISTORY_MESSAGES), 1), MAX_HISTORY_MESSAGES);
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit)
      .then((msgs) => msgs.reverse());
  },
});

export const storeMessages = mutation({
  args: {
    userContent: v.string(),
    assistantContent: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const userContent = args.userContent.trim();
    const assistantContent = args.assistantContent.trim();
    if (!userContent || !assistantContent) throw new Error("Message content cannot be empty");

    const now = Date.now();
    await ctx.db.insert("chatMessages", {
      userId,
      role: "user",
      content: userContent,
      timestamp: now,
    });
    await ctx.db.insert("chatMessages", {
      userId,
      role: "assistant",
      content: assistantContent,
      timestamp: now + 1,
    });
  },
});

export const clearHistory = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const msg of messages) await ctx.db.delete(msg._id);
  },
});

/** Internal-only atomic reservation used by the AI action for a per-user sliding-window limit. */
export const reserveAiRequest = internalMutation({
  args: {
    userId: v.id("users"),
    windowStart: v.number(),
    createdAt: v.number(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const recent = await ctx.db
      .query("aiRequests")
      .withIndex("by_user_time", (q) => q.eq("userId", args.userId).gte("createdAt", args.windowStart))
      .collect();
    if (recent.length >= args.limit) throw new Error("AI request rate limit reached; please try again in a minute");
    await ctx.db.insert("aiRequests", {
      userId: args.userId,
      createdAt: args.createdAt,
    });
  },
});

export const persistProviderExchange = internalMutation({
  args: {
    userId: v.id("users"),
    content: v.string(),
    response: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.insert("chatMessages", {
      userId: args.userId,
      role: "user",
      content: args.content,
      timestamp: now,
    });
    await ctx.db.insert("chatMessages", {
      userId: args.userId,
      role: "assistant",
      content: args.response,
      timestamp: now + 1,
    });
  },
});
