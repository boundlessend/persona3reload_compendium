// postbuild-шаг: для каждого маршрута /persona/<query> кладём копию собранного
// dist/index.html с персональной мета (title/description/canonical/og), чтобы
// краулеры и OG-скраперы соцсетей видели корректные теги для каждой персоны.
// SPA-шелл и ассеты те же (абсолютные пути), клиентский роутинг не меняется.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(here, "../dist");
const SITE = "https://persona-compendium-1zox.onrender.com";

const shell = readFileSync(resolve(DIST, "index.html"), "utf8");
const personas = JSON.parse(readFileSync(resolve(DIST, "personas.json"), "utf8"));

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function collapse(text, max) {
  const clean = String(text).replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

// заменить тег, найденный по устойчивому паттерну; бросаем, если шелл изменился
// и паттерн не совпал (чтобы не выпускать молча неверную мету)
function replaceTag(html, pattern, replacement) {
  if (!pattern.test(html)) {
    throw new Error(`prerender-meta: pattern not found in shell: ${pattern}`);
  }
  return html.replace(pattern, replacement);
}

function personalise(html, { title, description, url }) {
  let out = replaceTag(
    html,
    /<title>[\s\S]*?<\/title>/,
    `<title>${escapeHtml(title)}</title>`,
  );
  out = replaceTag(
    out,
    /<meta\s+name="description"[\s\S]*?>/,
    `<meta name="description" content="${escapeHtml(description)}" />`,
  );
  out = replaceTag(
    out,
    /<link\s+rel="canonical"[\s\S]*?>/,
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
  );
  out = replaceTag(
    out,
    /<meta\s+property="og:url"[\s\S]*?>/,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
  );
  out = replaceTag(
    out,
    /<meta\s+property="og:title"[\s\S]*?>/,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
  );
  out = replaceTag(
    out,
    /<meta\s+property="og:description"[\s\S]*?>/,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
  );
  return out;
}

let count = 0;
for (const persona of personas) {
  const title = `${persona.name} · Persona Compendium · Persona 3 Reload`;
  const description = collapse(
    persona.description ||
      `${persona.name}: ${persona.arcana} arcana persona from Persona 3 Reload.`,
    180,
  );
  const url = `${SITE}/persona/${encodeURIComponent(persona.query)}`;
  const dir = resolve(DIST, "persona", persona.query);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, "index.html"), personalise(shell, { title, description, url }));
  count += 1;
}

console.log(`prerendered meta for ${count} persona routes -> dist/persona/<query>/index.html`);
