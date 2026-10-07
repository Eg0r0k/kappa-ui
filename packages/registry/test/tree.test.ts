import { mount } from "@vue/test-utils";
import { ConfigProvider } from "reka-ui";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { type Component, defineComponent, h, nextTick, shallowRef } from "vue";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";
import {
  Tree,
  type TreeExpose,
  type TreeFlattenedItem,
  TreeItem,
  TreeItemCheckbox,
  TreeItemLabel,
  type TreeItemSelectEvent,
  type TreeItemSlotProps,
  TreeItemToggle,
} from "@/ui/tree";

import { controlSizes, overrideControlTokens, px, sentinel } from "./control-tokens";

type Node = { id: string; label: string; children?: Node[]; disabled?: boolean; loading?: boolean };

const makeItems = (): Node[] => [
  {
    id: "components",
    label: "components",
    children: [
      {
        id: "home",
        label: "Home",
        children: [
          { id: "card", label: "Card" },
          { id: "button", label: "Button" },
        ],
      },
    ],
  },
  { id: "app", label: "app", children: [{ id: "main", label: "main.ts" }] },
  { id: "docs", label: "docs" },
];

type RowOptions = {
  /** Replaces the rows altogether. */
  default?: (slot: { items: TreeFlattenedItem<Node>[] }) => unknown;
  checkbox?: boolean;
  label?: (item: Node) => unknown;
  trailing?: (state: TreeItemSlotProps<Node>) => unknown;
};

// the row the tree used to draw by itself: chevron, checkbox in checkbox mode, label
const rowsOf =
  (options: RowOptions = {}) =>
  ({ items }: { items: TreeFlattenedItem<Node>[] }) =>
    items.map((row) =>
      h(
        TreeItem as Component,
        { key: row._id, item: row },
        {
          default: (state: TreeItemSlotProps<Node>) => [
            h(TreeItemToggle),
            options.checkbox ? h(TreeItemCheckbox) : null,
            h(TreeItemLabel, null, () => (options.label ? options.label(state.item) : state.item.label)),
            options.trailing?.(state),
          ],
        },
      ),
    );

const mounted: { unmount: () => void }[] = [];
afterEach(() => {
  while (mounted.length) mounted.pop()!.unmount();
});

const mountTree = (props: Record<string, unknown> = {}, content: RowOptions = {}) => {
  const items = (props.items as Node[] | undefined) ?? makeItems();
  const value = shallowRef<unknown>(props.modelValue);
  const expanded = shallowRef<string[]>((props.expanded as string[] | undefined) ?? ["components", "home"]);
  const exposed = shallowRef<TreeExpose>();
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h("div", [
          h("button", { id: "before" }, "before"),
          h(
            Tree as Component,
            {
              "aria-label": "Files",
              ref: (instance: unknown) => (exposed.value = instance as TreeExpose),
              ...props,
              items,
              modelValue: value.value,
              "onUpdate:modelValue": (next: unknown) => (value.value = next),
              expanded: expanded.value,
              "onUpdate:expanded": (next: string[]) => (expanded.value = next),
            },
            { default: content.default ?? rowsOf({ checkbox: !!props.checkbox, ...content }) },
          ),
        ]),
    }),
    { attachTo: document.body },
  );
  mounted.push(wrapper);
  const rows = () => wrapper.findAll("[role=treeitem]");
  const row = (label: string) => rows().find((r) => r.get("[data-slot=tree-item-label]").text() === label)!;
  const labels = () => rows().map((r) => r.get("[data-slot=tree-item-label]").text());
  const focused = () => document.activeElement?.querySelector("[data-slot=tree-item-label]")?.textContent;
  return { wrapper, items, value, expanded, exposed, rows, row, labels, focused };
};

const focusRow = async (element: Element) => {
  (element as HTMLElement).focus();
  await nextTick();
};

describe("Tree", () => {
  it("puts attributes and classes on the element with the tree role", () => {
    const { wrapper } = mountTree({ class: "w-64" });
    const tree = wrapper.get("[role=tree]");

    expect(tree.element.tagName).toBe("UL");
    expect(tree.attributes("data-slot")).toBe("tree");
    expect(tree.attributes("aria-label")).toBe("Files");
    expect(tree.attributes("data-size")).toBe("md");
    expect(tree.attributes("data-variant")).toBe("ghost");
    expect(tree.classes()).toContain("w-64");
  });

  it("draws a frame with outline, red while invalid, and none with ghost", () => {
    const ghost = mountTree();
    expect(getComputedStyle(ghost.wrapper.get("[role=tree]").element).borderTopWidth).toBe("0px");

    const { wrapper } = mountTree({ variant: "outline", "aria-invalid": "true" });
    const tree = wrapper.get("[role=tree]");
    const style = getComputedStyle(tree.element);
    expect(tree.attributes("data-variant")).toBe("outline");
    expect(style.borderTopWidth).toBe("1px");
    const probe = document.createElement("div");
    probe.className = "border border-destructive";
    document.body.append(probe);
    expect(style.borderTopColor).toBe(getComputedStyle(probe).borderTopColor);
    probe.remove();
  });

  it("renders a flat list of treeitems with level, size and position", () => {
    const { rows, labels } = mountTree();

    expect(labels()).toEqual(["components", "Home", "Card", "Button", "app", "docs"]);
    expect(rows().map((r) => r.element.tagName)).toEqual(Array(6).fill("LI"));
    expect(rows().map((r) => r.attributes("aria-level"))).toEqual(["1", "2", "3", "3", "1", "1"]);
    expect(rows().map((r) => r.attributes("aria-setsize"))).toEqual(["3", "1", "2", "2", "3", "3"]);
    expect(rows().map((r) => r.attributes("aria-posinset"))).toEqual(["1", "1", "1", "2", "2", "3"]);
    expect(rows().map((r) => r.attributes("aria-expanded"))).toEqual([
      "true",
      "true",
      undefined,
      undefined,
      "false",
      undefined,
    ]);
  });

  it("treats children: [] as an expandable folder and keeps labels aligned", () => {
    const { row } = mountTree({
      items: [
        { id: "empty", label: "empty", children: [] },
        { id: "leaf", label: "leaf" },
      ],
    });

    expect(row("empty").attributes("aria-expanded")).toBe("false");
    expect(row("empty").find("[data-slot=tree-item-toggle] svg").exists()).toBe(true);
    expect(row("leaf").find("[data-slot=tree-item-toggle] svg").exists()).toBe(false);
    const left = (label: string) => row(label).get("[data-slot=tree-item-label]").element.getBoundingClientRect().left;
    expect(left("leaf")).toBe(left("empty"));
  });

  it("selects the original node, not a copy, and marks only that row", async () => {
    const { items, value, row, rows } = mountTree();

    await row("Card").trigger("click");

    expect(value.value).toBe(items[0]!.children![0]!.children![0]);
    expect(rows().map((r) => r.attributes("aria-selected"))).toEqual([
      undefined,
      undefined,
      "true",
      undefined,
      undefined,
      undefined,
    ]);
    expect(row("Card").attributes("data-selected")).toBeDefined();

    await row("Card").trigger("click");
    expect(value.value).toBeUndefined();
  });

  it("keeps the selection with selection-behavior replace", async () => {
    const { value, row, items } = mountTree({ selectionBehavior: "replace" });

    await row("docs").trigger("click");
    await row("docs").trigger("click");
    expect(value.value).toBe(items[2]);
  });

  it("lets select listeners prevent the selection", async () => {
    const seen: string[] = [];
    const { value, row } = mountTree({
      onSelect: (event: TreeItemSelectEvent<Node>, item: Node) => {
        seen.push(item.id);
        event.preventDefault();
      },
    });

    await row("docs").trigger("click");
    expect(seen).toEqual(["docs"]);
    expect(value.value).toBeUndefined();
  });

  it("collects an array with multiple and marks every row", async () => {
    const { wrapper, value, row, rows, items } = mountTree({ multiple: true, modelValue: [] });

    await row("docs").trigger("click");
    await row("Card").trigger("click");

    expect(value.value).toEqual([items[0]!.children![0]!.children![0], items[2]]);
    expect(wrapper.get("[role=tree]").attributes("aria-multiselectable")).toBe("true");
    expect(rows().map((r) => r.attributes("aria-selected"))).toEqual([
      "false",
      "false",
      "true",
      "false",
      "false",
      "true",
    ]);
  });

  it("replaces on click, adds with Ctrl, and extends with Shift and Shift + arrows", async () => {
    const { value, row, focused } = mountTree({
      multiple: true,
      selectionBehavior: "replace",
      toggleOnClick: false,
      modelValue: [],
    });
    const ids = () => (value.value as Node[]).map((node) => node.id);

    await row("Home").trigger("click");
    await row("Button").trigger("click");
    expect(ids()).toEqual(["button"]);

    await row("docs").trigger("click", { ctrlKey: true });
    expect(ids()).toEqual(["button", "docs"]);

    await row("Home").trigger("click");
    await row("Button").trigger("click", { shiftKey: true });
    expect(ids()).toEqual(["home", "card", "button"]);

    await focusRow(row("Card").element);
    await row("Card").trigger("click");
    await userEvent.keyboard("{Shift>}{ArrowDown}{ArrowDown}{/Shift}");
    expect(focused()).toBe("app");
    expect(ids()).toEqual(["card", "button", "app"]);
  });

  it("keeps selecting after multiple changes at runtime (nuxt/ui#3725)", async () => {
    const multiple = shallowRef(false);
    const value = shallowRef<unknown>();
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            Tree as Component,
            {
              items: makeItems(),
              "aria-label": "Files",
              multiple: multiple.value,
              modelValue: value.value,
              "onUpdate:modelValue": (next: unknown) => (value.value = next),
            },
            { default: rowsOf() },
          ),
      }),
      { attachTo: document.body },
    );
    mounted.push(wrapper);
    const click = (id: string) => wrapper.get(`[data-key=${id}]`).trigger("click");

    await click("docs");
    multiple.value = true;
    await nextTick();
    expect((value.value as Node[]).map((node) => node.id)).toEqual(["docs"]);

    await click("app");
    expect((value.value as Node[]).map((node) => node.id)).toEqual(["app", "docs"]);

    multiple.value = false;
    await nextTick();
    expect((value.value as Node).id).toBe("app");
    await click("docs");
    expect((value.value as Node).id).toBe("docs");
  });

  it("warns once about duplicate keys", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    mountTree({
      items: [
        { id: "a", label: "a", children: [{ id: "x", label: "src" }] },
        { id: "b", label: "b", children: [{ id: "x", label: "src" }] },
      ],
    });

    expect(warn.mock.calls.map((call) => String(call[0]))).toEqual([expect.stringContaining('"x"')]);
    warn.mockRestore();
  });

  it("submits the selected keys with name", async () => {
    const value = shallowRef<Node[]>([]);
    const items = makeItems();
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h("form", [
            h(
              Tree as Component,
              {
                items,
                multiple: true,
                name: "files",
                "aria-label": "Files",
                defaultExpanded: ["components"],
                modelValue: value.value,
                "onUpdate:modelValue": (next: Node[]) => (value.value = next),
              },
              { default: rowsOf() },
            ),
          ]),
      }),
      { attachTo: document.body },
    );
    mounted.push(wrapper);
    const rows = wrapper.findAll("[role=treeitem]");
    await rows[0]!.trigger("click");
    await rows[2]!.trigger("click");

    expect(new FormData(wrapper.get("form").element).getAll("files")).toEqual(["components", "app"]);
    expect(wrapper.find("[role=tree] input").exists()).toBe(false);
  });

  it("keeps a required form from submitting with nothing selected, and focuses the tree", async () => {
    const wrapper = mount(
      () =>
        h("form", [
          h(Field, { required: true }, () => [
            h(FieldLabel, () => "Files"),
            h(Tree as Component, { items: makeItems(), name: "files" }, { default: rowsOf() }),
          ]),
        ]),
      { attachTo: document.body },
    );
    mounted.push(wrapper);
    const form = wrapper.get("form").element as HTMLFormElement;

    expect(form.checkValidity()).toBe(false);
    expect(form.reportValidity()).toBe(false);
    expect(document.activeElement?.getAttribute("role")).toBe("treeitem");
    expect(new FormData(form).getAll("files")).toEqual([]);

    await wrapper.get("[data-key=docs]").trigger("click");
    expect(form.checkValidity()).toBe(true);
    expect(new FormData(form).getAll("files")).toEqual(["docs"]);
  });

  it("exposes expandAll, collapseAll and scrollToKey", async () => {
    const { exposed, labels, expanded } = mountTree({ class: "h-24 overflow-auto" });

    exposed.value!.collapseAll();
    await nextTick();
    expect(labels()).toEqual(["components", "app", "docs"]);

    exposed.value!.expandAll();
    await nextTick();
    expect(expanded.value).toEqual(["components", "home", "app"]);
    expect(exposed.value!.$el?.getAttribute("role")).toBe("tree");
    expect(exposed.value!.scrollToKey("docs")).toBe(true);
    expect(exposed.value!.scrollToKey("nope")).toBe(false);
  });

  it("composes rows from the default slot", async () => {
    const { rows, value, items } = mountTree(
      {},
      {
        default: ({ items: flat }: { items: { _id: string }[] }) =>
          flat.map((item) => h(TreeItem as Component, { key: item._id, item, class: "custom-row" })),
      },
    );

    expect(rows()).toHaveLength(6);
    expect(rows()[0]!.classes()).toContain("custom-row");
    await rows()[5]!.trigger("click");
    expect(value.value).toBe(items[2]);
  });

  it("gives the row's content its state", async () => {
    const { row } = mountTree(
      { modelValue: undefined },
      {
        trailing: ({ item, selected, level }) => h("span", { class: "trailing" }, `${item.id}:${level}:${selected}`),
      },
    );

    await row("Card").trigger("click");
    expect(row("Card").get(".trailing").text()).toBe("card:3:true");
  });
});

describe("Tree keyboard", () => {
  it("moves with Up and Down, expands with Right and goes to the parent with Left", async () => {
    const { row, focused, expanded } = mountTree({ expanded: [] });

    await focusRow(row("components").element);
    await userEvent.keyboard("{ArrowRight}");
    expect(expanded.value).toEqual(["components"]);
    await userEvent.keyboard("{ArrowRight}");
    expect(focused()).toBe("Home");
    await userEvent.keyboard("{ArrowDown}");
    expect(focused()).toBe("app");
    await userEvent.keyboard("{ArrowUp}");
    expect(focused()).toBe("Home");
    await userEvent.keyboard("{ArrowLeft}");
    expect(focused()).toBe("components");
    await userEvent.keyboard("{ArrowLeft}");
    expect(expanded.value).toEqual([]);
    await userEvent.keyboard("{End}");
    expect(focused()).toBe("docs");
    await userEvent.keyboard("{Home}");
    expect(focused()).toBe("components");
  });

  it("selects with Enter and Space", async () => {
    const { row, value, items } = mountTree();

    await focusRow(row("docs").element);
    await userEvent.keyboard("{Enter}");
    expect(value.value).toBe(items[2]);
    await focusRow(row("app").element);
    await userEvent.keyboard(" ");
    expect(value.value).toBe(items[1]);
  });

  it("expands every sibling with *", async () => {
    const { row, expanded } = mountTree({ expanded: [] });

    await focusRow(row("docs").element);
    await userEvent.keyboard("*");
    expect(expanded.value).toEqual(["components", "app"]);
  });

  // Reka UI's TreeRoot added "ArrowDown" to its typeahead buffer, so a letter typed within a second
  // after an arrow key matched nothing.
  it("matches typeahead right after an arrow key", async () => {
    const { row, focused } = mountTree();

    await focusRow(row("components").element);
    await userEvent.keyboard("{ArrowDown}");
    expect(focused()).toBe("Home");
    await userEvent.keyboard("d");
    expect(focused()).toBe("docs");
  });

  it("swaps Left and Right and indents from the right with dir rtl", async () => {
    const wrapper = mount(
      () =>
        h(ConfigProvider, { dir: "rtl" }, () =>
          h(
            Tree as Component,
            { items: makeItems(), "aria-label": "Files", defaultExpanded: [] },
            { default: rowsOf() },
          ),
        ),
      { attachTo: document.body },
    );
    mounted.push(wrapper);
    const tree = wrapper.get("[role=tree]");
    const first = wrapper.get("[role=treeitem]");

    expect(tree.attributes("dir")).toBe("rtl");
    // A closed folder's chevron points the way the text reads.
    expect(getComputedStyle(first.get("[data-slot=tree-item-toggle] svg").element).rotate).toBe("180deg");
    await focusRow(first.element);
    await userEvent.keyboard("{ArrowLeft}");
    expect(first.attributes("aria-expanded")).toBe("true");
    await userEvent.keyboard("{ArrowLeft}");
    const child = document.activeElement as HTMLElement;
    expect(child.getAttribute("aria-level")).toBe("2");
    const style = getComputedStyle(child);
    expect(px(style.paddingRight)).toBeGreaterThan(px(style.paddingLeft));
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(first.element);
  });

  it("enters on the selected row with Tab", async () => {
    const { wrapper, row, focused } = mountTree({ modelValue: { id: "card", label: "Card" } });

    expect(row("Card").attributes("data-active")).toBe("");
    (wrapper.get("#before").element as HTMLElement).focus();
    await userEvent.keyboard("{Tab}");
    expect(focused()).toBe("Card");
  });

  it("enters on a selected row that is enabled", async () => {
    const items = makeItems();
    items[1]!.disabled = true;
    const { wrapper, row, focused } = mountTree({ items, multiple: true, modelValue: [items[1], items[2]] });

    expect(row("app").attributes("data-active")).toBeUndefined();
    expect(row("docs").attributes("data-active")).toBe("");
    (wrapper.get("#before").element as HTMLElement).focus();
    await userEvent.keyboard("{Tab}");
    expect(focused()).toBe("docs");
  });

  it("skips a disabled tree with Tab and disabled rows with the arrows", async () => {
    const disabledTree = mountTree({ disabled: true });
    (disabledTree.wrapper.get("#before").element as HTMLElement).focus();
    await userEvent.keyboard("{Tab}");
    expect(disabledTree.wrapper.get("[role=tree]").element.contains(document.activeElement)).toBe(false);
    disabledTree.wrapper.unmount();
    mounted.length = 0;

    const items = makeItems();
    items[1]!.disabled = true;
    const { row, focused, value } = mountTree({ items });
    expect(row("app").attributes("aria-disabled")).toBe("true");

    await focusRow(row("Button").element);
    await userEvent.keyboard("{ArrowDown}");
    expect(focused()).toBe("docs");
    await row("app").trigger("click");
    expect(value.value).toBeUndefined();
  });

  it("lets Escape and Tab bubble out of the tree", async () => {
    const seen: string[] = [];
    const listener = (event: KeyboardEvent) => seen.push(event.key);
    const { row } = mountTree();
    document.body.addEventListener("keydown", listener);

    await focusRow(row("Card").element);
    await userEvent.keyboard("{ArrowDown}{Escape}{Tab}");
    document.body.removeEventListener("keydown", listener);
    expect(seen).toEqual(["Escape", "Tab"]);
  });

  // Reka UI's typeahead also kept the Space that selected a row, so "d" typed next searched for " d".
  it("matches typeahead right after Space selects, and searches on through a Space in a name", async () => {
    const items: Node[] = [
      { id: "docs", label: "docs" },
      { id: "my-notes", label: "my notes" },
      { id: "my-docs", label: "my docs" },
      { id: "beta", label: "beta" },
    ];
    const first = mountTree({ items });

    await focusRow(first.row("beta").element);
    await userEvent.keyboard(" ");
    expect(first.value.value).toBe(items[3]);
    await userEvent.keyboard("d");
    expect(first.focused()).toBe("docs");

    // A second tree, so no search is still running.
    const second = mountTree({ items });
    await focusRow(second.row("beta").element);
    await userEvent.keyboard("my d");
    expect(second.focused()).toBe("my docs");
    expect(second.value.value).toBeUndefined();
  });

  it("leaves keys typed in a field inside a row to the field", async () => {
    mountTree(
      {},
      {
        label: (item) =>
          item.id === "card"
            ? h("input", { "aria-label": "Rename", onClick: (event: Event) => event.stopPropagation() })
            : item.label,
      },
    );
    const input = document.querySelector<HTMLInputElement>("input[aria-label=Rename]")!;
    input.value = "Card";

    input.focus();
    await userEvent.keyboard("{End}docs{ArrowUp}");
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe("Carddocs");
  });

  it("does not swallow contextmenu, so a menu on the container can find the row", async () => {
    const keys: (string | undefined)[] = [];
    const { wrapper, row } = mountTree();
    wrapper.element.addEventListener("contextmenu", (event: MouseEvent) => {
      event.preventDefault();
      keys.push((event.target as Element).closest<HTMLElement>("[data-key]")?.dataset.key);
    });

    await row("Card").trigger("contextmenu");
    expect(keys).toEqual(["card"]);
  });
});

describe("Tree checkbox", () => {
  const ids = (value: unknown) => (value as Node[]).map((node) => node.id);

  it("checks with aria-checked, cascades and never sets aria-selected", async () => {
    const { row, rows, value } = mountTree({ checkbox: true, multiple: true, modelValue: [] });

    await row("Card").get("[data-slot=tree-item-checkbox]").trigger("click");
    expect(ids(value.value)).toEqual(["card"]);
    expect(rows().map((r) => r.attributes("aria-checked"))).toEqual([
      "mixed",
      "mixed",
      "true",
      "false",
      "false",
      "false",
    ]);
    expect(rows().every((r) => r.attributes("aria-selected") === undefined)).toBe(true);
    expect(row("Home").get("[data-slot=tree-item-checkbox]").attributes("data-state")).toBe("indeterminate");

    await row("Button").get("[data-slot=tree-item-checkbox]").trigger("click");
    expect(ids(value.value)).toEqual(["components", "home", "card", "button"]);
  });

  it("checks from the checkbox without expanding, and with Space", async () => {
    const { row, value, expanded } = mountTree({ checkbox: true, multiple: true, modelValue: [], expanded: [] });

    await row("app").get("[data-slot=tree-item-checkbox]").trigger("click");
    expect(expanded.value).toEqual([]);
    expect(ids(value.value)).toEqual(["app", "main"]);

    await focusRow(row("docs").element);
    await userEvent.keyboard(" ");
    expect(ids(value.value)).toEqual(["app", "main", "docs"]);
  });

  it("expands from the chevron without checking", async () => {
    const { row, value, expanded } = mountTree({ checkbox: true, multiple: true, modelValue: [], expanded: [] });

    await row("app").get("[data-slot=tree-item-toggle]").trigger("click");
    expect(expanded.value).toEqual(["app"]);
    expect(value.value).toEqual([]);

    await row("app").get("[data-slot=tree-item-toggle]").trigger("click");
    expect(expanded.value).toEqual([]);
    expect(value.value).toEqual([]);
  });

  it("checks only from the checkbox: a click on the row expands a folder and leaves a leaf alone", async () => {
    const { row, value, expanded } = mountTree({ checkbox: true, multiple: true, modelValue: [], expanded: [] });

    await row("app").get("[data-slot=tree-item-label]").trigger("click");
    expect(expanded.value).toEqual(["app"]);
    expect(value.value).toEqual([]);

    await row("main.ts").trigger("click");
    await row("docs").get("[data-slot=tree-item-label]").trigger("click");
    expect(value.value).toEqual([]);
  });

  // nuxt/ui#6499: a model holding leaves only showed the parent unchecked.
  it("shows a parent checked when the model holds its leaves only", () => {
    const items = makeItems();
    const home = items[0]!.children![0]!;
    const { row } = mountTree({ items, checkbox: true, multiple: true, modelValue: [...home.children!] });

    expect(row("Home").attributes("aria-checked")).toBe("true");
    expect(row("components").attributes("aria-checked")).toBe("true");
  });
});

describe("Tree chevron", () => {
  it("expands a folder without selecting it, and selects a leaf from the space it keeps", async () => {
    const { row, value, expanded, items } = mountTree({ expanded: [] });

    await row("app").get("[data-slot=tree-item-toggle]").trigger("click");
    expect(expanded.value).toEqual(["app"]);
    expect(value.value).toBeUndefined();

    await row("docs").get("[data-slot=tree-item-toggle]").trigger("click");
    expect(value.value).toBe(items[2]);
  });
});

describe("Tree toggle-on-click false", () => {
  it("selects on click, and expands from the chevron or a double click", async () => {
    const { row, value, expanded, items } = mountTree({ toggleOnClick: false, expanded: [] });

    await row("app").trigger("click");
    expect(value.value).toBe(items[1]);
    expect(expanded.value).toEqual([]);

    await row("components").get("[data-slot=tree-item-toggle]").trigger("click");
    expect(expanded.value).toEqual(["components"]);
    expect(value.value).toBe(items[1]);

    await row("app").trigger("dblclick");
    expect(expanded.value).toEqual(["components", "app"]);
  });
});

describe("Tree loading", () => {
  it("marks a loading node busy and spins in its toggle", () => {
    const { row } = mountTree({ items: [{ id: "bucket", label: "bucket", children: [], loading: true }] });

    expect(row("bucket").attributes("aria-busy")).toBe("true");
    expect(row("bucket").find("[data-slot=tree-item-toggle] [data-slot=spinner]").exists()).toBe(true);
  });
});

describe("Tree field", () => {
  it("takes its name, description, error and state from a field", async () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(Field, { invalid: true, required: true, disabled: true }, () => [
            h(FieldLabel, () => "Permissions"),
            h(Tree as Component, { items: makeItems() }, { default: rowsOf() }),
            h(FieldDescription, () => "What the role can do."),
            h(FieldError, { errors: "Grant at least one permission." }),
          ]),
      }),
      { attachTo: document.body },
    );
    mounted.push(wrapper);
    await nextTick();
    const tree = wrapper.get("[role=tree]");

    expect(tree.attributes("aria-labelledby")).toBe(wrapper.get("label").attributes("id"));
    expect(tree.attributes("aria-describedby")).toBe(
      `${wrapper.get("[data-slot=field-description]").attributes("id")} ${wrapper.get("[data-slot=field-error]").attributes("id")}`,
    );
    expect(tree.attributes("aria-invalid")).toBe("true");
    expect(tree.attributes("aria-required")).toBe("true");
    expect(tree.attributes("data-disabled")).toBeDefined();
    expect(wrapper.findAll("[role=treeitem]").every((r) => r.attributes("aria-disabled") === "true")).toBe(true);
  });
});

describe("Tree sizes", () => {
  const row = (level = 1) => getComputedStyle(document.querySelector(`[role=treeitem][aria-level="${level}"]`)!);

  it("defaults to md", () => {
    mountTree();
    expect([row().minHeight, row().paddingInlineStart, row().columnGap]).toEqual(["36px", "12px", "8px"]);
  });

  it.each([
    ["xs", "12px"],
    ["sm", "12px"],
    ["md", "14px"],
    ["lg", "16px"],
    ["xl", "16px"],
  ] as const)("%s rows use %s text", (size, fontSize) => {
    mountTree({ size });
    expect(row().fontSize).toBe(fontSize);
  });

  describe("control tokens", () => {
    overrideControlTokens();

    it.each(controlSizes)("%s rows read the height, padding, gap and icon tokens and indent by them", (size) => {
      const { wrapper } = mountTree({ size });
      const indent = sentinel.icon[size] + sentinel.gap[size];

      expect(wrapper.get("[role=tree]").attributes("data-size")).toBe(size);
      expect(px(row().minHeight)).toBe(sentinel.height[size]);
      expect(px(row().paddingInlineStart)).toBe(sentinel.padding[size]);
      expect(px(row().columnGap)).toBe(sentinel.gap[size]);
      expect(px(row(3).paddingInlineStart)).toBe(sentinel.padding[size] + 2 * indent);
      const chevron = document.querySelector("[data-slot=tree-item-toggle] svg")!.getBoundingClientRect();
      expect(chevron.width).toBe(sentinel.icon[size]);
    });
  });
});
