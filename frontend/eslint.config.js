import js from "@eslint/js";
import tseslint from "typescript-eslint";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

// линтим только приложение (src). node-скрипты, e2e и сборка вне скоупа.
// tsc уже ловит типы - eslint здесь добавляет hooks-правила и a11y-проверки
export default tseslint.config(
  { ignores: ["dist", "e2e", "scripts", "public", "*.config.js"] },
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: { globals: globals.browser },
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // модалки закрываются с клавиатуры через Escape (useDialog); клик по
      // фону-бэкдропу и stopPropagation на панели - мышиная добавка, вешать на
      // них keyboard-обработчики неверно, поэтому эти три правила выключены
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-static-element-interactions": "off",
      "jsx-a11y/no-noninteractive-element-interactions": "off",
    },
  },
);
