/*
 * ============================================================
 * FILE: departments.ts
 * PURPOSE: Exposes Convex queries for listing departments and looking them up by abbreviation.
 * ============================================================
 */

import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("departments").collect();
  },
});

export const getByAbbr = query({
  args: { abbr: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("departments")
      .withIndex("by_abbr", (q) => q.eq("abbr", args.abbr))
      .first();
    return results;
  },
});

