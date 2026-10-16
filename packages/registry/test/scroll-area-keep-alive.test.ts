import { mount } from "@vue/test-utils";
import { expect, it, vi } from "vitest";
import { type Component, KeepAlive, Transition, type VNode, defineComponent, h, nextTick, ref } from "vue";

import { ScrollArea, type ScrollAreaApi } from "@/ui/scroll-area";

type ApiRef = { value: ScrollAreaApi | null };

const frames = async (count = 2) => {
  for (let i = 0; i < count; i += 1) await new Promise((resolve) => requestAnimationFrame(resolve));
};

const viewport = () => document.querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")!;

const mountKeptAlive = (area: (api: ApiRef) => VNode, transition = false) => {
  const api: ApiRef = { value: null };
  const shown = ref(true);
  const Page = defineComponent({ name: "Page", setup: () => () => area(api) });
  const Other = defineComponent({ name: "Other", setup: () => () => h("div", "other") });

  mount(
    defineComponent({
      setup: () => () => {
        const alive = h(KeepAlive, null, [shown.value ? h(Page, { key: "page" }) : h(Other, { key: "other" })]);
        return transition ? h(Transition, { mode: "out-in", duration: 0 }, () => alive) : alive;
      },
    }),
    { attachTo: document.body },
  );

  const leaveAndReturn = async () => {
    shown.value = false;
    await nextTick();
    await frames(4);
    shown.value = true;
    await nextTick();
    await frames(4);
  };
  return { api, leaveAndReturn };
};

const area = (api: ApiRef, props: Record<string, unknown> = {}) =>
  h(
    ScrollArea as Component,
    { ref: (el: unknown) => (api.value = el as ScrollAreaApi | null), style: "height: 300px; width: 400px", ...props },
    () => h("div", { style: "height: 2000px; width: 2000px" }),
  );

it("restores the position when its page is activated again", async () => {
  const { api, leaveAndReturn } = mountKeptAlive((api) => area(api));
  await frames();
  viewport().scrollTop = 500;
  await vi.waitFor(() => expect(api.value!.getScrollPosition().top).toBe(500));

  await leaveAndReturn();

  expect(viewport().scrollTop).toBe(500);
  expect(api.value!.getScrollPosition().top).toBe(500);
});

it("restores the position under a transition around KeepAlive", async () => {
  const { api, leaveAndReturn } = mountKeptAlive((api) => area(api), true);
  await frames();
  viewport().scrollTop = 500;
  await vi.waitFor(() => expect(api.value!.getScrollPosition().top).toBe(500));

  await leaveAndReturn();

  expect(viewport().scrollTop).toBe(500);
});

it("restores a horizontal position", async () => {
  const { api, leaveAndReturn } = mountKeptAlive((api) => area(api, { orientation: "horizontal" }));
  await frames();
  viewport().scrollLeft = 700;
  await vi.waitFor(() => expect(api.value!.getScrollPosition().left).toBe(700));

  await leaveAndReturn();

  expect(viewport().scrollLeft).toBe(700);
});

it("restores the position of a virtualized list", async () => {
  const items = Array.from({ length: 500 }, (_, index) => index);
  const { api, leaveAndReturn } = mountKeptAlive((api) =>
    h(
      ScrollArea as Component,
      {
        ref: (el: unknown) => (api.value = el as ScrollAreaApi | null),
        style: "height: 300px; width: 400px",
        virtualize: { estimateSize: 40 },
        items,
      },
      { default: ({ item }: { item: number }) => h("div", { style: "height: 40px" }, String(item)) },
    ),
  );
  await frames();
  viewport().scrollTop = 4000;
  await vi.waitFor(() => expect(api.value!.getScrollPosition().top).toBe(4000));

  await leaveAndReturn();

  expect(viewport().scrollTop).toBe(4000);
  await vi.waitFor(() =>
    expect(document.querySelector("[data-slot=scroll-area-item][data-index='100']")).not.toBeNull(),
  );
});
