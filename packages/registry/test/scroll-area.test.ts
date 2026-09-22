import { mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import { h } from "vue";

import { ScrollArea } from "@/ui/scroll-area";

type MountOptions = {
  props?: Record<string, unknown>;
  attrs?: Record<string, unknown>;
  content?: { height: string; width: string };
};

const mountArea = ({
  props = {},
  attrs = {},
  content = { height: "1200px", width: "400px" },
}: MountOptions = {}) =>
  mount(ScrollArea, {
    attachTo: document.body,
    props,
    attrs: { style: "height: 300px; width: 400px", ...attrs },
    slots: {
      default: () => h("div", { style: `height: ${content.height}; width: ${content.width}` }),
    },
  });

const partsOf = (root: Element) => ({
  viewport: root.querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")!,
  content: root.querySelector<HTMLElement>("[data-slot=scroll-area-content]")!,
  verticalThumb: root.querySelector<HTMLElement>("[data-slot=scroll-area-thumb][data-axis=vertical]")!,
  horizontalThumb: root.querySelector<HTMLElement>("[data-slot=scroll-area-thumb][data-axis=horizontal]")!,
  verticalBar: root.querySelector<HTMLElement>("[data-slot=scroll-area-bar][data-axis=vertical]")!,
  horizontalBar: root.querySelector<HTMLElement>("[data-slot=scroll-area-bar][data-axis=horizontal]")!,
});

afterEach(() => {
  document.body.innerHTML = "";
});

it("renders every slot of the structure", () => {
  const wrapper = mountArea();
  const parts = partsOf(wrapper.element);

  expect(wrapper.attributes("data-slot")).toBe("scroll-area");
  expect(parts.viewport).not.toBeNull();
  expect(parts.content).not.toBeNull();
  expect(parts.verticalThumb).not.toBeNull();
  expect(
    (wrapper.element as Element).querySelector(
      "[data-slot=scroll-area-thumb][data-axis=horizontal]",
    ),
  ).toBeNull();
  expect(parts.verticalBar.getAttribute("aria-hidden")).toBe("true");

  wrapper.unmount();
});

it("gives each bar and thumb a cross-axis size that fits inside its bar", async () => {
  const vertical = mountArea();
  const horizontal = mountArea({
    props: { orientation: "horizontal" },
    content: { height: "100px", width: "1200px" },
  });

  const measure = async (
    wrapper: ReturnType<typeof mountArea>,
    axis: "vertical" | "horizontal",
  ) => {
    const root = wrapper.element as Element;
    const bar = root.querySelector<HTMLElement>(
      `[data-slot=scroll-area-bar][data-axis=${axis}]`,
    )!;
    const thumb = root.querySelector<HTMLElement>(
      `[data-slot=scroll-area-thumb][data-axis=${axis}]`,
    )!;

    await vi.waitFor(() =>
      expect(
        axis === "vertical" ? thumb.style.height : thumb.style.width,
      ).not.toBe(""),
    );

    const cross = (el: HTMLElement) =>
      axis === "vertical"
        ? el.getBoundingClientRect().width
        : el.getBoundingClientRect().height;

    expect(cross(thumb)).toBeGreaterThan(0);
    expect(cross(thumb)).toBeLessThanOrEqual(cross(bar));
  };

  await measure(vertical, "vertical");
  await measure(horizontal, "horizontal");

  vertical.unmount();
  horizontal.unmount();
});

it("sizes the vertical thumb from the visible fraction", async () => {
  const wrapper = mountArea();
  const { verticalThumb } = partsOf(wrapper.element);

  await vi.waitFor(() => expect(verticalThumb.style.height).toBe("75px"));
  expect(verticalThumb.style.top).toBe("0px");

  wrapper.unmount();
});

it("moves the thumb as the viewport scrolls", async () => {
  const wrapper = mountArea();
  const { viewport, verticalThumb } = partsOf(wrapper.element);

  await vi.waitFor(() => expect(verticalThumb.style.height).toBe("75px"));

  viewport.scrollTop = 450;
  await vi.waitFor(() => expect(verticalThumb.style.top).toBe("112.5px"));

  viewport.scrollTop = 900;
  await vi.waitFor(() => expect(verticalThumb.style.top).toBe("225px"));

  wrapper.unmount();
});

it("hides the thumb when its own axis does not overflow", async () => {
  const wrapper = mountArea({ content: { height: "100px", width: "400px" } });
  const { verticalThumb } = partsOf(wrapper.element);

  await vi.waitFor(() =>
    expect(verticalThumb.className).toContain("opacity-0"),
  );

  wrapper.unmount();
});

it("shrinks the track and shifts the thumb by the vertical offset", async () => {
  const wrapper = mountArea({ props: { verticalOffset: [20, 30] } });
  const { viewport, verticalThumb } = partsOf(wrapper.element);

  await vi.waitFor(() => expect(verticalThumb.style.height).toBe("52px"));
  expect(verticalThumb.style.top).toBe("20px");

  viewport.scrollTop = 900;
  await vi.waitFor(() => expect(verticalThumb.style.top).toBe("218px"));

  wrapper.unmount();
});

it("positions the horizontal thumb from the inline start under rtl", async () => {
  const wrapper = mountArea({
    props: { orientation: "horizontal" },
    attrs: { style: "height: 300px; width: 400px", dir: "rtl" },
    content: { height: "100px", width: "1200px" },
  });
  const { viewport, horizontalThumb } = partsOf(wrapper.element);

  await vi.waitFor(() => expect(horizontalThumb.style.width).toBe("133px"));
  expect(horizontalThumb.style.insetInlineStart).toBe("0px");

  viewport.scrollLeft = -400;
  await vi.waitFor(() => expect(horizontalThumb.style.insetInlineStart).toBe("133.5px"));

  wrapper.unmount();
});

it("positions the horizontal thumb from the inline start under rtl with a non-zero horizontalOffset", async () => {
  const wrapper = mountArea({
    props: { orientation: "horizontal", horizontalOffset: [10, 30] },
    attrs: { style: "height: 300px; width: 400px", dir: "rtl" },
    content: { height: "100px", width: "1200px" },
  });
  const { viewport, horizontalThumb } = partsOf(wrapper.element);

  await vi.waitFor(() => expect(horizontalThumb.style.width).toBe("108px"));
  expect(horizontalThumb.style.insetInlineStart).toBe("30px");

  viewport.scrollLeft = -400;
  await vi.waitFor(() => expect(horizontalThumb.style.insetInlineStart).toBe("156px"));

  wrapper.unmount();
});
