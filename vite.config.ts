import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
// https://vite.dev/config/
export default defineConfig({
  plugins: [wasm(), topLevelAwait(), svelte()],
  optimizeDeps: {
    exclude: ["wasm-qrcode"],
  },
  server: {},
});
