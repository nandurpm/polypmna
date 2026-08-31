import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  // Freebuff serves at the domain root; GitHub Pages builds pass
  // VITE_BASE_PATH=/polypmna/ for the repository subpath.
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "./src"),
    },
    // Keep one React copy across the application and its dependencies.
    dedupe: ["react", "react/jsx-runtime", "react-dom", "react-dom/client"],
  },
  build: {
    // Enable source maps for better debugging (disable in production if needed)
    sourcemap: false,
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching and lazy loading.
        // Vite 8 / Rolldown requires the function form here.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (/(^|\\/)node_modules\\/(react|react-dom|react-router)(\\/|$)/.test(id)) return 'react-vendor';
          if (/(^|\\/)node_modules\\/convex(\\/|$)/.test(id)) return 'convex-vendor';
          if (/(^|\\/)node_modules\\/@radix-ui\\//.test(id)) return 'radix-ui';
          if (/(^|\\/)node_modules\\/framer-motion(\\/|$)/.test(id)) return 'framer-motion';
          if (/(^|\\/)node_modules\\/recharts(\\/|$)/.test(id)) return 'charts';
          if (/(^|\\/)node_modules\\/(react-hook-form|@hookform\\/resolvers|zod)(\\/|$)/.test(id)) return 'forms';
          return undefined;
        },
        // Optimize chunk size
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Increase chunk size warning limit for better chunking
    chunkSizeWarningLimit: 1000,
    // Target modern browsers for better optimization
    target: 'esnext',
    // Minify options - using esbuild (faster than terser)
    minify: 'esbuild',
  },
  // Optimize dependencies
  optimizeDeps: {
    // Only scan the app entry HTML; avoids crawling unrelated *.html files
    // if a legacy snapshot accidentally contains leaked package folders.
    entries: ['index.html'],
    include: [
      'react',
      'react/jsx-runtime',
      'react-dom',
      'react-dom/client',
      'react-router',
      '@convex-dev/auth/react',
      'framer-motion',
    ],
  },
  // Performance hints
  server: {
    // Bind to all interfaces so WebContainer's server-ready event fires.
    host: true,
    port: 5173,
    hmr: false,
  },
});
