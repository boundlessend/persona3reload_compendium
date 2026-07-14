// postbuild-шаг: для каждого маршрута /persona/<query> кладём копию собранного
// dist/index.html с персональной мета (title/description/canonical/og), чтобы
// краулеры и OG-скраперы соцсетей видели корректные теги для каждой персоны.
// SPA-шелл и ассеты те же (абсолютные пути), клиентский роутинг не меняется.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(here, "../dist");
const SITE = "https://persona-compendium-1zox.onrender.com";

const shell = readFileSync(resolve(DIST, "index.html"), "utf8");
const personas = JSON.parse(readFileSync(resolve(DIST, "personas.json"), "utf8"));

// preload the display face (Archivo Black): it renders the LCP hero heading, so
// fetch it in parallel with the JS/CSS graph instead of after @fontsource loads.
// hashed filename resolved from the build output; throw if it moved (drift guard)
const displayFont = readdirSync(resolve(DIST, "assets")).find((file) =>
  /^archivo-black-latin-400-normal-.*\.woff2$/.test(file),
);
if (!displayFont) {
  throw new Error("prerender-meta: Archivo Black woff2 not found in dist/assets");
}
const shellPreloaded = shell.replace(
  "</head>",
  `<link rel="preload" href="/assets/${displayFont}" as="font" type="font/woff2" crossorigin /></head>`,
);

// версионируем service worker хешем главного бандла: sw.js меняется побайтово
// только при изменении кода, поэтому браузер видит новый SW ровно на новом
// деплое (иначе update-prompt не сработал бы - sw.js оставался бы неизменным)
const mainBundle = readdirSync(resolve(DIST, "assets")).find((file) =>
  /^index-.*\.js$/.test(file),
);
if (!mainBundle) {
  throw new Error("prerender-meta: main index-*.js bundle not found in dist/assets");
}
const swPath = resolve(DIST, "sw.js");
const swSource = readFileSync(swPath, "utf8");
if (!swSource.includes('"p3r-v1"')) {
  throw new Error('prerender-meta: cache version token "p3r-v1" not found in sw.js');
}
const swHash = mainBundle.replace(/^index-|\.js$/g, "");
writeFileSync(swPath, swSource.replace('"p3r-v1"', `"p3r-${swHash}"`));

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
  out = replaceTag(
    out,
    /<meta\s+name="twitter:title"[\s\S]*?>/,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
  );
  out = replaceTag(
    out,
    /<meta\s+name="twitter:description"[\s\S]*?>/,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
  );
  return out;
}

// структурированные данные (JSON-LD). инлайн-<script type="application/ld+json">
// не исполняется как JS, поэтому CSP script-src 'self' его не блокирует. экранируем
// < > & чтобы данные не могли закрыть <script> досрочно
function ldScript(node) {
  const json = JSON.stringify(node)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
  return `<script type="application/ld+json">${json}</script>`;
}
function injectLd(html, nodes) {
  if (!nodes.length) return html;
  if (!html.includes("</head>")) {
    throw new Error("prerender-meta: </head> not found for JSON-LD injection");
  }
  return html.replace("</head>", `${nodes.map(ldScript).join("")}</head>`);
}

const HOME = { name: "Home", url: `${SITE}/` };
const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Persona Compendium",
  url: `${SITE}/`,
  description:
    "A compendium of every persona in Persona 3 Reload: arcana, stats, elemental affinities, fusion recipes and skills.",
};
function breadcrumbLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ItemList для листингов, у которых элементы имеют собственные detail-URL: даёт
// краулеру машиночитаемый индекс страниц персон/аркан. Листинги без detail-роутов
// (skills/bosses/requests) намеренно без ItemList - ссылок нет, SEO-ценности ноль
function itemListLd(name, entries) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: entries.length,
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      url: entry.url,
    })),
  };
}

// shellWithLd (WebSite-узел) - база для всех detail-копий; главная дополнительно
// получает ItemList своего каталога персон, чтобы он не протёк на detail-страницы
const shellWithLd = injectLd(shellPreloaded, [websiteLd]);
const personasItemList = itemListLd(
  "Personas of Persona 3 Reload",
  personas.map((persona) => ({
    name: persona.name,
    url: `${SITE}/persona/${encodeURIComponent(persona.query)}/`,
  })),
);
writeFileSync(resolve(DIST, "index.html"), injectLd(shellWithLd, [personasItemList]));

let count = 0;
for (const persona of personas) {
  const title = `${persona.name} · Persona Compendium · Persona 3 Reload`;
  const description = collapse(
    persona.description ||
      `${persona.name}: ${persona.arcana} arcana persona from Persona 3 Reload.`,
    180,
  );
  // хвостовой слэш: Render отдаёт prerender-файл только по /persona/<query>/,
  // поэтому canonical/og:url и приложение (pushState) используют слэш
  const url = `${SITE}/persona/${encodeURIComponent(persona.query)}/`;
  const dir = resolve(DIST, "persona", persona.query);
  mkdirSync(dir, { recursive: true });
  const personaLd = {
    "@context": "https://schema.org",
    "@type": "Thing",
    name: persona.name,
    description,
    image: `${SITE}${persona.image}`,
    url,
  };
  writeFileSync(
    resolve(dir, "index.html"),
    injectLd(personalise(shellWithLd, { title, description, url }), [
      breadcrumbLd([HOME, { name: persona.name, url }]),
      personaLd,
    ]),
  );
  count += 1;
}

// арканы: /arcana/ (индекс) и /arcana/<slug>/ - мета из personas.json (список и
// счётчики), тело страниц рисует клиент из src/arcanaGuide.ts
const arcanaCounts = new Map();
const arcanaOrder = [];
for (const persona of personas) {
  if (!arcanaCounts.has(persona.arcana)) arcanaOrder.push(persona.arcana);
  arcanaCounts.set(persona.arcana, (arcanaCounts.get(persona.arcana) ?? 0) + 1);
}

const arcanaIndexDir = resolve(DIST, "arcana");
mkdirSync(arcanaIndexDir, { recursive: true });
writeFileSync(
  resolve(arcanaIndexDir, "index.html"),
  injectLd(
    personalise(shellWithLd, {
      title: "The Arcana · Persona Compendium · Persona 3 Reload",
      description: collapse(
        `All ${arcanaOrder.length} arcana of Persona 3 Reload, each with its Social Link and personas.`,
        180,
      ),
      url: `${SITE}/arcana/`,
    }),
    [
      breadcrumbLd([HOME, { name: "The Arcana", url: `${SITE}/arcana/` }]),
      itemListLd(
        "The Arcana of Persona 3 Reload",
        arcanaOrder.map((arcana) => ({
          name: `${arcana} Arcana`,
          url: `${SITE}/arcana/${encodeURIComponent(arcana.toLowerCase())}/`,
        })),
      ),
    ],
  ),
);

let arcanaCount = 0;
for (const arcana of arcanaOrder) {
  const slug = arcana.toLowerCase();
  const title = `${arcana} Arcana · Persona Compendium · Persona 3 Reload`;
  const description = collapse(
    `The ${arcana} arcana in Persona 3 Reload: ${arcanaCounts.get(arcana)} personas with stats and elemental affinities.`,
    180,
  );
  const url = `${SITE}/arcana/${encodeURIComponent(slug)}/`;
  const dir = resolve(arcanaIndexDir, slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    resolve(dir, "index.html"),
    injectLd(personalise(shellWithLd, { title, description, url }), [
      breadcrumbLd([
        HOME,
        { name: "The Arcana", url: `${SITE}/arcana/` },
        { name: `${arcana} Arcana`, url },
      ]),
    ]),
  );
  arcanaCount += 1;
}

// каталог скиллов /skills/
const skillsDir = resolve(DIST, "skills");
mkdirSync(skillsDir, { recursive: true });
writeFileSync(
  resolve(skillsDir, "index.html"),
  injectLd(
    personalise(shellWithLd, {
      title: "Skills · Persona Compendium · Persona 3 Reload",
      description: collapse(
        "Every skill personas learn in Persona 3 Reload, with element and target.",
        180,
      ),
      url: `${SITE}/skills/`,
    }),
    [breadcrumbLd([HOME, { name: "Skills", url: `${SITE}/skills/` }])],
  ),
);

// гайд по именованию скиллов /skills/guide/
const skillsGuideDir = resolve(skillsDir, "guide");
mkdirSync(skillsGuideDir, { recursive: true });
writeFileSync(
  resolve(skillsGuideDir, "index.html"),
  injectLd(
    personalise(shellWithLd, {
      title: "How skills work · Persona Compendium · Persona 3 Reload",
      description: collapse(
        "How Persona 3 Reload skill names are built: element roots, the Ma- prefix, power tiers, buffs, debuffs and recovery.",
        180,
      ),
      url: `${SITE}/skills/guide/`,
    }),
    [
      breadcrumbLd([
        HOME,
        { name: "Skills", url: `${SITE}/skills/` },
        { name: "How skills work", url: `${SITE}/skills/guide/` },
      ]),
    ],
  ),
);

// справочник боссов /bosses/
const bossesDir = resolve(DIST, "bosses");
mkdirSync(bossesDir, { recursive: true });
writeFileSync(
  resolve(bossesDir, "index.html"),
  injectLd(
    personalise(shellWithLd, {
      title: "Bosses · Persona Compendium · Persona 3 Reload",
      description: collapse(
        "Story bosses of Persona 3 Reload with their elemental weaknesses and resistances.",
        180,
      ),
      url: `${SITE}/bosses/`,
    }),
    [breadcrumbLd([HOME, { name: "Bosses", url: `${SITE}/bosses/` }])],
  ),
);

// запросы Элизабет /requests/
const requestsDir = resolve(DIST, "requests");
mkdirSync(requestsDir, { recursive: true });
writeFileSync(
  resolve(requestsDir, "index.html"),
  injectLd(
    personalise(shellWithLd, {
      title: "Elizabeth's Requests · Persona Compendium · Persona 3 Reload",
      description: collapse(
        "All 101 of Elizabeth's Requests in Persona 3 Reload, with rewards, deadlines and missable flags.",
        180,
      ),
      url: `${SITE}/requests/`,
    }),
    [breadcrumbLd([HOME, { name: "Elizabeth's Requests", url: `${SITE}/requests/` }])],
  ),
);

console.log(
  `prerendered meta for ${count} persona routes + ${arcanaCount} arcana routes + skills + guide + bosses + requests -> dist/`,
);
