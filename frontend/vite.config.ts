import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // держим React в отдельном долгоживущем чанке от кода приложения
        manualChunks: { react: ["react", "react-dom"] },
      },
    },
  },
});
