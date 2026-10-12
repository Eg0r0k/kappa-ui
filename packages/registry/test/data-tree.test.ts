import { Folder } from "@lucide/vue";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { type Component, defineComponent, h, nextTick, shallowRef } from "vue";

import { DataTree, type DataTreeExpose } from "@/ui/data-tree";
import { Field, FieldLabel } from "@/ui/field";
import { TreeItemLabel, type TreeItemSlotProps } from "@/ui/tree";

type Node = { id: string; label: string; icon?: Component; children?: Node[]; defaultExpanded?: boolean };

const makeItems = (): Node[] => [
  {
    id: "src",
    label: "src",
    icon: Folder,
    defaultExpanded: true,
    children: [
      { id: "src/App.vue", label: "App.vue" },
      { id: "src/main.ts", label: "main.ts" },
    ],
  },
  { id: "README.md", label: "README.md" },
];

const mounted: { unmount: () => void }[] = [];
afterEach(() => {
  while (mounted.length) mounted.pop()!.unmount();
});

const mountDataTree = (props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) => {
  const state = shallowRef<Record<string, unknown>>({ "aria-label": "Files", items: makeItems(), ...props });
  const exposed = shallowRef<DataTreeExpose>();
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          DataTree as Component,
          { ...state.value, ref: (instance: unknown) => (exposed.value = instance as DataTreeExpose) },
          slots,
        ),
    }),
    { attachTo: document.body },
  );
  mounted.push(wrapper);
  const set = async (next: Record<string, unknown>) => {
    state.value = { ...state.value, ...next };
    await nextTick();
  };
  return {
    wrapper,
    exposed,
    set,
    root: () => document.querySelector<HTMLElement>("[data-slot=data-tree]")!,
    tree: () => document.querySelector<HTMLElement>("[role=tree]"),
    row: (key: string) => document.querySelector<HTMLElement>(`[data-key="${key}"]`)!,
    labels: () =>
      [...document.querySelectorAll("[role=treeitem] [data-slot=tree-item-label]")].map((el) => el.textContent?.trim()),
  };
};

const q = (selector: string) => document.querySelector<HTMLElement>(selector);

describe("DataTree rows", () => {
  it("draws a row per node from its label and icon", () => {
    const { labels, row } = mountDataTree();
    expect(labels()).toEqual(["src", "App.vue", "main.ts", "README.md"]);
    expect(row("src").querySelector("[data-slot=tree-item-toggle]")).not.toBeNull();
    expect(row("src").querySelector("[data-slot=tree-item-icon] svg")).not.toBeNull();
    expect(row("README.md").querySelector("[data-slot=tree-item-icon]")).toBeNull();
    expect(q("[data-slot=tree-item-checkbox]")).toBeNull();
  });

  it("adds a checkbox to every row with checkbox", () => {
    mountDataTree({ checkbox: true });
    expect(document.querySelectorAll("[data-slot=tree-item-checkbox]")).toHaveLength(4);
  });

  it("replaces a row's content through the item slot", () => {
    const { labels } = mountDataTree(
      {},
      {
        item: (scope: TreeItemSlotProps<Node>) =>
          h(TreeItemLabel, () => `${scope.item.label}${scope.hasChildren ? "/" : ""}`),
      },
    );
    expect(labels()).toEqual(["src/", "App.vue", "main.ts", "README.md"]);
    expect(q("[data-slot=tree-item-toggle]")).toBeNull();
  });
});

describe("DataTree frame", () => {
  it("puts the frame, size and class on the root and the rest on the tree", () => {
    const { root, tree } = mountDataTree({ variant: "outline", class: "w-64", id: "files" });
    expect(root().className).toContain("w-64");
    expect(root().dataset.size).toBe("md");
    expect(root().dataset.variant).toBe("outline");
    expect(getComputedStyle(root()).borderTopWidth).toBe("1px");
    expect(getComputedStyle(tree()!).borderTopWidth).toBe("0px");
    expect(tree()!.getAttribute("aria-label")).toBe("Files");
    expect(tree()!.id).toBe("files");
    expect(root().getAttribute("aria-label")).toBeNull();
  });

  it("takes a field's label on the tree", () => {
    const wrapper = mount(
      () => h(Field, () => [h(FieldLabel, () => "Files"), h(DataTree as Component, { items: makeItems() })]),
      { attachTo: document.body },
    );
    mounted.push(wrapper);
    const label = q("[data-slot=field-label]")!;
    expect(q("[role=tree]")!.getAttribute("aria-labelledby")).toContain(label.id);
  });
});

describe("DataTree states", () => {
  it.each([
    [{ items: [] }, "empty"],
    [{ items: [], loading: true }, "loading"],
    [{ items: [], loading: true, error: new Error("x") }, "error"],
    [{ error: "Offline" }, "error"],
    [{ error: "" }, "error"],
  ])("shows %o as %s, in place of the tree", (props, state) => {
    const { tree } = mountDataTree(props);
    expect(tree()).toBeNull();
    expect(q(`[data-slot=data-tree-${state}]`)).not.toBeNull();
    expect(document.querySelectorAll("[data-slot^=data-tree-]")).toHaveLength(1);
  });

  it.each([undefined, null, false])("shows the tree with error %s", (error) => {
    const { tree } = mountDataTree({ error });
    expect(tree()).not.toBeNull();
  });

  it("writes default messages and skeleton rows", async () => {
    const { set, root } = mountDataTree({ items: [] });
    expect(q("[data-slot=data-tree-empty]")!.textContent!.trim()).toBe("No items");
    await set({ empty: "No folders" });
    expect(q("[data-slot=data-tree-empty]")!.textContent!.trim()).toBe("No folders");
    await set({ loading: true, loadingRows: 5 });
    expect(document.querySelectorAll("[data-slot=data-tree-loading] [data-slot=skeleton]")).toHaveLength(5);
    expect(root().getAttribute("aria-busy")).toBe("true");
    expect(q("[data-slot=data-tree-loading]")!.getAttribute("aria-hidden")).toBeNull();
    await set({ error: "Offline" });
    expect(q("[data-slot=data-tree-error] [role=alert]")!.textContent!.trim()).toBe("Offline");
    await set({ error: new Error("boom") });
    expect(q("[data-slot=data-tree-error] [role=alert]")!.textContent!.trim()).toBe("Something went wrong");
  });

  it("renders the state slots, the error with its value", () => {
    mountDataTree(
      { items: [], error: new Error("boom") },
      { error: ({ error }: { error: Error }) => h("b", error.message), empty: () => "none", loading: () => "…" },
    );
    expect(q("[data-slot=data-tree-error] b")!.textContent).toBe("boom");
    expect(q("[data-slot=data-tree-error] [role=alert]")).toBeNull();
  });

  it("keeps the tree and marks the root busy while loading with items", () => {
    const { tree, root } = mountDataTree({ loading: true });
    expect(tree()).not.toBeNull();
    expect(root().getAttribute("aria-busy")).toBe("true");
  });

  it("applies defaultExpanded to the first data after loading", async () => {
    const { set, labels } = mountDataTree({ items: [], loading: true });
    await set({ items: makeItems(), loading: false });
    expect(labels()).toEqual(["src", "App.vue", "main.ts", "README.md"]);
  });

  it("keeps the selection and the expanded nodes across a state", async () => {
    const { set, labels, row, exposed } = mountDataTree();
    await userEvent.click(row("README.md"));
    exposed.value!.collapseAll();
    await nextTick();
    expect(labels()).toEqual(["src", "README.md"]);

    await set({ items: [] });
    expect(q("[data-slot=data-tree-empty]")).not.toBeNull();
    await set({ items: makeItems() });

    expect(labels()).toEqual(["src", "README.md"]);
    expect(row("README.md").getAttribute("aria-selected")).toBe("true");
  });

  it("keeps a cleared selection cleared across a state", async () => {
    const items = makeItems();
    const { set, row } = mountDataTree({ items, defaultValue: items[1] });
    expect(row("README.md").getAttribute("aria-selected")).toBe("true");
    await userEvent.click(row("README.md"));
    expect(row("README.md").getAttribute("aria-selected")).toBeNull();
    await set({ items: [] });
    await set({ items });
    expect(row("README.md").getAttribute("aria-selected")).toBeNull();
  });
});

describe("DataTree API", () => {
  it("forwards v-model and the select event", async () => {
    const updates: unknown[] = [];
    const selected: unknown[] = [];
    const { row } = mountDataTree({
      "onUpdate:modelValue": (value: unknown) => updates.push(value),
      onSelect: (_event: unknown, item: unknown) => selected.push(item),
    });
    await userEvent.click(row("README.md"));
    expect((updates[0] as Node).label).toBe("README.md");
    expect((selected[0] as Node).label).toBe("README.md");
  });

  it("exposes expandAll, collapseAll and scrollToKey, idle while a state shows", async () => {
    const { exposed, labels, set } = mountDataTree();
    exposed.value!.collapseAll();
    await nextTick();
    expect(labels()).toEqual(["src", "README.md"]);
    exposed.value!.expandAll();
    await nextTick();
    expect(labels()).toEqual(["src", "App.vue", "main.ts", "README.md"]);
    expect(exposed.value!.scrollToKey("README.md")).toBe(true);
    await set({ items: [] });
    expect(exposed.value!.scrollToKey("README.md")).toBe(false);
  });

  it("virtualizes the rows with virtualize, scrolling inside the frame", async () => {
    const regions: Node[] = Array.from({ length: 100 }, (_, r) => ({
      id: `r${r}`,
      label: `Region ${r}`,
      children: Array.from({ length: 50 }, (_, s) => ({ id: `r${r}/s${s}`, label: `Store ${s}` })),
    }));
    const { tree } = mountDataTree({
      items: regions,
      virtualize: true,
      expanded: regions.map((region) => region.id),
      variant: "outline",
      class: "h-80",
    });
    await vi.waitFor(() => expect(document.querySelectorAll("[role=treeitem]").length).toBeGreaterThan(0));
    expect(document.querySelectorAll("[role=treeitem]").length).toBeLessThan(100);
    expect(tree()!.tagName).toBe("DIV");
    expect(tree()!.dataset.virtual).toBe("true");
    expect(tree()!.getBoundingClientRect().height).toBeLessThanOrEqual(320);
  });
});
