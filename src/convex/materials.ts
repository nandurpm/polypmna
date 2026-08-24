import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listBySubject = query({
  args: { subjectId: v.id("subjects"), type: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("materials")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .collect();
    if (args.type) {
      return results.filter((m) => m.type === args.type);
    }
    return results;
  },
});

export const recent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    return await ctx.db
      .query("materials")
      .withIndex("by_created")
      .order("desc")
      .take(limit);
  },
});

export const featured = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 6;
    const all = await ctx.db.query("materials").collect();
    return all.sort((a, b) => b.stars - a.stars).slice(0, limit);
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const q = args.query.toLowerCase();
    const all = await ctx.db.query("materials").collect();
    return all.filter(
      (m) => m.title.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q)
    );
  },
});

// Seed sample materials for each subject
export const seedMaterials = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("materials").first();
    if (existing) return "already_seeded";

    const subjects = await ctx.db.query("subjects").collect();
    let count = 0;

    const materialTemplates = [
      { suffix: "— Complete Study Notes", type: "notes" as const, baseStars: 80 },
      { suffix: "— Unit-wise Summary", type: "notes" as const, baseStars: 60 },
      { suffix: "Syllabus — Revision 2026", type: "syllabus" as const, baseStars: 40 },
    ];

    for (const subject of subjects) {
      for (const tmpl of materialTemplates) {
        await ctx.db.insert("materials", {
          title: `${subject.name} ${tmpl.suffix}`,
          subjectId: subject._id,
          type: tmpl.type,
          description: `Study material for ${subject.name}`,
          pageCount: Math.floor(Math.random() * 40) + 15,
          stars: tmpl.baseStars + Math.floor(Math.random() * 30),
          createdAt: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
        });
        count++;
      }
    }
    return `seeded_${count}_materials`;
  },
});
