import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PolyAiMessage } from "@/components/PolyAiMessage";
import { POLY_AI_SCOPE_RESPONSE, generatePolyAiResponse, isGenericPolyAiResponse, isLeakedPolyAiResponse, isPolyAiQueryInScope, isRichPolyAiRequest, isRichPolyAiResponseForQuery, sanitizePolyAiResponse } from "@/lib/polyAi";
import { clearPolyAiState, loadPolyAiState, savePolyAiState } from "@/lib/polyAiStorage";
import {
  Send,
  ArrowLeft,
  Bot,
  User,
  Sparkles,
  Trash2,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const quickPrompts = [
  "Explain Ohm's Law in simple terms",
  "What are the properties of a binary tree?",
  "Difference between SQL and NoSQL databases",
  "How does a transistor work?",
  "What is the Bending Moment Diagram?",
  "Explain the working of a 4-stroke engine",
];

export default function AskAI() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [input, setInput] = useState(() => loadPolyAiState().preferences.draft);
  const [isSending, setIsSending] = useState(false);
  const [localMessages, setLocalMessages] = useState<{ _id: string; role: "user" | "assistant"; content: string }[]>(() => loadPolyAiState().messages);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showOlderMessages, setShowOlderMessages] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const chatHistory = useQuery(
    api.chat.getHistory,
    user ? {} : "skip"
  );
  const storeMessages = useMutation(api.chat.storeMessages);
  const clearHistory = useMutation(api.chat.clearHistory);
  const chatCompletion = useAction(api.aiChat.chatCompletion);
  const nextId = useRef(0);
  const allMessages = useMemo(() => {
    const visible: { _id: string; role: "user" | "assistant"; content: string }[] = [];
    const persistedKeys = new Set((chatHistory ?? []).map((message) => `${message.role}:${message.content}`));
    const mergedMessages = [
      ...(chatHistory ?? []).map((message) => ({ _id: String(message._id), role: message.role as "user" | "assistant", content: message.content })),
      ...localMessages.filter((message) => !persistedKeys.has(`${message.role}:${message.content}`)),
    ];
    const seenExchanges = new Set<string>();
    let seenScopeRefusal = false;
    for (const message of mergedMessages) {
      if (message.role === "user") {
        visible.push(message);
        continue;
      }

      const content = sanitizePolyAiResponse(message.content);
      const isLegacyScopeRefusal = content === POLY_AI_SCOPE_RESPONSE;
      const needsLocalRepair = !content || isLegacyScopeRefusal || isLeakedPolyAiResponse(message.content) || isGenericPolyAiResponse(content);
      let repairedContent = content;
      let repairedId = message._id;
      const lastUser = [...visible].reverse().find((item) => item.role === "user");
      if (needsLocalRepair) {
        if (lastUser && visible[visible.length - 1]?.role === "user") {
          repairedContent = sanitizePolyAiResponse(generatePolyAiResponse(lastUser.content));
          repairedId = `${message._id}-local-repair`;
        } else if (!repairedContent) {
          continue;
        }
      }
      if (lastUser && visible[visible.length - 1]?.role === "user") {
        const exchangeKey = `${lastUser.content}\u0000${repairedContent}`;
        if (seenExchanges.has(exchangeKey)) {
          visible.pop();
          continue;
        }
        seenExchanges.add(exchangeKey);
        if (repairedContent === POLY_AI_SCOPE_RESPONSE && seenScopeRefusal) {
          const previousRefusalIndex = visible.findIndex((item) => item.role === "assistant" && item.content === POLY_AI_SCOPE_RESPONSE);
          if (previousRefusalIndex > 0 && visible[previousRefusalIndex - 1]?.role === "user") {
            visible.splice(previousRefusalIndex - 1, 2);
          }
        }
        if (repairedContent === POLY_AI_SCOPE_RESPONSE) seenScopeRefusal = true;
      }
      visible.push({ ...message, _id: repairedId, content: repairedContent });
    }
    return visible;
  }, [chatHistory, localMessages]);
  const hiddenMessageCount = Math.max(0, allMessages.length - 16);
  const messages = showOlderMessages ? allMessages : allMessages.slice(-16);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    savePolyAiState({
      messages: localMessages,
      preferences: { draft: input, renderer: "rich-local" },
    });
  }, [input, localMessages]);

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isSending) return;
    setInput("");
    setIsSending(true);
    try {
      const historyMessages = messages.slice(-8).map((message) => ({
        role: message.role as "user" | "assistant",
        content: (message.role === "user" ? message.content : sanitizePolyAiResponse(message.content)).slice(-5000),
      }));
      let response: string;
      if (!isPolyAiQueryInScope(content)) {
        response = POLY_AI_SCOPE_RESPONSE;
      } else try {
        const providerRawAnswer = await Promise.race<string>([
          chatCompletion({ messages: [...historyMessages, { role: "user", content }] }),
          new Promise<string>((_, reject) => window.setTimeout(() => reject(new Error("AI provider timed out")), 18000)),
        ]);
        const providerAnswer = sanitizePolyAiResponse(providerRawAnswer);
        if (!providerAnswer || isGenericPolyAiResponse(providerAnswer) || (isRichPolyAiRequest(content) && !isRichPolyAiResponseForQuery(content, providerAnswer))) {
          throw new Error("Provider returned an unsuitable answer format");
        }
        response = providerAnswer;
      } catch (providerError) {
        console.warn("External POLY AI provider unavailable; using deterministic fallback:", providerError);
        setProviderError(providerError instanceof Error ? providerError.message : "AI provider unavailable");
        response = sanitizePolyAiResponse(generatePolyAiResponse(content));
      }

      nextId.current += 1;
      const id = String(nextId.current);
      setLocalMessages((current) => [
        ...current,
        { _id: `${id}-user`, role: "user", content },
        { _id: `${id}-assistant`, role: "assistant", content: response },
      ]);

      if (user) {
        void Promise.race([
          storeMessages({ userContent: content, assistantContent: response }),
          new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error("Chat history save timed out")), 5000)),
        ]).catch((persistError) => console.warn("Could not persist chat history; local answer remains visible:", persistError));
      }
    } catch (error) {
      console.warn("Chat error:", error);
      nextId.current += 1;
      const id = String(nextId.current);
      setLocalMessages((current) => [
        ...current,
        { _id: `${id}-user`, role: "user", content },
        { _id: `${id}-assistant`, role: "assistant", content: sanitizePolyAiResponse(generatePolyAiResponse(content)) },
      ]);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      window.setTimeout(() => setCopiedId((current) => current === messageId ? null : current), 1600);
    } catch (error) {
      console.warn("Could not copy answer:", error);
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Clear all chat history?")) return;
    setLocalMessages([]);
    setShowOlderMessages(false);
    setInput("");
    clearPolyAiState();
    if (user) {
      try {
        await clearHistory({});
      } catch (error) {
        console.warn("Could not clear server history:", error);
      }
    }
  };

  return (
    <div className="h-[100svh] max-h-[100svh] overflow-hidden bg-background flex flex-col">
      {/* Nav */}
      <nav className="flex-none border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="w-full flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20">
                <Sparkles className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <span className="text-sm font-semibold text-foreground">Ask POLY AI</span>
                <span className="ml-2 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 border border-emerald-200">
                  Online
                </span>
              </div>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>
      </nav>

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="w-full px-3 py-4 sm:px-5 sm:py-5 lg:px-8">
          {providerError && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
              <p className="font-semibold">AI provider unavailable — using local fallback</p>
              <p className="mt-1 opacity-80">{providerError}</p>
              <p className="mt-1 opacity-80">The request reached Convex, but the configured provider did not return an answer. Your API keys remain server-side; check the Convex production logs for provider status or retry after the provider quota resets.</p>
            </div>
          )}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease }}
              className="flex flex-col items-center justify-center py-8 sm:py-12 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-amber-500/15 mb-4">
                <Bot className="h-8 w-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Welcome to POLY AI
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Your personal AI study assistant for Kerala Polytechnic. Ask doubts, understand concepts,
                get explanations in simple language, and prepare for exams.
              </p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full max-w-3xl">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="text-left rounded-xl border border-border/60 bg-card px-4 py-3 text-xs text-muted-foreground
                             hover:border-primary/20 hover:text-foreground hover:bg-card/80 transition-all cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {allMessages.length > 16 && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-dashed border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground sm:px-4">
              <span>{showOlderMessages ? "Showing the full saved conversation." : `${hiddenMessageCount} earlier messages are collapsed to keep this session focused.`}</span>
              <button
                type="button"
                onClick={() => setShowOlderMessages((current) => !current)}
                className="shrink-0 font-medium text-primary hover:underline"
              >
                {showOlderMessages ? "Collapse" : "Show earlier"}
              </button>
            </div>
          )}

          {messages.map((msg: { _id: string; role: string; content: string }, i: number) => (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i === messages.length - 1 ? 0.05 : 0, duration: 0.25 }}
              className={`flex gap-3 mb-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 mt-1">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`rounded-2xl px-3 py-3 text-sm leading-relaxed sm:px-4 ${
                  msg.role === "user"
                    ? "ml-auto max-w-[92%] bg-primary text-primary-foreground rounded-br-md"
                    : "group flex-1 min-w-0 w-full bg-card border border-border/60 text-foreground rounded-bl-md shadow-sm"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="mb-2 flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                      <Sparkles className="h-3 w-3" /> POLY AI · formatted locally
                    </span>
                    <button
                      onClick={() => handleCopy(msg._id, msg.content)}
                      className="rounded-md px-2 py-1 text-[10px] font-medium text-muted-foreground opacity-0 transition-opacity hover:bg-slate-100 hover:text-foreground group-hover:opacity-100 focus:opacity-100"
                      aria-label="Copy answer"
                    >
                      {copiedId === msg._id ? "Copied" : "Copy"}
                    </button>
                  </div>
                )}
                {msg.role === "assistant" ? <PolyAiMessage content={msg.content} /> : <p className="whitespace-pre-wrap">{msg.content}</p>}
              </div>
              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-1">
                  <User className="h-4 w-4" />
                </div>
              )}
            </motion.div>
          ))}

          {isSending && (
            <div className="flex gap-3 mb-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-bl-md border border-border/60 bg-card px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex-none border-t border-border bg-background/80 backdrop-blur-xl">
        <div className="w-full px-3 py-2.5 sm:px-5 sm:py-3 lg:px-8">
          <div className="flex items-end gap-2 rounded-2xl border border-border/60 bg-card px-4 py-2 focus-within:border-primary/30 focus-within:ring-1 focus-within:ring-primary/10 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your subjects..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none py-1 max-h-24"
              style={{ minHeight: "24px" }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isSending}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground
                       hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground/60 text-center mt-2">
            POLY AI is an educational assistant. Verify important information with your textbooks.
          </p>
        </div>
      </div>
    </div>
  );
}
