import { defineConfig } from "@playwright/test";

// Python used to run the backend; override with PYTHON if your venv differs.
const python = process.env.PYTHON ?? "../backend/.venv/bin/python";

// Drives the production-shaped server: the FastAPI backend serves the built
// SPA and the API on :8000, so tests exercise the same path users hit.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  use: { baseURL: "http://localhost:8000" },
  webServer: {
    command: `npm run build && ${python} -m uvicorn app.main:app --app-dir ../backend --port 8000`,
    url: "http://localhost:8000/api/health",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
