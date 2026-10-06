import { describe, expect, it } from "vitest";

import { flattenTree, getAncestorKeys } from "@/ui/tree";
import {
  buildIndex,
  checkedStates,
  defaultGetChildren,
  defaultGetKey,
  orderedKeys,
  rangeKeys,
  resolveSelection,
  toggleSelection,
} from "@/ui/tree/selection";

type Node = { id: string; children?: Node[]; disabled?: boolean };

const items: Node[] = [
  {
    id: "components",
    children: [
      { id: "home", children: [{ id: "card" }, { id: "button" }] },
      { id: "lib", children: [{ id: "utils" }] },
    ],
  },
  { id: "app" },
];

const indexOf = (nodes: Node[]) =>
  buildIndex(nodes, { getKey: defaultGetKey, getChildren: defaultGetChildren, isDisabled: (node) => !!node.disabled });

const sorted = (set: Set<string>) => [...set].sort();

describe("tree selection", () => {
  it("indexes depth first with parents, levels and leaves", () => {
    const index = indexOf(items);

    expect(index.order).toEqual(["components", "home", "card", "button", "lib", "utils", "app"]);
    expect(index.roots).toEqual(["components", "app"]);
    expect(index.entries.get("card")).toMatchObject({ parent: "home", level: 3, children: undefined });
    expect(index.entries.get("home")!.children).toEqual(["card", "button"]);
  });

  it("reports duplicate keys and keeps the first node", () => {
    const index = indexOf([
      { id: "a", children: [{ id: "x" }] },
      { id: "b", children: [{ id: "x" }] },
    ]);

    expect(index.duplicates).toEqual(["x"]);
    expect(index.entries.get("x")!.parent).toBe("a");
  });

  it("cascades a check down and settles the parents up", () => {
    const index = indexOf(items);
    const next = toggleSelection(index, new Set(), "home", true);

    expect(sorted(next)).toEqual(["button", "card", "home"]);
    expect(checkedStates(index, next, true).get("components")).toBe("indeterminate");

    const all = toggleSelection(index, next, "utils", true);
    expect(sorted(all)).toEqual(["button", "card", "components", "home", "lib", "utils"]);
  });

  // Reka UI's propagateSelect + bubbleSelect: check Card, then its indeterminate parent Home, and the
  // model holds Card twice; unchecking Card then removes one copy and Card stays checked.
  it("never duplicates a key, and the next uncheck takes", () => {
    const index = indexOf(items);
    let selection = toggleSelection(index, new Set(), "card", true);
    selection = toggleSelection(index, selection, "home", true);

    expect(orderedKeys(index, selection)).toEqual(["home", "card", "button"]);

    selection = toggleSelection(index, selection, "card", true);
    expect(selection.has("card")).toBe(false);
    expect(checkedStates(index, selection, true).get("home")).toBe("indeterminate");
  });

  // Reka UI's flatten() reads `children` whatever getChildren says, so it reaches one level only.
  it("cascades through a custom getChildren to any depth", () => {
    type File = { name: string; files?: File[] };
    const tree: File[] = [
      { name: "root", files: [{ name: "sub", files: [{ name: "deep", files: [{ name: "leaf" }] }] }] },
    ];
    const index = buildIndex(tree, { getKey: (file) => file.name, getChildren: (file) => file.files });

    expect(sorted(toggleSelection(index, new Set(), "root", true))).toEqual(["deep", "leaf", "root", "sub"]);
  });

  it("leaves disabled nodes and their subtrees as they are", () => {
    const index = indexOf([
      {
        id: "billing",
        children: [
          { id: "invoices" },
          { id: "payouts", disabled: true },
          { id: "locked", disabled: true, children: [{ id: "x" }] },
        ],
      },
    ]);
    const checked = toggleSelection(index, new Set(), "billing", true);

    expect(sorted(checked)).toEqual(["invoices"]);
    expect(checkedStates(index, checked, true).get("billing")).toBe("indeterminate");
    // All the enabled leaves are checked, so the next click unchecks them instead of getting stuck.
    expect(sorted(toggleSelection(index, checked, "billing", true))).toEqual([]);
  });

  // nuxt/ui#6499: a model echoed back with leaves only left the parent unchecked.
  it("reads a model of leaves only, or of a parent only, as the whole selection", () => {
    const index = indexOf(items);
    const leaves = resolveSelection(index, ["card", "button"], true);

    expect(checkedStates(index, leaves, true).get("home")).toBe(true);
    expect(sorted(resolveSelection(index, ["home"], true))).toEqual(["button", "card", "home"]);
  });

  it("keeps parents independent without cascade", () => {
    const index = indexOf(items);
    const selection = toggleSelection(index, new Set(["card", "button"]), "home", false);

    expect(sorted(selection)).toEqual(["button", "card", "home"]);
    expect(checkedStates(index, new Set(["card"]), false).get("home")).toBe(false);
  });

  it("lists the selection in tree order and keeps unknown keys at the end", () => {
    const index = indexOf(items);

    expect(orderedKeys(index, new Set(["gone", "app", "card"]))).toEqual(["card", "app", "gone"]);
  });

  it("takes a range of visible rows in either direction and skips disabled ones", () => {
    const index = indexOf([{ id: "a" }, { id: "b", disabled: true }, { id: "c" }, { id: "d" }]);
    const visible = ["a", "b", "c", "d"];

    expect(rangeKeys(index, visible, "a", "c")).toEqual(["a", "c"]);
    expect(rangeKeys(index, visible, "d", "c")).toEqual(["c", "d"]);
  });

  it("finds a node's ancestors and flattens the whole tree", () => {
    expect(getAncestorKeys(items, "card")).toEqual(["components", "home"]);
    expect(getAncestorKeys(items, "nope")).toEqual([]);
    expect(flattenTree(items).map((node) => node.id)).toEqual([
      "components",
      "home",
      "card",
      "button",
      "lib",
      "utils",
      "app",
    ]);
  });
});
