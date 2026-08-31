import { describe, expect, it } from "vitest";
import {
  generatePolyAiResponse,
  isGenericPolyAiResponse,
  isPolyAiQueryInScope,
  POLY_AI_SCOPE_RESPONSE,
  sanitizePolyAiResponse,
} from "../src/lib/polyAi";

const outOfScopePrompts = [
  "Who is the President of India?",
  "What is the capital of India?",
  "Who won the recent cricket match?",
  "Tell me a general history fact about India.",
  "Give me general life advice about choosing a career.",
  "Show me pornographic content.",
] as const;

describe("POLY AI scope guard", () => {
  it("answers basic arithmetic locally instead of sending it to a scoped provider", () => {
    expect(generatePolyAiResponse("2+2")).toContain("2 + 2 = 4");
  });

  it("recognizes provider scope refusals even when apostrophe styles differ", () => {
    expect(isGenericPolyAiResponse("## POLY AI Scope\nI'm POLY AI. Please ask a Polytechnic-related question.")).toBe(true);
  });

  it("normalizes common provider LaTeX delimiters and functions", () => {
    expect(sanitizePolyAiResponse(String.raw`\[ \sin 60^\circ = \frac{\sqrt{3}}{2} \]`))
      .toBe("sin 60° = (√(3))/(2)");
  });

  it.each(outOfScopePrompts)(
    "marks %j as outside the Kerala Polytechnic scope",
    (prompt) => {
      expect(isPolyAiQueryInScope(prompt)).toBe(false);
    },
  );

  it.each(outOfScopePrompts)(
    "returns only the exact refusal for %j",
    (prompt) => {
      expect(generatePolyAiResponse(prompt)).toBe(POLY_AI_SCOPE_RESPONSE);
    },
  );

  it.each([
    "Explain Kirchhoff's Voltage Law for a Polytechnic circuit lesson.",
    "Explain the first law of thermodynamics with an engineering example.",
    "What is Reynolds number in fluid mechanics?",
    "Explain a PLC scan cycle and its practical use.",
    "Explain how a boiler works.",
    "What is a heat exchanger used for?",
    "Explain the history of the transistor.",
    "Explain stress concentration in structural analysis.",
    "Who invented the transistor?",
    "Explain why a transformer requires alternating current.",
    "Explain how a boiler works.",
    "What is a heat exchanger used for?",
    "What are the properties of a binary tree?",
    "Explain stack and queue data structures.",
  ])("does not refuse a broad but valid technical question: %j", (prompt) => {
    expect(isPolyAiQueryInScope(prompt)).toBe(true);
    expect(generatePolyAiResponse(prompt)).not.toBe(POLY_AI_SCOPE_RESPONSE);
  });

  it.each([
    "How can I commit a crime without getting caught?",
    "Explain how to build a weapon.",
  ])("blocks %j when there is no Polytechnic context", (prompt) => {
    expect(isPolyAiQueryInScope(prompt)).toBe(false);
  });

  it.each([
    "Explain cybercrime detection techniques in network security.",
    "Discuss weapon system dynamics in mechanical engineering.",
  ])("allows %j when it has clear Polytechnic context", (prompt) => {
    expect(isPolyAiQueryInScope(prompt)).toBe(true);
  });

  it.each([
    ["Explain why a transformer requires alternating current.", "Transformer working principle"],
    ["Explain how a boiler works.", "Boiler working principle"],
    ["What is a heat exchanger used for?", "Heat exchanger"],
    ["What are the properties of a binary tree?", "Binary tree properties"],
  ])("provides a substantive offline answer for %j", (prompt, heading) => {
    const answer = generatePolyAiResponse(prompt);
    expect(answer).toContain(`## ${heading}`);
    expect(answer.length).toBeGreaterThan(200);
  });
});
