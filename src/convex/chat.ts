/*
 * ============================================================
 * FILE: chat.ts
 * PURPOSE: Persists authenticated chat history, streaming chunks, provider health, and request-budget reservations.
 * ============================================================
 */

import { getAuthUserId } from "@convex-dev/auth/server";
import {
  query,
  mutation,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { v } from "convex/values";

const MAX_HISTORY_MESSAGES = 120;

// ============================================================
// AUTHENTICATED CHAT HISTORY
// ============================================================

async function requireUserId(ctx: {
  auth: Parameters<typeof getAuthUserId>[0]["auth"];
}) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new Error("Authentication required");
  return userId;
}

export const getHistory = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const limit = Math.min(
      Math.max(Math.floor(args.limit ?? MAX_HISTORY_MESSAGES), 1),
      MAX_HISTORY_MESSAGES,
    );
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
    if (!userContent || !assistantContent)
      throw new Error("Message content cannot be empty");

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

export const getAiStream = query({
  args: { streamId: v.id("aiStreams") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const stream = await ctx.db.get(args.streamId);
    if (!stream || stream.userId !== userId)
      throw new Error("Stream not found");
    return {
      status: stream.status,
      content: stream.content,
      provider: stream.provider,
      model: stream.model,
      error: stream.error,
      updatedAt: stream.updatedAt,
    };
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

// ============================================================
// STREAM RECORD LIFECYCLE
// ============================================================

export const createAiStream = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const now = Date.now();
    const staleStreams = await ctx.db
      .query("aiStreams")
      .withIndex("by_user_updated", (q) =>
        q.eq("userId", args.userId).lt("updatedAt", now - 86_400_000),
      )
      .take(20);
    for (const stream of staleStreams) await ctx.db.delete(stream._id);
    return await ctx.db.insert("aiStreams", {
      userId: args.userId,
      status: "streaming",
      content: "",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const appendAiStream = internalMutation({
  args: {
    streamId: v.id("aiStreams"),
    userId: v.id("users"),
    delta: v.string(),
    provider: v.optional(v.string()),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const stream = await ctx.db.get(args.streamId);
    if (
      !stream ||
      stream.userId !== args.userId ||
      stream.status !== "streaming"
    )
      return;
    await ctx.db.patch(args.streamId, {
      content: stream.content + args.delta,
      provider: args.provider ?? stream.provider,
      model: args.model ?? stream.model,
      updatedAt: Date.now(),
    });
  },
});

export const resetAiStream = internalMutation({
  args: {
    streamId: v.id("aiStreams"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const stream = await ctx.db.get(args.streamId);
    if (
      !stream ||
      stream.userId !== args.userId ||
      stream.status !== "streaming"
    )
      return;
    await ctx.db.patch(args.streamId, {
      content: "",
      provider: undefined,
      model: undefined,
      updatedAt: Date.now(),
    });
  },
});

export const finishAiStream = internalMutation({
  args: {
    streamId: v.id("aiStreams"),
    userId: v.id("users"),
    content: v.string(),
    provider: v.optional(v.string()),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const stream = await ctx.db.get(args.streamId);
    if (!stream || stream.userId !== args.userId) return;
    await ctx.db.patch(args.streamId, {
      status: "completed",
      content: args.content,
      provider: args.provider ?? stream.provider,
      model: args.model ?? stream.model,
      updatedAt: Date.now(),
    });
  },
});

export const failAiStream = internalMutation({
  args: {
    streamId: v.id("aiStreams"),
    userId: v.id("users"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const stream = await ctx.db.get(args.streamId);
    if (!stream || stream.userId !== args.userId) return;
    await ctx.db.patch(args.streamId, {
      status: "failed",
      error: args.error,
      updatedAt: Date.now(),
    });
  },
});

// ============================================================
// PROVIDER HEALTH AND SHARED QUOTAS
// ============================================================

/** Internal-only provider-health records used to order and cool down adapters. */
export const getProviderHealth = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("providerHealth").collect();
  },
});

export const recordProviderHealth = internalMutation({
  args: {
    provider: v.string(),
    ok: v.boolean(),
    durationMs: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("providerHealth")
      .withIndex("by_provider", (q) => q.eq("provider", args.provider))
      .unique();
    if (args.ok) {
      const patch = {
        consecutiveFailures: 0,
        lastSuccessAt: now,
        lastFailureAt: undefined,
        lastDurationMs: args.durationMs,
        updatedAt: now,
      };
      if (existing) await ctx.db.patch(existing._id, patch);
      else
        await ctx.db.insert("providerHealth", {
          provider: args.provider,
          ...patch,
        });
      return;
    }
    const patch = {
      consecutiveFailures: (existing?.consecutiveFailures ?? 0) + 1,
      lastFailureAt: now,
      lastDurationMs: args.durationMs,
      updatedAt: now,
    };
    if (existing) await ctx.db.patch(existing._id, patch);
    else
      await ctx.db.insert("providerHealth", {
        provider: args.provider,
        ...patch,
      });
  },
});

export const reserveProviderRequest = internalMutation({
  args: {
    provider: v.string(),
    minuteStart: v.number(),
    dayStart: v.number(),
    minuteLimit: v.number(),
    dayLimit: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("providerQuota")
      .withIndex("by_provider_window", (q) => q.eq("provider", args.provider))
      .collect();
    const minute = existing.find((item) => item.window === "minute");
    const day = existing.find((item) => item.window === "day");
    const minuteCount =
      minute?.windowStart === args.minuteStart ? minute.requestCount : 0;
    const dayCount = day?.windowStart === args.dayStart ? day.requestCount : 0;
    if (minuteCount >= args.minuteLimit)
      throw new Error(`${args.provider} minute free-tier budget reached`);
    if (dayCount >= args.dayLimit)
      throw new Error(`${args.provider} daily free-tier budget reached`);

    if (minute) {
      await ctx.db.patch(minute._id, {
        windowStart: args.minuteStart,
        requestCount: minuteCount + 1,
      });
    } else {
      await ctx.db.insert("providerQuota", {
        provider: args.provider,
        window: "minute",
        windowStart: args.minuteStart,
        requestCount: 1,
      });
    }
    if (day) {
      await ctx.db.patch(day._id, {
        windowStart: args.dayStart,
        requestCount: dayCount + 1,
      });
    } else {
      await ctx.db.insert("providerQuota", {
        provider: args.provider,
        window: "day",
        windowStart: args.dayStart,
        requestCount: 1,
      });
    }
  },
});

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
      .withIndex("by_user_time", (q) =>
        q.eq("userId", args.userId).gte("createdAt", args.windowStart),
      )
      .collect();
    if (recent.length >= args.limit)
      throw new Error(
        "AI request rate limit reached; please try again in a minute",
      );
    await ctx.db.insert("aiRequests", {
      userId: args.userId,
      createdAt: args.createdAt,
    });
  },
});

// ============================================================
// PERSISTED PROVIDER EXCHANGES
// ============================================================

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
