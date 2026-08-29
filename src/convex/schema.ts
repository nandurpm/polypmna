/*
 * ============================================================
 * FILE: schema.ts
 * PURPOSE: Defines the Convex database schema, authentication tables, roles, educational content, chat, health, and rate-limit records.
 * ============================================================
 */

import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      // Student profile
      department: v.optional(v.string()),
      semester: v.optional(v.number()),
    }).index("email", ["email"]),

    // ── Departments ──
    departments: defineTable({
      name: v.string(),
      abbr: v.string(),
      icon: v.string(),
      color: v.string(),
      sortOrder: v.number(),
    }).index("by_abbr", ["abbr"]),

    // ── Subjects ──
    subjects: defineTable({
      name: v.string(),
      departmentId: v.id("departments"),
      semester: v.number(),
      code: v.optional(v.string()),
      description: v.optional(v.string()),
    }).index("by_department", ["departmentId", "semester"]),

    // ── Study Materials (notes, syllabus, etc.) ──
    materials: defineTable({
      title: v.string(),
      subjectId: v.id("subjects"),
      type: v.union(
        v.literal("notes"),
        v.literal("syllabus"),
        v.literal("paper"),
      ),
      description: v.optional(v.string()),
      pageCount: v.optional(v.number()),
      stars: v.number(),
      fileUrl: v.optional(v.string()),
      createdAt: v.number(),
    })
      .index("by_subject", ["subjectId"])
      .index("by_type", ["type"])
      .index("by_created", ["createdAt"]),

    // ── Question Papers ──
    questionPapers: defineTable({
      title: v.string(),
      subjectId: v.id("subjects"),
      year: v.number(),
      examType: v.union(
        v.literal("mid"),
        v.literal("end"),
        v.literal("supply"),
      ),
      fileUrl: v.optional(v.string()),
      createdAt: v.number(),
    })
      .index("by_subject", ["subjectId"])
      .index("by_year", ["year"]),

    // ── Mock Exams ──
    mockExams: defineTable({
      title: v.string(),
      subjectId: v.id("subjects"),
      semester: v.number(),
      questionCount: v.number(),
      durationMinutes: v.number(),
      questions: v.array(
        v.object({
          question: v.string(),
          options: v.array(v.string()),
          correctIndex: v.number(),
          explanation: v.optional(v.string()),
        }),
      ),
    })
      .index("by_subject", ["subjectId"])
      .index("by_semester", ["semester"]),

    // ── Mock Exam Attempts ──
    mockExamAttempts: defineTable({
      userId: v.id("users"),
      mockExamId: v.id("mockExams"),
      answers: v.array(v.number()),
      score: v.number(),
      totalQuestions: v.number(),
      completedAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_exam", ["mockExamId"]),

    // ── Chat Messages (Ask POLY AI) ──
    chatMessages: defineTable({
      userId: v.id("users"),
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
      timestamp: v.number(),
    }).index("by_user", ["userId", "timestamp"]),

    aiRequests: defineTable({
      userId: v.id("users"),
      createdAt: v.number(),
    }).index("by_user_time", ["userId", "createdAt"]),

    providerQuota: defineTable({
      provider: v.string(),
      window: v.union(v.literal("minute"), v.literal("day")),
      windowStart: v.number(),
      requestCount: v.number(),
    }).index("by_provider_window", ["provider", "window"]),

    aiStreams: defineTable({
      userId: v.id("users"),
      status: v.union(
        v.literal("streaming"),
        v.literal("completed"),
        v.literal("failed"),
      ),
      content: v.string(),
      provider: v.optional(v.string()),
      model: v.optional(v.string()),
      error: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    }).index("by_user_updated", ["userId", "updatedAt"]),

    providerHealth: defineTable({
      provider: v.string(),
      consecutiveFailures: v.number(),
      lastFailureAt: v.optional(v.number()),
      lastSuccessAt: v.optional(v.number()),
      lastDurationMs: v.optional(v.number()),
      updatedAt: v.number(),
    }).index("by_provider", ["provider"]),

    // ── User Progress ──
    userProgress: defineTable({
      userId: v.id("users"),
      subjectId: v.id("subjects"),
      materialsViewed: v.array(v.id("materials")),
      lastViewedAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_user_subject", ["userId", "subjectId"]),
  },
  {
    schemaValidation: true,
  },
);

export default schema;
