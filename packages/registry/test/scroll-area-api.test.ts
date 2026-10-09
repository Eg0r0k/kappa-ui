import { mount } from "@vue/test-utils";
import { expect, it, vi } from "vitest";
import { h, nextTick, ref } from "vue";

import { ScrollArea, type ScrollAreaApi, type ScrollAreaScrollInfo } from "@/ui/scroll-area";

const mountArea = (props: Record<string, unknown> = {}) =>
  mount(ScrollArea, {
    attachTo: document.body,
    props: { orientation: "both", ...props },
    attrs: { style: "height: 300px; width: 400px" },
    slots: { default: () => h("div", { style: "height: 1200px; width: 800px" }) },
  });

const apiOf = (wrapper: ReturnType<typeof mountArea>) => wrapper.vm as unknown as ScrollAreaApi;

it("exposes the scroll target", async () => {
  const wrapper = mountArea();
  const viewport = wrapper.element.querySelector("[data-slot=scroll-area-viewport]");

  expect(apiOf(wrapper).getScrollTarget()).toBe(viewport);

  wrapper.unmount();
});

it("reports position, percentage and sizes", async () => {
  const wrapper = mountArea();
  const api = apiOf(wrapper);
  const viewport = (wrapper.element as Element).querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")!;

  await vi.waitFor(() => expect(api.getScroll().verticalSize).toBe(1200));

  viewport.scrollTop = 450;
  viewport.scrollLeft = 200;

  await vi.waitFor(() => expect(api.getScrollPosition()).toEqual({ top: 450, left: 200 }));
  expect(api.getScrollPercentage()).toEqual({ top: 0.5, left: 0.5 });

  const info = api.getScroll();
  expect(info.verticalContainerSize).toBe(300);
  expect(info.verticalContainerInnerSize).toBe(300);
  expect(info.horizontalSize).toBe(800);
  expect(info.horizontalContainerSize).toBe(400);

  wrapper.unmount();
});

it("sets the position on both axes", async () => {
  const wrapper = mountArea();
  const api = apiOf(wrapper);
  const viewport = (wrapper.element as Element).querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")!;

  await vi.waitFor(() => expect(api.getScroll().verticalSize).toBe(1200));

  api.setScrollPosition("vertical", 300);
  api.setScrollPosition("horizontal", 100);

  expect(viewport.scrollTop).toBe(300);
  expect(viewport.scrollLeft).toBe(100);

  wrapper.unmount();
});

it("sets the position by percentage", async () => {
  const wrapper = mountArea();
  const api = apiOf(wrapper);
  const viewport = (wrapper.element as Element).querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")!;

  await vi.waitFor(() => expect(api.getScroll().verticalSize).toBe(1200));

  api.setScrollPercentage("vertical", 0.5);
  expect(viewport.scrollTop).toBe(450);

  wrapper.unmount();
});

it("animates when a duration is given", async () => {
  const wrapper = mountArea();
  const api = apiOf(wrapper);
  const viewport = (wrapper.element as Element).querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")!;

  await vi.waitFor(() => expect(api.getScroll().verticalSize).toBe(1200));

  api.setScrollPosition("vertical", 600, 200);
  expect(viewport.scrollTop).toBe(0);
  await vi.waitFor(() => expect(viewport.scrollTop).toBe(600), { timeout: 2000 });

  wrapper.unmount();
});

it("emits every field of the payload plus a usable ref", async () => {
  const wrapper = mountArea();
  const viewport = (wrapper.element as Element).querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")!;

  await vi.waitFor(() => expect(apiOf(wrapper).getScroll().verticalSize).toBe(1200));

  viewport.scrollTop = 450;

  await vi.waitFor(() => expect(wrapper.emitted("scroll")).toBeTruthy());

  const events = wrapper.emitted("scroll")!;
  const payload = events.at(-1)![0] as ScrollAreaScrollInfo & { ref: ScrollAreaApi };

  expect(payload.verticalPosition).toBe(450);
  expect(payload.verticalPercentage).toBe(0.5);
  expect(payload.verticalSize).toBe(1200);
  expect(payload.verticalContainerSize).toBe(300);
  expect(payload.verticalContainerInnerSize).toBe(300);
  expect(payload.horizontalPosition).toBe(0);
  expect(payload.horizontalPercentage).toBe(0);
  expect(payload.horizontalSize).toBe(800);
  expect(payload.horizontalContainerSize).toBe(400);
  expect(payload.horizontalContainerInnerSize).toBe(400);

  payload.ref.setScrollPosition("vertical", 0);
  expect(viewport.scrollTop).toBe(0);

  wrapper.unmount();
});

it("scrolls to the end of content that changed since the last measurement", async () => {
  const tall = ref(false);
  const wrapper = mount(ScrollArea, {
    attachTo: document.body,
    attrs: { style: "height: 300px; width: 400px" },
    slots: { default: () => h("div", { style: { height: tall.value ? "2400px" : "600px" } }) },
  });
  const api = wrapper.vm as unknown as ScrollAreaApi;
  const viewport = wrapper.get<HTMLElement>("[data-slot=scroll-area-viewport]").element;

  await vi.waitFor(() => expect(api.getScroll().verticalSize).toBe(600));
  tall.value = true;
  await nextTick();
  api.setScrollPercentage("vertical", 1);

  await vi.waitFor(() => expect(viewport.scrollTop).toBe(2100));
  wrapper.unmount();
});
