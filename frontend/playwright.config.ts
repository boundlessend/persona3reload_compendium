import { defineConfig } from "@playwright/test";

// Drives the static build: `vite preview` serves the same dist/ bundle that
// ships to the static host (SPA history fallback + generated personas.json),
// so tests exercise exactly what users hit. No backend required.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  use: { baseURL: "http://localhost:4173" },
  webServer: {
    command: "npm run build && npm run preview -- --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
