// Tree selection, kept as a set of keys and worked out here rather than in Reka UI's TreeRoot:
// Reka's propagateSelect/bubbleSelect leave duplicate values, only walk `children` whatever
// `getChildren` says, toggle disabled descendants and read a parent's state from its direct
// children only. Everything here is pure, so it is tested without a DOM.

export type TreeCheckedState = boolean | "indeterminate";

export interface TreeIndexEntry<T> {
  key: string;
  node: T;
  parent: string | undefined;
  level: number;
  /** Child keys. `undefined` for a leaf; `[]` for an empty or not yet loaded folder. */
  children: string[] | undefined;
  disabled: boolean;
}

export interface TreeIndex<T> {
  entries: Map<string, TreeIndexEntry<T>>;
  /** Every key, depth first, in the order the tree lists them. */
  order: string[];
  roots: string[];
  /** Keys met more than once; only the first node keeps the key. */
  duplicates: string[];
}

export interface TreeAccessors<T> {
  getKey: (item: T) => string;
  getChildren: (item: T) => T[] | undefined;
  isDisabled?: (item: T) => boolean;
}

export const defaultGetKey = (item: object): string => {
  const node = item as { id?: unknown; value?: unknown; label?: unknown };
  return String(node.id ?? node.value ?? node.label);
};

export const defaultGetChildren = <T>(item: T): T[] | undefined =>
  (item as { children?: T[] } | null | undefined)?.children;

export const buildIndex = <T>(items: readonly T[], accessors: TreeAccessors<T>): TreeIndex<T> => {
  const { getKey, getChildren, isDisabled } = accessors;
  const entries = new Map<string, TreeIndexEntry<T>>();
  const order: string[] = [];
  const duplicates: string[] = [];

  const visit = (nodes: readonly T[], parent: string | undefined, level: number): string[] => {
    const keys: string[] = [];
    for (const node of nodes) {
      const key = getKey(node);
      if (entries.has(key)) {
        duplicates.push(key);
        continue;
      }
      const entry: TreeIndexEntry<T> = {
        key,
        node,
        parent,
        level,
        children: undefined,
        disabled: isDisabled?.(node) ?? false,
      };
      entries.set(key, entry);
      order.push(key);
      keys.push(key);
      const children = getChildren(node);
      entry.children = children ? visit(children, key, level + 1) : undefined;
    }
    return keys;
  };

  const roots = visit(items, undefined, 1);
  return { entries, order, roots, duplicates };
};

const hasChildren = <T>(entry: TreeIndexEntry<T> | undefined) => (entry?.children?.length ?? 0) > 0;

/** Every key under `key`, depth first. With `enabledOnly`, a disabled node and its subtree are left out. */
export const descendantKeys = <T>(index: TreeIndex<T>, key: string, enabledOnly = false): string[] => {
  const result: string[] = [];
  const walk = (keys: readonly string[]) => {
    for (const child of keys) {
      const entry = index.entries.get(child);
      if (!entry || (enabledOnly && entry.disabled)) continue;
      result.push(child);
      if (entry.children) walk(entry.children);
    }
  };
  walk(index.entries.get(key)?.children ?? []);
  return result;
};

/** The keys of `key`'s ancestors, the root first. Empty for a root or an unknown key. */
export const ancestorKeys = <T>(index: TreeIndex<T>, key: string): string[] => {
  const result: string[] = [];
  let parent = index.entries.get(key)?.parent;
  while (parent !== undefined) {
    result.unshift(parent);
    parent = index.entries.get(parent)?.parent;
  }
  return result;
};

/** A parent is selected exactly when every child is; walked from the deepest level up. */
const settleParents = <T>(index: TreeIndex<T>, selected: Set<string>) => {
  for (let i = index.order.length - 1; i >= 0; i--) {
    const entry = index.entries.get(index.order[i]!)!;
    if (!hasChildren(entry)) continue;
    if (entry.children!.every((child) => selected.has(child))) selected.add(entry.key);
    else selected.delete(entry.key);
  }
};

/**
 * The keys that count as selected. With `cascade`, a selected parent selects its whole subtree, and
 * a parent counts as selected only while all its children do, so a model holding only leaves (or
 * only a parent) is read the same as one holding everything.
 */
export const resolveSelection = <T>(index: TreeIndex<T>, keys: Iterable<string>, cascade: boolean): Set<string> => {
  const selected = new Set(keys);
  if (!cascade) return selected;
  for (const key of [...selected]) {
    if (hasChildren(index.entries.get(key))) for (const child of descendantKeys(index, key)) selected.add(child);
  }
  settleParents(index, selected);
  return selected;
};

/** Checked, unchecked or indeterminate for every node; indeterminate only with `cascade`. */
export const checkedStates = <T>(
  index: TreeIndex<T>,
  selected: ReadonlySet<string>,
  cascade: boolean,
): Map<string, TreeCheckedState> => {
  const states = new Map<string, TreeCheckedState>();
  for (let i = index.order.length - 1; i >= 0; i--) {
    const entry = index.entries.get(index.order[i]!)!;
    if (selected.has(entry.key)) states.set(entry.key, true);
    else if (cascade && hasChildren(entry) && entry.children!.some((child) => states.get(child) !== false)) {
      states.set(entry.key, "indeterminate");
    } else states.set(entry.key, false);
  }
  return states;
};

/** The enabled leaves a click on `key` checks or unchecks, skipping disabled subtrees. */
const enabledLeaves = <T>(index: TreeIndex<T>, key: string): string[] => {
  const entry = index.entries.get(key);
  if (!entry) return [key];
  if (!hasChildren(entry)) return entry.disabled ? [] : [key];
  return descendantKeys(index, key, true).filter((child) => !hasChildren(index.entries.get(child)));
};

/**
 * Toggles `key` in a resolved selection. With `cascade`, it checks every enabled leaf under it,
 * or unchecks them once they are all checked, then settles the parents. Disabled nodes keep their state.
 */
export const toggleSelection = <T>(
  index: TreeIndex<T>,
  selected: ReadonlySet<string>,
  key: string,
  cascade: boolean,
): Set<string> => {
  const next = new Set(selected);
  if (!cascade || !index.entries.has(key)) {
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  }
  const leaves = enabledLeaves(index, key);
  const check = !leaves.every((leaf) => next.has(leaf));
  for (const leaf of leaves) {
    if (check) next.add(leaf);
    else next.delete(leaf);
  }
  settleParents(index, next);
  return next;
};

/** The selected keys in tree order; keys the index doesn't know keep their place at the end. */
export const orderedKeys = <T>(index: TreeIndex<T>, selected: ReadonlySet<string>): string[] => [
  ...index.order.filter((key) => selected.has(key)),
  ...[...selected].filter((key) => !index.entries.has(key)),
];

/** The enabled keys between `from` and `to` (both included) in the visible rows. */
export const rangeKeys = <T>(index: TreeIndex<T>, visible: readonly string[], from: string, to: string): string[] => {
  const start = visible.indexOf(from);
  const end = visible.indexOf(to);
  if (end === -1) return [];
  if (start === -1) return [to];
  const [low, high] = start <= end ? [start, end] : [end, start];
  return visible.slice(low, high + 1).filter((key) => !index.entries.get(key)?.disabled);
};
