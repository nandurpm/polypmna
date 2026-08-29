/*
 * ============================================================
 * FILE: polyAiStorage.ts
 * PURPOSE: Loads, saves, and clears versioned local POLY AI history and preference state.
 * ============================================================
 */

export type LocalPolyAiMessage = {
  _id: string;
  role: "user" | "assistant";
  content: string;
  source?: "provider" | "local";
};

export type LocalPolyAiPreferences = {
  draft: string;
  renderer: "rich-local";
};

export type LocalPolyAiState = {
  messages: LocalPolyAiMessage[];
  preferences: LocalPolyAiPreferences;
};

const STORAGE_KEY = "polypmna:poly-ai:v2";
const DEFAULT_PREFERENCES: LocalPolyAiPreferences = {
  draft: "",
  renderer: "rich-local",
};

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadPolyAiState(): LocalPolyAiState {
  if (!canUseLocalStorage()) {
    return { messages: [], preferences: DEFAULT_PREFERENCES };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { messages: [], preferences: DEFAULT_PREFERENCES };
    const parsed = JSON.parse(raw) as Partial<LocalPolyAiState>;
    const messages = Array.isArray(parsed.messages)
      ? parsed.messages.filter((message): message is LocalPolyAiMessage => (
        Boolean(message)
        && (message.role === "user" || message.role === "assistant")
        && typeof message._id === "string"
        && typeof message.content === "string"
        && (message.source === undefined || message.source === "provider" || message.source === "local")
      ))
      : [];
    const preferences = parsed.preferences && typeof parsed.preferences === "object"
      ? {
        ...DEFAULT_PREFERENCES,
        draft: typeof parsed.preferences.draft === "string" ? parsed.preferences.draft : "",
      }
      : DEFAULT_PREFERENCES;
    return { messages, preferences };
  } catch (error) {
    console.warn("Could not read local POLY AI state:", error);
    return { messages: [], preferences: DEFAULT_PREFERENCES };
  }
}

export function savePolyAiState(state: LocalPolyAiState) {
  if (!canUseLocalStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      messages: state.messages.slice(-120),
      preferences: {
        ...DEFAULT_PREFERENCES,
        ...state.preferences,
      },
    }));
  } catch (error) {
    console.warn("Could not save local POLY AI state:", error);
  }
}

export function clearPolyAiState() {
  if (!canUseLocalStorage()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Could not clear local POLY AI state:", error);
  }
}

export { STORAGE_KEY as POLY_AI_STORAGE_KEY };
