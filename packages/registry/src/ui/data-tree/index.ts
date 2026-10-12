import { type VariantProps, cva } from "class-variance-authority";

import { type TreeNode, treeFrame, treeSize } from "@/ui/tree";

export { default as DataTree } from "./DataTree.vue";

export type DataTreeVirtualize<T = TreeNode> =
  | boolean
  | {
      /** Rows rendered past each edge of the view. */
      overscan?: number;
      /** Row height in pixels. Measured from `--tree-item-height` by default. */
      estimateSize?: number;
      /** The text typeahead matches for a node. Its `label` by default. */
      textContent?: (item: T) => string;
    };

export interface DataTreeExpose {
  /** Expands every node that has children. */
  expandAll: () => void;
  /** Collapses every node. */
  collapseAll: () => void;
  /** Scrolls a visible node into view, rendering it first when virtualized. Returns whether it is visible; `false` while a state shows. */
  scrollToKey: (key: string) => boolean;
}

export const dataTreeVariants = cva("flex flex-col", {
  variants: {
    variant: {
      ghost: "",
      outline: [
        treeFrame,
        `
          has-[[role=tree][aria-invalid=true]]:border-destructive
          has-[[role=tree][data-disabled]]:border-foreground/(--disabled-container-opacity)
        `,
      ],
    },
    size: treeSize,
  },
  defaultVariants: { variant: "ghost", size: "md" },
});

export type DataTreeVariants = VariantProps<typeof dataTreeVariants>;

export const dataTreeMessage = "px-(--tree-item-px) py-(--tree-item-py) text-muted-foreground";
