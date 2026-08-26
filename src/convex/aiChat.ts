import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Call OpenRouter free model for AI chat responses.
 * Uses meta-llama/llama-3.1-8b-instruct:free — a strong free model.
 */
export const chatCompletion = action({
  args: {
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
        content: v.string(),
      })
    ),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY not configured");
    }

    const systemMessage = {
      role: "system" as const,
      content: `You are POLY AI, a helpful study assistant for Kerala Polytechnic students. You help students understand engineering concepts, formulas, exam preparation, and study materials across departments: Computer Science (CSE), Civil Engineering (CE), Mechanical Engineering (ME), Electronics & Communication (ECE), Electrical & Electronics (EEE), and Automobile Engineering (AE).

Guidelines:
- Explain concepts in simple, clear language suitable for polytechnic students
- Use examples, diagrams descriptions, and real-world applications
- When discussing formulas, show step-by-step derivations
- Cover topics from the Kerala Polytechnic curriculum (Revision 2026 & 2021)
- Be encouraging and supportive
- If unsure about something, say so honestly
- Format responses with clear structure using paragraphs and bullet points`,
    };

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://polypmna.freebuff.app",
        "X-Title": "Polytechnic Study Materials",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [systemMessage, ...args.messages],
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI model");
    }

    return content;
  },
});
