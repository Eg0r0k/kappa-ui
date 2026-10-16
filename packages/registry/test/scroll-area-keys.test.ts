import { mount } from "@vue/test-utils";
import { expect, it, vi } from "vitest";
import { type Component, defineComponent, h, nextTick, onMounted, ref, shallowRef } from "vue";

import { ScrollArea, type ScrollAreaApi, useInfiniteScroll } from "@/ui/scroll-area";

const ROW = 40;

const frames = async (count = 3) => {
  for (let i = 0; i < count; i += 1) await new Promise((resolve) => requestAnimationFrame(resolve));
};

const settle = async () => {
  await nextTick();
  await frames();
};

const names = (prefix: string, count: number) => Array.from({ length: count }, (_, index) => `${prefix}${index}`);

const viewport = () => document.querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")!;
const rowOf = (name: string) =>
  document.querySelector(`[data-row="${name}"]`)?.closest("[data-slot=scroll-area-item]") ?? null;
const firstVisible = () => {
  const top = viewport().getBoundingClientRect().top;
  return [...document.querySelectorAll<HTMLElement>("[data-row]")].find(
    (row) => Math.round(row.getBoundingClientRect().top) === Math.round(top),
  )?.dataset.row;
};

const mountList = (
  initial: string[],
  options: Record<string, unknown> = {},
  listeners: Record<string, unknown> = {},
) => {
  const items = ref(initial);
  const api = shallowRef<ScrollAreaApi | null>(null);
  const virtualize = { estimateSize: ROW, getItemKey: (index: number) => items.value[index], ...options };
  mount(
    defineComponent({
      setup: () => () =>
        h(
          ScrollArea as Component,
          {
            ref: (el: unknown) => (api.value = el as ScrollAreaApi | null),
            style: "height: 200px; width: 300px",
            items: items.value,
            virtualize,
            ...listeners,
          },
          { default: ({ item }: { item: string }) => h("div", { "data-row": item, style: `height: ${ROW}px` }, item) },
        ),
    }),
    { attachTo: document.body },
  );
  return { items, api };
};

it("keeps the element of a row when rows are added above it", async () => {
  const { items } = mountList(names("r", 20));
  await settle();
  const marked = new WeakSet<Element>([rowOf("r1")!]);

  items.value = [...names("new", 2), ...items.value];
  await settle();

  expect(marked.has(rowOf("r1")!)).toBe(true);
});

it("follows the keys when the list is reordered in place at the same length", async () => {
  const { items } = mountList(names("r", 5));
  await settle();
  const marked = new WeakSet<Element>([rowOf("r1")!]);

  items.value.reverse();
  await settle();

  expect(rowOf("r1")?.getAttribute("data-index")).toBe("3");
  expect(marked.has(rowOf("r1")!)).toBe(true);
});

it("leaves the position alone when rows are added above, by default", async () => {
  const { items } = mountList(names("r", 50));
  await settle();
  viewport().scrollTop = 400;
  await settle();

  items.value = [...names("new", 5), ...items.value];
  await settle();

  expect(viewport().scrollTop).toBe(400);
  expect(firstVisible()).toBe("r5");
});

it("keeps the first visible row in place with anchorTo end", async () => {
  const { items } = mountList(names("r", 50), { anchorTo: "end" });
  await settle();
  viewport().scrollTop = 400;
  await settle();
  expect(firstVisible()).toBe("r10");

  items.value = [...names("new", 5), ...items.value];
  await settle();

  expect(viewport().scrollTop).toBe(600);
  expect(firstVisible()).toBe("r10");
});

it("follows rows appended at the end with followOnAppend", async () => {
  const { items } = mountList(names("r", 50), { anchorTo: "end", followOnAppend: true });
  await settle();
  const el = viewport();
  el.scrollTop = el.scrollHeight;
  await settle();

  items.value = [...items.value, ...names("new", 3)];
  await settle();

  await vi.waitFor(() => expect(el.scrollTop).toBe(53 * ROW - 200));
});

it("moves without emitting when set silently", async () => {
  const onScroll = vi.fn();
  const onReachEdge = vi.fn();
  const onVirtualScroll = vi.fn();
  const { api } = mountList(names("r", 50), {}, { onScroll, onReachEdge, onVirtualScroll });
  await settle();
  await new Promise((resolve) => setTimeout(resolve, 20));
  onScroll.mockClear();

  api.value!.setScrollPositionSilently("vertical", 50 * ROW - 200);
  await settle();
  await new Promise((resolve) => setTimeout(resolve, 20));

  expect(viewport().scrollTop).toBe(50 * ROW - 200);
  expect(api.value!.getScrollPosition().top).toBe(50 * ROW - 200);
  expect(firstVisible()).toBe("r45");
  expect(onScroll).not.toHaveBeenCalled();
  expect(onReachEdge).not.toHaveBeenCalled();
  expect(onVirtualScroll).not.toHaveBeenCalled();

  viewport().scrollTop = 400;
  await vi.waitFor(() => expect(onScroll).toHaveBeenCalled());
  await vi.waitFor(() => expect(onVirtualScroll).toHaveBeenCalled());
});

it("does not shift a second time when infinite scroll loads above an anchored list", async () => {
  const items = ref(names("r", 50));
  const api = shallowRef<ScrollAreaApi | null>(null);
  const virtualize = { estimateSize: ROW, anchorTo: "end", getItemKey: (index: number) => items.value[index] };
  mount(
    defineComponent({
      setup: () => {
        useInfiniteScroll({
          target: () => api.value,
          directions: ["top"],
          offset: 50,
          onLoad: async () => {
            items.value = [...names("old", 10), ...items.value];
            return "stop";
          },
        });
        return () =>
          h(
            ScrollArea as Component,
            {
              ref: (el: unknown) => (api.value = el as ScrollAreaApi | null),
              style: "height: 200px; width: 300px",
              items: items.value,
              virtualize,
            },
            {
              default: ({ item }: { item: string }) => h("div", { "data-row": item, style: `height: ${ROW}px` }, item),
            },
          );
      },
    }),
    { attachTo: document.body },
  );

  await vi.waitFor(() => expect(items.value).toHaveLength(60));
  await settle();
  await settle();

  expect(viewport().scrollTop).toBe(10 * ROW);
  expect(firstVisible()).toBe("r0");
});

it("keeps a position set at mount once the virtual list attaches", async () => {
  const api = shallowRef<ScrollAreaApi | null>(null);
  mount(
    defineComponent({
      setup: () => {
        onMounted(() => api.value!.setScrollPositionSilently("vertical", 400));
        return () =>
          h(
            ScrollArea as Component,
            {
              ref: (el: unknown) => (api.value = el as ScrollAreaApi | null),
              style: "height: 200px; width: 300px",
              items: names("r", 50),
              virtualize: { estimateSize: ROW },
            },
            {
              default: ({ item }: { item: string }) => h("div", { "data-row": item, style: `height: ${ROW}px` }, item),
            },
          );
      },
    }),
    { attachTo: document.body },
  );
  await settle();

  expect(viewport().scrollTop).toBe(400);
  expect(firstVisible()).toBe("r10");
});
