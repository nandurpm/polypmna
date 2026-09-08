import { sanitizePolyAiResponse } from "./polyAi";
import type { LocalPolyAiMessage } from "./polyAiStorage";

export const POLY_AI_UNAVAILABLE = "I couldn’t obtain an AI answer. Please try again. No answer has been generated for this request.";

// Deduplicate a locally saved exchange against its server copy. Rendering must
// never invent answers for missing messages or replace a provider's response.
export function visiblePolyAiMessages(messages: LocalPolyAiMessage[]): LocalPolyAiMessage[] {
  const visible: LocalPolyAiMessage[] = [];
  for (const message of messages) {
    const normalized = message.role === "assistant"
      ? { ...message, content: sanitizePolyAiResponse(message.content) }
      : message;
    const user = visible.at(-1);
    if (normalized.role === "assistant" && user?.role === "user") {
      const duplicate = visible.findIndex((item, index) =>
        index < visible.length - 1 && item.role === "user" && item.content === user.content
        && visible[index + 1]?.role === "assistant"
        && visible[index + 1]?.content === normalized.content);
      if (duplicate >= 0) visible.splice(duplicate, 2);
    }
    visible.push(normalized);
  }
  return visible;
}
