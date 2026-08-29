/*
 * ============================================================
 * FILE: postcss.config.cjs
 * PURPOSE: Prevents an unrelated parent PostCSS configuration from interfering with the Tailwind v4 Vite build.
 * ============================================================
 */

// Tailwind v4 is loaded by @tailwindcss/vite in vite.config.ts.
// Keep the parent web app's Tailwind v3 PostCSS config from leaking into the
// standalone template when it is built from this repository.
module.exports = {
  plugins: {},
};
