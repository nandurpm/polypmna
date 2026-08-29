/*
 * ============================================================
 * FILE: AskAI.tsx
 * PURPOSE: Implements the authenticated POLY AI chat workspace, streaming state, local fallback, persistence, and user controls.
 * ============================================================
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { PolyAiMessage } from "@/components/PolyAiMessage";
import { POLY_AI_SCOPE_RESPONSE, generatePolyAiResponse, isGenericPolyAiResponse, isLeakedPolyAiResponse, isPolyAiQueryInScope, sanitizePolyAiResponse } from "@/lib/polyAi";
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
  // ============================================================
  // AUTHENTICATION, LOCAL STATE, AND CONVEX STREAMS
  // ============================================================

  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [input, setInput] = useState(() => loadPolyAiState().preferences.draft);
  const [isSending, setIsSending] = useState(false);
  const [localMessages, setLocalMessages] = useState<{ _id: string; role: "user" | "assistant"; content: string; source?: "provider" | "local" }[]>(() => loadPolyAiState().messages);
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
  const startChatStream = useAction(api.aiChat.startChatStream);
  const nextId = useRef(0);
  const [activeStreamId, setActiveStreamId] = useState<Id<"aiStreams"> | null>(null);
  const activeStreamRef = useRef<{ streamId: Id<"aiStreams">; messageId: string; userContent: string } | null>(null);
  const streamState = useQuery(
    api.chat.getAiStream,
    activeStreamId ? { streamId: activeStreamId } : "skip",
  );
  const allMessages = useMemo(() => {
    const visible: { _id: string; role: "user" | "assistant"; content: string; source?: "provider" | "local" }[] = [];
    const mergedMessages = [
      ...(chatHistory ?? []).map((message: { _id: string; role: string; content: string }) => ({ _id: String(message._id), role: message.role as "user" | "assistant", content: message.content, source: undefined as "provider" | "local" | undefined })),
      ...localMessages,
    ];
    const seenExchanges = new Set<string>();
    let pendingUser: (typeof visible)[number] | null = null;
    for (const message of mergedMessages) {
      if (message.role === "user") {
        visible.push(message);
        pendingUser = message;
        continue;
      }

      const content = sanitizePolyAiResponse(message.content);
      const isLegacyScopeRefusal = content === POLY_AI_SCOPE_RESPONSE;
      const needsLocalRepair = !content || isLegacyScopeRefusal || isLeakedPolyAiResponse(message.content) || isGenericPolyAiResponse(content);
      let repairedContent = content;
      let repairedId = message._id;
      let repairedSource = message.source;
      if (needsLocalRepair) {
        if (pendingUser) {
          repairedContent = sanitizePolyAiResponse(generatePolyAiResponse(pendingUser.content));
          repairedId = `${message._id}-local-repair`;
          repairedSource = "local";
        } else {
          // Invalid assistant records without a paired user are stale/orphaned.
          continue;
        }
      }
      if (pendingUser) {
        const exchangeKey = `${pendingUser.content}\u0000${repairedContent}`;
        if (seenExchanges.has(exchangeKey)) {
          const previousExchangeIndex = visible.findIndex((item, index) => (
            item.role === "user"
            && item.content === pendingUser?.content
            && visible[index + 1]?.role === "assistant"
            && visible[index + 1]?.content === repairedContent
          ));
          if (previousExchangeIndex >= 0) visible.splice(previousExchangeIndex, 2);
        }
        seenExchanges.add(exchangeKey);
        pendingUser = null;
      }
      visible.push({ ...message, _id: repairedId, content: repairedContent, source: repairedSource });
    }
    const normalized: typeof visible = [];
    for (let index = 0; index < visible.length; index += 1) {
      const message = visible[index];
      normalized.push(message);
      if (message.role === "user" && visible[index + 1]?.role !== "assistant") {
        normalized.push({
          _id: `${message._id}-orphan-repair`,
          role: "assistant",
          content: sanitizePolyAiResponse(generatePolyAiResponse(message.content)),
          source: "local",
        });
      }
    }
    return normalized;
  }, [chatHistory, localMessages]);
  const hiddenMessageCount = Math.max(0, allMessages.length - 16);
  const messages = showOlderMessages ? allMessages : allMessages.slice(-16);

  // Keep the visible transcript, browser persistence, and active Convex
  // stream synchronized without losing a usable local fallback.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    savePolyAiState({
      messages: localMessages,
      preferences: { draft: input, renderer: "rich-local" },
    });
  }, [input, localMessages]);

  useEffect(() => {
    const active = activeStreamRef.current;
    if (!active || !streamState) return;
    const streamedContent = sanitizePolyAiResponse(streamState.content);
    if (streamedContent) {
      setLocalMessages((current) => current.map((message) => (
        message._id === active.messageId
          ? { ...message, content: streamedContent, source: "provider" }
          : message
      )));
    }
    if (streamState.status === "completed") {
      const finalContent = streamedContent || sanitizePolyAiResponse(generatePolyAiResponse(active.userContent));
      setLocalMessages((current) => current.map((message) => (
        message._id === active.messageId
          ? { ...message, content: finalContent, source: "provider" }
          : message
      )));
      setProviderError(null);
      setIsSending(false);
      activeStreamRef.current = null;
      setActiveStreamId(null);
      void Promise.race([
        storeMessages({ userContent: active.userContent, assistantContent: finalContent }),
        new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error("Chat history save timed out")), 5000)),
      ]).catch((persistError) => console.warn("Could not persist streamed chat history; local answer remains visible:", persistError));
      inputRef.current?.focus();
    } else if (streamState.status === "failed") {
      const fallback = sanitizePolyAiResponse(generatePolyAiResponse(active.userContent));
      setLocalMessages((current) => current.map((message) => (
        message._id === active.messageId
          ? { ...message, content: fallback, source: "local" }
          : message
      )));
      setProviderError("The external AI provider did not finish streaming. This answer was generated offline; please retry shortly.");
      setIsSending(false);
      activeStreamRef.current = null;
      setActiveStreamId(null);
      void Promise.race([
        storeMessages({ userContent: active.userContent, assistantContent: fallback }),
        new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error("Chat history save timed out")), 5000)),
      ]).catch((persistError) => console.warn("Could not persist fallback chat history; local answer remains visible:", persistError));
      inputRef.current?.focus();
    }
  }, [streamState, storeMessages]);

  // ============================================================
  // MESSAGE ACTIONS
  // ============================================================

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isSending || isAuthLoading) return;
    setProviderError(null);
    setInput("");
    setIsSending(true);
    nextId.current += 1;
    const id = String(nextId.current);
    const messageId = `${id}-assistant`;
    const userMessage = { _id: `${id}-user`, role: "user" as const, content };

    if (!isPolyAiQueryInScope(content)) {
      const response = POLY_AI_SCOPE_RESPONSE;
      setLocalMessages((current) => [...current, userMessage, { _id: messageId, role: "assistant" as const, content: response, source: "local" as const }]);
      setIsSending(false);
      inputRef.current?.focus();
      if (user) {
        void Promise.race([
          storeMessages({ userContent: content, assistantContent: response }),
          new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error("Chat history save timed out")), 5000)),
        ]).catch((persistError) => console.warn("Could not persist chat history; local answer remains visible:", persistError));
      }
      return;
    }

    setLocalMessages((current) => [...current, userMessage, {
      _id: messageId,
      role: "assistant" as const,
      content: "Receiving the first streamed tokens…",
      source: "provider" as const,
    }]);

    try {
      const historyMessages = messages.slice(-8).map((message) => ({
        role: message.role as "user" | "assistant",
        content: (message.role === "user" ? message.content : sanitizePolyAiResponse(message.content)).slice(-5000),
      }));
      const streamId = await Promise.race<Id<"aiStreams">>([
        startChatStream({ messages: [...historyMessages, { role: "user", content }] }),
        new Promise<Id<"aiStreams">>((_, reject) => window.setTimeout(() => reject(new Error("AI stream could not start")), 10_000)),
      ]);
      activeStreamRef.current = { streamId, messageId, userContent: content };
      setActiveStreamId(streamId);
    } catch (error) {
      console.warn("Could not start streamed POLY AI response; using deterministic fallback:", error);
      const fallback = sanitizePolyAiResponse(generatePolyAiResponse(content));
      setLocalMessages((current) => current.map((message) => (
        message._id === messageId ? { ...message, content: fallback, source: "local" } : message
      )));
      setProviderError("The external AI stream could not start. This answer was generated offline; please retry shortly.");
      setIsSending(false);
      inputRef.current?.focus();
      if (user) {
        void Promise.race([
          storeMessages({ userContent: content, assistantContent: fallback }),
          new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error("Chat history save timed out")), 5000)),
        ]).catch((persistError) => console.warn("Could not persist fallback chat history; local answer remains visible:", persistError));
      }
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

  // ============================================================
  // CHAT WORKSPACE
  // ============================================================

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
              <p className="font-semibold">External AI unavailable — showing an offline answer</p>
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
                    disabled={isAuthLoading || isSending}
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

          {messages.map((msg: { _id: string; role: string; content: string; source?: "provider" | "local" }, i: number) => (
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
                      <Sparkles className="h-3 w-3" /> POLY AI · {msg.source === "provider" ? "AI answer" : msg.source === "local" ? "offline answer" : "answer"}
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
              disabled={!input.trim() || isSending || isAuthLoading}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground
                       hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
              <p className="text-[11px] text-muted-foreground/60 text-center mt-2">
            {isAuthLoading ? "Preparing a secure session…" : "POLY AI is an educational assistant. Verify important information with your textbooks."}
          </p>
        </div>
      </div>
    </div>
  );
}
