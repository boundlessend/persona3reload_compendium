import { defineConfig } from "@playwright/test";

// Drives the production-shaped server: the FastAPI backend serves the built
// SPA and the API on :8000, so tests exercise the same path users hit.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  use: { baseURL: "http://localhost:8000" },
  webServer: {
    command:
      "npm run build && ../backend/.venv/bin/python -m uvicorn app.main:app --app-dir ../backend --port 8000",
    url: "http://localhost:8000/api/health",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
