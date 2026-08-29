/*
 * ============================================================
 * FILE: questionPapers.ts
 * PURPOSE: Queries question papers by subject or semester and provides the internal paper seeder.
 * ============================================================
 */

import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const listBySubject = query({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questionPapers")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .collect();
  },
});

export const listBySemester = query({
  args: { semester: v.number() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("questionPapers").collect();
    // We need to cross-reference subjects to filter by semester
    const subjects = await ctx.db.query("subjects").collect();
    const subjectIds = new Set(
      subjects.filter((s) => s.semester === args.semester).map((s) => s._id)
    );
    return all.filter((p) => subjectIds.has(p.subjectId));
  },
});

export const recent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    return await ctx.db
      .query("questionPapers")
      .withIndex("by_year")
      .order("desc")
      .take(limit);
  },
});

// Seed question papers
export const seedQuestionPapers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("questionPapers").first();
    if (existing) return "already_seeded";

    const subjects = await ctx.db.query("subjects").collect();
    let count = 0;
    const years = [2023, 2024, 2025];
    const examTypes = ["mid" as const, "end" as const, "supply" as const];

    // Only seed papers for first 30 subjects to avoid too much data
    for (const subject of subjects.slice(0, 30)) {
      for (const year of years) {
        for (const examType of examTypes) {
          if (Math.random() > 0.3) {
            const label = examType === "mid" ? "Mid Semester" : examType === "end" ? "End Semester" : "Supplementary";
            await ctx.db.insert("questionPapers", {
              title: `${subject.name} — ${label} ${year}`,
              subjectId: subject._id,
              year,
              examType,
              createdAt: Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000),
            });
            count++;
          }
        }
      }
    }
    return `seeded_${count}_papers`;
  },
});
