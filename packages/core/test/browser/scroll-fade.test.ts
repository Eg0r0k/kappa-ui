import { mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import { defineComponent, h, ref, withDirectives } from "vue";

import { vScrollFade } from "../../src/scroll-fade";

const host = (style: string, contentStyle: string, attrs: Record<string, string> = {}) => {
  const content = ref(contentStyle);
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        withDirectives(
          h("div", { "data-test": "host", style: `overflow: auto; ${style}`, ...attrs }, [
            h("div", { style: content.value }),
          ]),
          [[vScrollFade]],
        ),
    }),
    { attachTo: document.body },
  );
  return { wrapper, content, element: wrapper.element as HTMLElement };
};

const edges = (element: HTMLElement) =>
  ["x-start", "x-end", "y-start", "y-end"].filter((edge) => element.hasAttribute(`data-overflow-${edge}`));

const withoutScrollTimelines = () =>
  vi.spyOn(CSS, "supports").mockImplementation((query: string) => !query.includes("animation-timeline"));

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

it("leaves the element alone where scroll-driven animations run", () => {
  const { element, wrapper } = host("height: 100px", "height: 500px");

  expect(element.hasAttribute("data-scroll-fade")).toBe(false);
  expect(edges(element)).toEqual([]);
  wrapper.unmount();
});

it("marks the block edges it can still scroll towards", async () => {
  withoutScrollTimelines();
  const { element, wrapper } = host("height: 100px", "height: 500px");

  expect(element.hasAttribute("data-scroll-fade")).toBe(true);
  expect(edges(element)).toEqual(["y-end"]);

  element.scrollTop = 200;
  await vi.waitFor(() => expect(edges(element)).toEqual(["y-start", "y-end"]));

  element.scrollTop = 400;
  await vi.waitFor(() => expect(edges(element)).toEqual(["y-start"]));
  wrapper.unmount();
});

it("marks the inline edges in reading order in RTL", async () => {
  withoutScrollTimelines();
  const { element, wrapper } = host("width: 200px", "width: 600px; height: 20px", { dir: "rtl" });

  expect(edges(element)).toEqual(["x-end"]);

  element.scrollLeft = -400;
  await vi.waitFor(() => expect(edges(element)).toEqual(["x-start"]));
  wrapper.unmount();
});

it("follows content that grows past the container", async () => {
  withoutScrollTimelines();
  const { element, content, wrapper } = host("height: 100px", "height: 50px");

  expect(edges(element)).toEqual([]);

  content.value = "height: 500px";
  await vi.waitFor(() => expect(edges(element)).toEqual(["y-end"]));
  wrapper.unmount();
});

it("removes its attributes when unmounted", () => {
  withoutScrollTimelines();
  const { element, wrapper } = host("height: 100px", "height: 500px");

  wrapper.unmount();

  expect(element.hasAttribute("data-scroll-fade")).toBe(false);
  expect(edges(element)).toEqual([]);
});
