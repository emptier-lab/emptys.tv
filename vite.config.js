import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  define: {
    "process.env": {},
  },
  server: {
    port: 3000,
    open: true,
    cors: true,
    hmr: {
      overlay: false,
    },
  },
  build: {
    target: "esnext",
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["vue", "vue-router", "pinia"],
          utils: ["axios"],
        },
      },
    },
  },
  optimizeDeps: {
    include: ["vue", "vue-router", "pinia", "axios"],
  },
  css: {
    preprocessorOptions: {
      scss: {},
    },
  },
});
