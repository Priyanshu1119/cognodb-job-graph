import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxies /api calls to the Express backend during local development,
// so the frontend never needs to hardcode a backend URL in dev.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
