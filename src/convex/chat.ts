import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getHistory = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit)
      .then((msgs) => msgs.reverse());
  },
});

export const sendMessage = mutation({
  args: { userId: v.id("users"), content: v.string() },
  handler: async (ctx, args) => {
    // Store user message
    await ctx.db.insert("chatMessages", {
      userId: args.userId,
      role: "user",
      content: args.content,
      timestamp: Date.now(),
    });

    // Simple pattern-matching AI response (replace with real AI later)
    const query = args.content.toLowerCase();
    let response = "";

    if (query.includes("hello") || query.includes("hi") || query.includes("hey")) {
      response = "Hello! I'm POLY AI, your study assistant for Kerala Polytechnic. How can I help you today? You can ask me about any subject, concept, or formula.";
    } else if (query.includes("what is") || query.includes("define") || query.includes("explain")) {
      response = "Great question! Let me explain that concept in simple terms. In the context of Kerala Polytechnic curriculum, this is an important topic. I'd recommend checking the relevant chapter in your textbook for detailed coverage. Would you like me to suggest related topics to study?";
    } else if (query.includes("formula") || query.includes("equation")) {
      response = "Here are some key formulas to remember:\n\n• Study the formula sheet provided with each chapter\n• Focus on understanding the derivation, not just memorizing\n• Practice numerical problems using each formula\n\nWould you like me to help with a specific formula?";
    } else if (query.includes("exam") || query.includes("test") || query.includes("prepare")) {
      response = "For exam preparation, I recommend:\n\n1. Start with previous year question papers\n2. Focus on frequently repeated topics\n3. Take mock tests to assess your preparation\n4. Revise key definitions and formulas\n\nWould you like me to help you create a study plan?";
    } else if (query.includes("thank")) {
      response = "You're welcome! Keep studying hard. Feel free to ask me anything anytime. All the best for your exams! 📚";
    } else {
      response = "That's an interesting question! Based on the Kerala Polytechnic syllabus, this topic is covered in your curriculum. I'd suggest:\n\n1. Review the relevant chapter in your textbook\n2. Check the study notes available on this platform\n3. Practice related problems from previous year papers\n\nIs there anything specific about this topic you'd like me to explain further?";
    }

    // Store assistant response
    await ctx.db.insert("chatMessages", {
      userId: args.userId,
      role: "assistant",
      content: response,
      timestamp: Date.now(),
    });

    return response;
  },
});

export const clearHistory = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }
  },
});
