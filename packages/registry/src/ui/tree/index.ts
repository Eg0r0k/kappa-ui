import { type VariantProps, cva } from "class-variance-authority";
import { createContext } from "reka-ui";
import type { Component, ComputedRef } from "vue";

import { type TreeCheckedState, ancestorKeys, buildIndex, defaultGetChildren, defaultGetKey } from "./selection";

export { default as Tree } from "./Tree.vue";
export { default as TreeItem } from "./TreeItem.vue";
export { default as TreeItemCheckbox } from "./TreeItemCheckbox.vue";
export { default as TreeItemIcon } from "./TreeItemIcon.vue";
export { default as TreeItemLabel } from "./TreeItemLabel.vue";
export { default as TreeItemToggle } from "./TreeItemToggle.vue";
export type { FlattenedItem as TreeFlattenedItem, TreeItemSelectEvent, TreeItemToggleEvent } from "reka-ui";
export type { TreeCheckedState } from "./selection";

/** The fields the default rows read. Any other field rides along for slots and `getKey`. */
export interface TreeNode {
  id?: string | number;
  label?: string;
  /** A component, such as a Lucide icon, shown before the label. */
  icon?: Component;
  /** `undefined` makes a leaf; `[]` a folder that is empty or not loaded yet. */
  children?: TreeNode[];
  disabled?: boolean;
  /** Shows a spinner in place of the chevron and sets `aria-busy` while children load. */
  loading?: boolean;
  /** Starts expanded when the tree has no `expanded` or `defaultExpanded`. */
  defaultExpanded?: boolean;
  [key: string]: unknown;
}

/** Reads the fields the default rows use from any node shape. */
export const fields = (item: object) => item as Pick<TreeNode, "icon" | "disabled" | "loading" | "defaultExpanded">;

export interface TreeVirtualizeOptions {
  /** Rows rendered past each edge of the view. 12 by default. */
  overscan?: number;
  /** Row height in pixels. Measured from `--tree-item-height` by default. */
  estimateSize?: number;
}

export interface TreeItemSlotProps<T = TreeNode> {
  item: T;
  level: number;
  expanded: boolean;
  selected: boolean;
  checked: TreeCheckedState;
  disabled: boolean;
  loading: boolean;
  hasChildren: boolean;
  select: () => void;
  toggle: () => void;
}

export interface TreeExpose {
  /** The element with `role="tree"`. */
  $el: HTMLElement | undefined;
  /** Expands every node that has children. */
  expandAll: () => void;
  /** Collapses every node. */
  collapseAll: () => void;
  /** Scrolls a visible node into view, rendering it first when virtualized. Returns whether it is visible. */
  scrollToKey: (key: string) => boolean;
}

export const treeVariants = cva(
  "group/tree flex flex-col outline-none [--tree-indent:calc(var(--tree-icon)+var(--tree-item-gap))]",
  {
    variants: {
      variant: {
        ghost: "",
        outline: `
          rounded-xl border border-border bg-card p-1 text-card-foreground [--scroll-fade-color:var(--card)]
          aria-invalid:border-destructive
          data-disabled:border-foreground/(--disabled-container-opacity)
        `,
      },
      size: {
        xs: `
          text-body-sm [--tree-item-height:var(--control-height-xs)] [--tree-item-px:var(--control-padding-xs)]
          [--tree-item-py:--spacing(1.5)] [--tree-item-gap:var(--control-gap-xs)] [--tree-icon:var(--control-icon-xs)]
        `,
        sm: `
          text-body-sm [--tree-item-height:var(--control-height-sm)] [--tree-item-px:var(--control-padding-sm)]
          [--tree-item-py:--spacing(2)] [--tree-item-gap:var(--control-gap-sm)] [--tree-icon:var(--control-icon-sm)]
        `,
        md: `
          text-body-md [--tree-item-height:var(--control-height-md)] [--tree-item-px:var(--control-padding-md)]
          [--tree-item-py:--spacing(2)] [--tree-item-gap:var(--control-gap-md)] [--tree-icon:var(--control-icon-md)]
        `,
        lg: `
          text-body-lg [--tree-item-height:var(--control-height-lg)] [--tree-item-px:var(--control-padding-lg)]
          [--tree-item-py:--spacing(2)] [--tree-item-gap:var(--control-gap-lg)] [--tree-icon:var(--control-icon-lg)]
        `,
        xl: `
          text-body-lg [--tree-item-height:var(--control-height-xl)] [--tree-item-px:var(--control-padding-xl)]
          [--tree-item-py:--spacing(3)] [--tree-item-gap:var(--control-gap-xl)] [--tree-icon:var(--control-icon-xl)]
        `,
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "md",
    },
  },
);

export type TreeVariants = VariantProps<typeof treeVariants>;
export type TreeSize = NonNullable<TreeVariants["size"]>;

export interface TreeContext {
  size: ComputedRef<TreeSize>;
  multiple: ComputedRef<boolean>;
  checkbox: ComputedRef<boolean>;
  virtual: ComputedRef<boolean>;
  disabled: ComputedRef<boolean>;
  keyOf(item: object): string;
  labelOf(item: object): string;
  hasChildren(item: object): boolean;
  isDisabled(item: object): boolean;
  isExpanded: (key: string) => boolean;
  isActive: (key: string) => boolean;
  stateOf: (key: string) => TreeCheckedState;
  /** Runs a row's select event: tells the tree's listeners, then applies it unless they prevented it. */
  onSelect(event: CustomEvent, item: object): void;
  onToggle(event: CustomEvent, item: object): void;
  /** Selects as a click would, without an event. */
  select(item: object): void;
  toggle: (key: string) => void;
  toggleOnClick: ComputedRef<boolean>;
  expandSiblings: (key: string) => void;
  /** Shift + a navigation key: the next row to take focus extends the range. */
  extendOnFocus: (key: string) => void;
}

export const [injectTreeContext, provideTreeContext] = createContext<TreeContext>("Tree");

export interface TreeItemContext {
  expanded: ComputedRef<boolean>;
  hasChildren: ComputedRef<boolean>;
  loading: ComputedRef<boolean>;
  disabled: ComputedRef<boolean>;
  selected: ComputedRef<boolean>;
  checked: ComputedRef<TreeCheckedState>;
}

export const [injectTreeItemContext, provideTreeItemContext] = createContext<TreeItemContext>("TreeItem");

export interface TreeHelperOptions<T> {
  getKey?: (item: T) => string;
  getChildren?: (item: T) => T[] | undefined;
}

/**
 * The keys of a node's ancestors, the root first. Put them in `v-model:expanded` to reveal the node.
 * Empty for a root or a key that isn't in the tree.
 */
export const getAncestorKeys = <T extends object>(
  items: readonly T[],
  key: string,
  options: TreeHelperOptions<T> = {},
): string[] =>
  ancestorKeys(
    buildIndex(items, {
      getKey: options.getKey ?? defaultGetKey,
      getChildren: options.getChildren ?? defaultGetChildren,
    }),
    key,
  );

/** Every node of the tree, depth first, whether expanded or not. */
export const flattenTree = <T extends object>(
  items: readonly T[],
  options: Pick<TreeHelperOptions<T>, "getChildren"> = {},
): T[] => {
  const getChildren = options.getChildren ?? defaultGetChildren;
  const result: T[] = [];
  const walk = (nodes: readonly T[]) => {
    for (const node of nodes) {
      result.push(node);
      const children = getChildren(node);
      if (children) walk(children);
    }
  };
  walk(items);
  return result;
};

const warned = new Set<string>();

const isDev = () => (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true;

export const warnOnce = (key: string, message: string) => {
  if (!isDev() || warned.has(key)) return;
  warned.add(key);
  console.warn(`[Tree] ${message}`);
};
