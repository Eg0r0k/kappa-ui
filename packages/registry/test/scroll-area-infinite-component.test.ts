import { mount } from "@vue/test-utils";
import { expect, it, vi } from "vitest";
import { createSSRApp, h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";

import { type InfiniteDirection, InfiniteScroll, ScrollArea } from "@/ui/scroll-area";

const settle = () => new Promise((resolve) => setTimeout(resolve, 50));

const render = (
  props: Record<string, unknown> | (() => Record<string, unknown>) = {},
  slots: Record<string, unknown> = {},
) => {
  const count = ref(30);
  const calls: { direction: InfiniteDirection; index: number }[] = [];
  const pending: Array<(result?: "stop") => void> = [];
  const api = ref<InstanceType<typeof InfiniteScroll> | null>(null);
  mount(
    {
      render: () =>
        h(
          ScrollArea,
          { style: "height: 200px; width: 200px" },
          {
            default: () =>
              h(
                InfiniteScroll,
                {
                  ref: api,
                  debounce: 0,
                  offset: 50,
                  onLoad: (context: { direction: InfiniteDirection; index: number }) => {
                    calls.push(context);
                    return new Promise<void | "stop">((resolve) => pending.push(resolve));
                  },
                  ...(typeof props === "function" ? props() : props),
                },
                {
                  default: () =>
                    Array.from({ length: count.value }, (_, index) =>
                      h("div", { key: index, style: "height: 20px" }, index),
                    ),
                  ...slots,
                },
              ),
          },
        ),
    },
    { attachTo: document.body },
  );
  const viewport = document.querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")!;
  const root = document.querySelector<HTMLElement>("[data-slot=infinite-scroll]")!;
  const loading = (direction: InfiniteDirection) =>
    document.querySelector<HTMLElement>(`[data-slot=infinite-scroll-loading][data-direction=${direction}]`);
  const finish = async (result?: "stop") => {
    pending.shift()?.(result);
    await nextTick();
    await nextTick();
  };
  return { count, calls, viewport, root, loading, finish, api };
};

it("finds the ScrollArea viewport through the injection and loads at its end", async () => {
  const { calls, viewport, api } = render();
  expect(api.value!.getTarget()).toBe(viewport);
  await settle();
  expect(calls).toEqual([]);
  viewport.scrollTop = 400;
  await vi.waitFor(() => expect(calls).toEqual([{ direction: "bottom", index: 1 }]));
});

it("shows the loading part while loading, keeps its room when idle and hides it once stopped", async () => {
  const { viewport, root, loading, finish } = render();
  const part = loading("bottom")!;
  expect(part.dataset.state).toBe("idle");
  expect(getComputedStyle(part).visibility).toBe("hidden");
  expect(part.getBoundingClientRect().height).toBeGreaterThan(0);
  expect(root.hasAttribute("aria-busy")).toBe(false);

  viewport.scrollTop = 400;
  await vi.waitFor(() => expect(part.dataset.state).toBe("loading"));
  expect(getComputedStyle(part).visibility).toBe("visible");
  expect(part.querySelector("[data-slot=spinner]")).not.toBeNull();
  expect(root.getAttribute("aria-busy")).toBe("true");

  await finish("stop");
  expect(loading("bottom")).toBeNull();
  expect(root.hasAttribute("aria-busy")).toBe(false);
});

it("renders the end slot in place of the loading part once stopped", async () => {
  const { viewport, calls, finish } = render(
    {},
    { end: ({ direction }: { direction: string }) => h("p", `no more ${direction}`) },
  );
  viewport.scrollTop = 400;
  await vi.waitFor(() => expect(calls).toHaveLength(1));
  await finish("stop");
  expect(document.querySelector("[data-slot=infinite-scroll-end][data-direction=bottom]")?.textContent).toBe(
    "no more bottom",
  );
});

it("puts a loading part at each edge it loads from", async () => {
  const { loading, root } = render({ directions: ["top", "bottom"] });
  const top = loading("top")!;
  const bottom = loading("bottom")!;
  expect(top.compareDocumentPosition(bottom) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(root.firstElementChild).toBe(top);
  expect(root.lastElementChild).toBe(bottom);
  expect(root.dataset.orientation).toBe("vertical");
});

it("lays horizontal directions out in a row", () => {
  const { root, loading } = render({ directions: ["end"] });
  expect(root.dataset.orientation).toBe("horizontal");
  expect(getComputedStyle(root).display).toBe("flex");
  expect(root.lastElementChild).toBe(loading("end"));
});

it("resets when resetKey changes", async () => {
  const key = ref(1);
  const { viewport, calls, finish, api } = render(() => ({ resetKey: key.value }));
  viewport.scrollTop = 400;
  await vi.waitFor(() => expect(calls).toHaveLength(1));
  await finish("stop");
  expect(api.value!.state.bottom.stopped).toBe(true);

  key.value = 2;
  await nextTick();
  expect(calls).toHaveLength(2);
  expect(calls[1]!.index).toBe(1);
  expect(api.value!.state.bottom).toEqual({ index: 1, loading: true, stopped: false });
});

it("renders on the server without touching the window", async () => {
  const html = await renderToString(
    createSSRApp({ render: () => h(InfiniteScroll, { onLoad: async () => undefined }, () => h("p", "row")) }),
  );
  expect(html).toContain('data-slot="infinite-scroll"');
  expect(html).toContain("row");
});
