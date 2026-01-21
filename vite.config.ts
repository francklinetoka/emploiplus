// vite.config.ts (à la racine)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    port: 5173,
    host: "0.0.0.0",
    open: true,
    hmr: {
      host: "192.168.0.14",
      port: 5173,
      protocol: "ws",
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false, // Disabled in production
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["@supabase/supabase-js"],
  },
  plugins: [react()],
});