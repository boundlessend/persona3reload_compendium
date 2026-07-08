import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // явный современный baseline под tsconfig target ES2022
    target: "es2022",
    rollupOptions: {
      output: {
        // держим React в отдельном долгоживущем чанке от кода приложения
        // (vite 8 / rolldown принимает manualChunks только функцией)
        manualChunks: (id) =>
          /node_modules\/(react|react-dom|scheduler)\//.test(id)
            ? "react"
            : undefined,
      },
    },
  },
});
