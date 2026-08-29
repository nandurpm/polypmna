/*
 * ============================================================
 * FILE: vitest.config.ts
 * PURPOSE: Configures Node-based unit tests, aliases, file discovery, and mock cleanup.
 * ============================================================
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  test: {
    // The initial suite tests pure TypeScript helpers, so Node keeps setup small
    // and avoids requiring jsdom until component tests are added.
    environment: "node",
    include: [
      "tests/**/*.{test,spec}.{ts,tsx}",
      "src/**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: ["**/node_modules/**", "**/dist/**", "**/e2e/**"],
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    passWithNoTests: false,
    reporters: ["default"],
  },
});
