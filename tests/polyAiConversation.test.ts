import { expect, it } from "vitest";
import { visiblePolyAiMessages } from "../src/lib/polyAiConversation";
import type { LocalPolyAiMessage } from "../src/lib/polyAiStorage";
const user: LocalPolyAiMessage = { _id: "u", role: "user", content: "compare Android and iPhone" };
it("does not invent an answer for an unanswered question", () => {
  expect(visiblePolyAiMessages([user])).toEqual([user]);
});
it("preserves short streaming responses instead of replacing them", () => {
  const answer: LocalPolyAiMessage = { _id: "a", role: "assistant", content: "Here is", source: "provider" };
  expect(visiblePolyAiMessages([user, answer])[1]).toEqual(answer);
});
it("deduplicates saved exchanges and preserves the later source", () => {
  const answer: LocalPolyAiMessage = { _id: "a", role: "assistant", content: "| Feature | Android | iPhone |\n| --- | --- | --- |\n| Maker | Multiple | Apple |" };
  const latest = { ...answer, _id: "local", source: "provider" as const };
  expect(visiblePolyAiMessages([user, answer, user, latest])).toEqual([user, latest]);
});
