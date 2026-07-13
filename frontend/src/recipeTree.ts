import type { Persona } from "./api";
import { reverseIndex, isSpecialFusion } from "./fusion";

// узел дерева слияния: ветка (персона = a + b) или лист с причиной остановки.
// owned - есть в коллекции; base - низкоуровневый/неразложимый (cheapest-режим);
// need - не в коллекции и дальше не собрать; special/dlc - добывается отдельно
export type LeafKind = "owned" | "base" | "special" | "dlc" | "need";
export type RecipeNode =
  | { persona: Persona; a: RecipeNode; b: RecipeNode }
  | { persona: Persona; leaf: LeafKind };

// cheapest мельче (дигестируемо; каждый лист кликабелен - можно докрутить в его
// модалке), collection глубже - для точной достижимости из коллекции
const DEPTH_CHEAPEST = 3;
const DEPTH_OWNED = 5;
const LEAF_LEVEL = 20; // cheapest: персоны до этого уровня считаем «легко добыть»
const CANDIDATES = 6; // collection: сколько рецептов пробуем на узел

export function isBranch(
  node: RecipeNode,
): node is { persona: Persona; a: RecipeNode; b: RecipeNode } {
  return "a" in node;
}

// собирается ли узел целиком из коллекции (все листья owned)
export function allOwned(node: RecipeNode): boolean {
  return isBranch(node)
    ? allOwned(node.a) && allOwned(node.b)
    : node.leaf === "owned";
}

const leaf = (persona: Persona, kind: LeafKind): RecipeNode => ({
  persona,
  leaf: kind,
});

type Index = Map<number, { a: Persona; b: Persona }[]>;

// cheapest: на каждом узле берём самый дешёвый (по сумме уровней) рецепт,
// останавливаемся на низкоуровневых/неразложимых персонах или по глубине
function buildCheapest(
  target: Persona,
  index: Index,
  depth: number,
  visiting: Set<number>,
): RecipeNode {
  if (isSpecialFusion(target.query)) return leaf(target, "special");
  if (target.dlc !== 0) return leaf(target, "dlc");
  const recipes = index.get(target.id) ?? [];
  const best = recipes[0];
  if (!best || target.level <= LEAF_LEVEL || depth <= 0 || visiting.has(target.id))
    return leaf(target, "base");
  const next = new Set(visiting).add(target.id);
  return {
    persona: target,
    a: buildCheapest(best.a, index, depth - 1, next),
    b: buildCheapest(best.b, index, depth - 1, next),
  };
}

// collection: ищем рецепт, чьи обе стороны раскладываются до owned; иначе -
// лучший best-effort (самый дешёвый), где недостающие листья помечены need
function buildOwned(
  target: Persona,
  index: Index,
  owned: Set<string>,
  depth: number,
  visiting: Set<number>,
): RecipeNode {
  if (owned.has(target.query)) return leaf(target, "owned");
  if (isSpecialFusion(target.query)) return leaf(target, "special");
  if (target.dlc !== 0) return leaf(target, "dlc");
  const recipes = index.get(target.id) ?? [];
  if (!recipes.length || depth <= 0 || visiting.has(target.id))
    return leaf(target, "need");
  const next = new Set(visiting).add(target.id);
  let fallback: RecipeNode | null = null;
  for (const recipe of recipes.slice(0, CANDIDATES)) {
    const a = buildOwned(recipe.a, index, owned, depth - 1, next);
    const b = buildOwned(recipe.b, index, owned, depth - 1, next);
    const node: RecipeNode = { persona: target, a, b };
    if (allOwned(a) && allOwned(b)) return node;
    if (!fallback) fallback = node;
  }
  return fallback ?? leaf(target, "need");
}

// многошаговое дерево слияния до target. owned=null - cheapest-режим (снизу
// вверх до низкоуровневых); owned=Set - собрать из отмеченных в коллекции
export function buildRecipeTree(
  target: Persona,
  personas: Persona[],
  owned: Set<string> | null,
): RecipeNode {
  const index = reverseIndex(personas);
  return owned
    ? buildOwned(target, index, owned, DEPTH_OWNED, new Set())
    : buildCheapest(target, index, DEPTH_CHEAPEST, new Set());
}
