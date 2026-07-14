import type { RecipeNode, LeafKind } from "./recipeTree";
import { isBranch } from "./recipeTree";

// подпись листа (для cheapest-режима base не подписываем - это просто ингредиент)
const LEAF_TAG: Partial<Record<LeafKind, string>> = {
  owned: "✓ owned",
  need: "· need",
  special: "· special recipe",
  dlc: "· DLC",
};

function Node({ node }: { node: RecipeNode }) {
  const persona = node.persona;
  const tag = isBranch(node) ? undefined : LEAF_TAG[node.leaf];
  const color = isBranch(node)
    ? "text-ink"
    : node.leaf === "owned"
      ? "text-ink"
      : node.leaf === "need"
        ? "text-blood"
        : node.leaf === "base"
          ? "text-ink"
          : "text-mut";

  return (
    <li>
      <span className={color}>
        <a
          href={`/persona/${encodeURIComponent(persona.query)}/`}
          className="hover:text-blood hover:underline"
        >
          {persona.name}
        </a>
        <span className="text-mut">
          {" "}
          Lv{persona.level}
          {tag ? ` ${tag}` : ""}
        </span>
      </span>
      {isBranch(node) && (
        <ul className="recipe-branch mt-1">
          <Node node={node.a} />
          <Node node={node.b} />
        </ul>
      )}
    </li>
  );
}

// дерево слияния до целевой персоны (см. recipeTree.ts). каждый узел -
// ссылка на персону (можно докрутить в её модалке)
export function RecipeTree({ node }: { node: RecipeNode }) {
  return (
    <ul className="font-mono text-xs">
      <Node node={node} />
    </ul>
  );
}
