import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PolyAiMessage } from "@/components/PolyAiMessage";
import { generatePolyAiResponse, isGenericPolyAiResponse, isLeakedPolyAiResponse, isRichPolyAiRequest, isRichPolyAiResponseForQuery, sanitizePolyAiResponse } from "@/lib/polyAi";
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
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [localMessages, setLocalMessages] = useState<{ _id: string; role: "user" | "assistant"; content: string }[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const chatHistory = useQuery(
    api.chat.getHistory,
    user ? { userId: user._id } : "skip"
  );
  const storeMessages = useMutation(api.chat.storeMessages);
  const clearHistory = useMutation(api.chat.clearHistory);
  const chatCompletion = useAction(api.aiChat.chatCompletion);
  const nextId = useRef(0);
  const messages = useMemo(() => {
    const visible: { _id: string; role: "user" | "assistant"; content: string }[] = [];
    const persistedKeys = new Set((chatHistory ?? []).map((message) => `${message.role}:${message.content}`));
    const allMessages = [
      ...(chatHistory ?? []).map((message) => ({ _id: String(message._id), role: message.role as "user" | "assistant", content: message.content })),
      ...localMessages.filter((message) => !persistedKeys.has(`${message.role}:${message.content}`)),
    ];
    for (const message of allMessages) {
      if (message.role === "user") {
        visible.push(message);
        continue;
      }
      const content = sanitizePolyAiResponse(message.content);
      const needsLocalRepair = !content || isLeakedPolyAiResponse(message.content) || isGenericPolyAiResponse(content);
      if (needsLocalRepair) {
        const lastUser = [...visible].reverse().find((item) => item.role === "user");
        if (lastUser && visible[visible.length - 1]?.role === "user") {
          visible.push({ _id: `${message._id}-local-repair`, role: "assistant", content: sanitizePolyAiResponse(generatePolyAiResponse(lastUser.content)) });
        }
        continue;
      }
      visible.push({ ...message, content });
    }
    return visible;
  }, [chatHistory, localMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isSending) return;
    setInput("");
    setIsSending(true);
    try {
      const historyMessages = messages.slice(-20).map((message) => ({
        role: message.role as "user" | "assistant",
        content: message.role === "user" ? message.content : sanitizePolyAiResponse(message.content),
      }));
      let response: string;
      try {
        const providerRawAnswer = await Promise.race<string>([
          chatCompletion({ messages: [...historyMessages, { role: "user", content }] }),
          new Promise<string>((_, reject) => window.setTimeout(() => reject(new Error("AI provider timed out")), 8000)),
        ]);
        const providerAnswer = sanitizePolyAiResponse(providerRawAnswer);
        if (!providerAnswer || isGenericPolyAiResponse(providerAnswer) || (isRichPolyAiRequest(content) && !isRichPolyAiResponseForQuery(content, providerAnswer))) {
          throw new Error("Provider returned an unsuitable answer format");
        }
        response = providerAnswer;
      } catch (providerError) {
        console.warn("External POLY AI provider unavailable; using deterministic fallback:", providerError);
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
          storeMessages({ userId: user._id, userContent: content, assistantContent: response }),
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
    if (user) {
      try {
        await clearHistory({ userId: user._id });
      } catch (error) {
        console.warn("Could not clear server history:", error);
      }
    }
  };

  return (
    <div className="h-[100svh] max-h-[100svh] overflow-hidden bg-background flex flex-col">
      {/* Nav */}
      <nav className="flex-none border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4">
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
        <div className="mx-auto w-full max-w-[1800px] px-3 py-4 sm:px-5 sm:py-5 lg:px-8">
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
                    : "group flex-1 min-w-0 w-full max-w-[1500px] bg-card border border-border/60 text-foreground rounded-bl-md shadow-sm"
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
        <div className="mx-auto w-full max-w-[1800px] px-3 py-2.5 sm:px-5 sm:py-3 lg:px-8">
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
