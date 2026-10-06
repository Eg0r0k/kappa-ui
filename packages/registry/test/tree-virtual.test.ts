import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { type Component, defineComponent, h, nextTick, shallowRef } from "vue";

import { Tree, type TreeExpose } from "@/ui/tree";

type File = { path: string; name: string; children?: File[] };

const folders = (count: number, files: number): File[] =>
  Array.from({ length: count }, (_, i) => ({
    path: `folder-${i}`,
    name: `Folder ${String(i).padStart(4, "0")}`,
    children: Array.from({ length: files }, (_, j) => ({ path: `folder-${i}/file-${j}`, name: `file ${j}.ts` })),
  }));

const frames = async (count = 3) => {
  for (let i = 0; i < count; i++) await new Promise((resolve) => requestAnimationFrame(resolve));
  await nextTick();
};

const mounted: { unmount: () => void }[] = [];
afterEach(() => {
  while (mounted.length) mounted.pop()!.unmount();
});

const mountVirtual = (props: Record<string, unknown> = {}) => {
  const expanded = shallowRef<string[]>((props.expanded as string[]) ?? []);
  const exposed = shallowRef<TreeExpose>();
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(Tree as Component, {
          items: folders(2000, 3),
          "aria-label": "Files",
          virtualize: true,
          getKey: (file: File) => file.path,
          labelKey: "name",
          class: "h-[200px]",
          ref: (instance: unknown) => (exposed.value = instance as TreeExpose),
          ...props,
          expanded: expanded.value,
          "onUpdate:expanded": (next: string[]) => (expanded.value = next),
        }),
    }),
    { attachTo: document.body },
  );
  mounted.push(wrapper);
  const root = () => wrapper.element as HTMLElement;
  const rows = () => [...root().querySelectorAll<HTMLElement>("[role=treeitem]")];
  const focusedKey = () => (document.activeElement as HTMLElement | null)?.dataset.key;
  return { wrapper, root, rows, expanded, exposed, focusedKey };
};

describe("Tree virtualize", () => {
  it("renders the rows near the view, full width, in a scrolling div", async () => {
    const { root, rows } = mountVirtual();
    await frames();
    const tree = root().querySelector<HTMLElement>("[role=tree]")!;

    expect(tree.tagName).toBe("DIV");
    expect(tree.dataset.virtual).toBe("true");
    expect(getComputedStyle(tree).overflowY).toBe("auto");
    expect(rows().length).toBeGreaterThan(0);
    expect(rows().length).toBeLessThan(60);
    expect(rows()[0]!.tagName).toBe("DIV");
    expect(rows()[0]!.getBoundingClientRect().width).toBe(tree.clientWidth);
    expect(rows()[0]!.getBoundingClientRect().height).toBe(36);
  });

  it("warns once and renders every row without a height", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { rows } = mountVirtual({ class: "", items: folders(80, 0) });
    await frames(4);

    expect(rows()).toHaveLength(80);
    expect(warn.mock.calls.map((call) => String(call[0]))).toEqual([
      expect.stringContaining("virtualize needs a height"),
    ]);
    warn.mockRestore();
  });

  it("goes to the last node with End and finds nodes by label", async () => {
    const { rows, focusedKey } = mountVirtual();
    await frames();

    rows()[0]!.focus();
    await userEvent.keyboard("{End}");
    await frames();
    expect(focusedKey()).toBe("folder-1999");

    await userEvent.keyboard("{Home}");
    await frames();
    expect(focusedKey()).toBe("folder-0");

    await userEvent.keyboard("Folder 0042");
    await frames();
    expect(focusedKey()).toBe("folder-42");
  });

  it("keeps focus on the same node when nodes above it expand", async () => {
    const { rows, focusedKey, expanded } = mountVirtual({ items: folders(4, 3) });
    await frames();

    rows()[3]!.focus();
    expect(focusedKey()).toBe("folder-3");
    await userEvent.keyboard("*");
    await frames();

    expect(expanded.value).toEqual(["folder-0", "folder-1", "folder-2", "folder-3"]);
    expect(focusedKey()).toBe("folder-3");
  });

  it("measures its rows again when it mounts hidden and shows later", async () => {
    const host = document.createElement("div");
    host.style.display = "none";
    document.body.append(host);
    const wrapper = mount(
      () =>
        h(Tree as Component, {
          items: folders(200, 0),
          "aria-label": "Files",
          virtualize: true,
          getKey: (file: File) => file.path,
          labelKey: "name",
          size: "xs",
          class: "h-[200px]",
        }),
      { attachTo: host },
    );
    mounted.push({ unmount: () => (wrapper.unmount(), host.remove()) });
    await frames();
    host.style.display = "";
    await frames(4);

    const [first, second] = [...host.querySelectorAll("[role=treeitem]")];
    expect(first!.getBoundingClientRect().height).toBe(28);
    expect(second!.getBoundingClientRect().top - first!.getBoundingClientRect().top).toBe(28);
  });

  it("scrolls a node into view by key", async () => {
    const { root, exposed, expanded } = mountVirtual();
    await frames();

    expect(exposed.value!.scrollToKey("folder-1500")).toBe(true);
    await frames();
    expect(root().querySelector("[data-key=folder-1500]")).not.toBeNull();
    expect(exposed.value!.scrollToKey("folder-1500/file-1")).toBe(false);
    expect(expanded.value).toEqual([]);
  });
});
