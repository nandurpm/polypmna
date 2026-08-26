import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation, internalMutation } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { v } from "convex/values";

function toPublicExam(exam: Doc<"mockExams">) {
  return {
    ...exam,
    questions: exam.questions.map(({ question, options }) => ({ question, options })),
  };
}

export const listBySubject = query({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    const exams = await ctx.db
      .query("mockExams")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .collect();
    return exams.map(toPublicExam);
  },
});

export const listBySemester = query({
  args: { semester: v.number() },
  handler: async (ctx, args) => {
    const exams = await ctx.db
      .query("mockExams")
      .withIndex("by_semester", (q) => q.eq("semester", args.semester))
      .collect();
    return exams.map(toPublicExam);
  },
});

export const get = query({
  args: { id: v.id("mockExams") },
  handler: async (ctx, args) => {
    const exam = await ctx.db.get(args.id);
    return exam ? toPublicExam(exam) : null;
  },
});

export const getUserAttempts = query({
  args: { mockExamId: v.optional(v.id("mockExams")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Authentication required");
    let results = await ctx.db
      .query("mockExamAttempts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    if (args.mockExamId) {
      results = results.filter((a) => a.mockExamId === args.mockExamId);
    }
    return results;
  },
});

export const submitAttempt = mutation({
  args: {
    mockExamId: v.id("mockExams"),
    answers: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Authentication required");
    const exam = await ctx.db.get(args.mockExamId);
    if (!exam) throw new Error("Exam not found");
    if (args.answers.length !== exam.questions.length) throw new Error("Every question must have an answer");
    if (args.answers.some((answer, index) => answer < 0 || answer >= exam.questions[index].options.length)) {
      throw new Error("Invalid answer selection");
    }

    let score = 0;
    for (let i = 0; i < exam.questions.length; i++) {
      if (args.answers[i] === exam.questions[i].correctIndex) score++;
    }

    const attemptId = await ctx.db.insert("mockExamAttempts", {
      userId,
      mockExamId: args.mockExamId,
      answers: args.answers,
      score,
      totalQuestions: exam.questions.length,
      completedAt: Date.now(),
    });
    return { attemptId, score, totalQuestions: exam.questions.length };
  },
});

// Seed mock exams with sample questions
export const seedMockExams = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("mockExams").first();
    if (existing) return "already_seeded";

    const subjects = await ctx.db.query("subjects").collect();
    let count = 0;

    const sampleQuestions = [
      {
        question: "Which data structure uses FIFO (First In, First Out) principle?",
        options: ["Stack", "Queue", "Tree", "Graph"],
        correctIndex: 1,
        explanation: "A Queue follows FIFO — the first element added is the first to be removed.",
      },
      {
        question: "What is the time complexity of binary search?",
        options: ["O(n)", "O(n²)", "O(log n)", "O(1)"],
        correctIndex: 2,
        explanation: "Binary search halves the search space each step, giving O(log n) time complexity.",
      },
      {
        question: "Which of the following is NOT a valid C data type?",
        options: ["int", "float", "real", "char"],
        correctIndex: 2,
        explanation: "'real' is not a built-in C data type. Use 'float' or 'double' instead.",
      },
      {
        question: "What does 'DDL' stand for in database systems?",
        options: ["Data Definition Language", "Data Delivery Language", "Data Design Logic", "Database Design Language"],
        correctIndex: 0,
        explanation: "DDL (Data Definition Language) is used to define and modify database schemas.",
      },
      {
        question: "Which gate implements the Boolean expression A AND B?",
        options: ["OR gate", "AND gate", "NOT gate", "XOR gate"],
        correctIndex: 1,
        explanation: "An AND gate outputs true only when both inputs are true.",
      },
    ];

    // Create 2 mock exams per subject (limited subjects to avoid too much data)
    const targetSubjects = subjects.slice(0, 20);
    for (const subject of targetSubjects) {
      await ctx.db.insert("mockExams", {
        title: `${subject.name} — Mid Semester Practice`,
        subjectId: subject._id,
        semester: subject.semester,
        questionCount: 5,
        durationMinutes: 15,
        questions: sampleQuestions,
      });
      await ctx.db.insert("mockExams", {
        title: `${subject.name} — End Semester Practice`,
        subjectId: subject._id,
        semester: subject.semester,
        questionCount: 5,
        durationMinutes: 20,
        questions: sampleQuestions.map((q) => ({ ...q })),
      });
      count += 2;
    }
    return `seeded_${count}_mock_exams`;
  },
});
