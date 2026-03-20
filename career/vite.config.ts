import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    root: "app",
    plugins: [react()],
    base: env.VITE_BASE_PATH || "/career/",
    build: {
      outDir: "../dist",
      emptyOutDir: true
    }
  };
});
