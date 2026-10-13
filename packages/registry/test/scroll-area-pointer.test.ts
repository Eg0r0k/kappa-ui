import { mount } from "@vue/test-utils";
import { expect, it, vi } from "vitest";
import { cdp } from "vitest/browser";
import { h } from "vue";

import { ScrollArea } from "@/ui/scroll-area";

const mountArea = (
  attrs: Record<string, unknown> = {},
  contentStyle = "height: 1200px; width: 400px",
  props: Record<string, unknown> = {},
) =>
  mount(ScrollArea, {
    attachTo: document.body,
    props: { visible: true, ...props },
    attrs: { style: "height: 300px; width: 400px", ...attrs },
    slots: { default: () => h("div", { style: contentStyle }) },
  });

const partsOf = (root: Element) => ({
  viewport: root.querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")!,
  verticalBar: root.querySelector<HTMLElement>("[data-slot=scroll-area-bar][data-axis=vertical]")!,
  verticalThumb: root.querySelector<HTMLElement>("[data-slot=scroll-area-thumb][data-axis=vertical]")!,
  horizontalThumb: root.querySelector<HTMLElement>("[data-slot=scroll-area-thumb][data-axis=horizontal]")!,
});

const pointer = (type: string, init: PointerEventInit) =>
  new PointerEvent(type, { bubbles: true, pointerId: 1, isPrimary: true, ...init });

it("scrolls the content by the drag multiplier", async () => {
  const wrapper = mountArea();
  const { viewport, verticalThumb } = partsOf(wrapper.element);

  await vi.waitFor(() => expect(verticalThumb.style.height).toBe("75px"));

  const start = verticalThumb.getBoundingClientRect();
  verticalThumb.dispatchEvent(pointer("pointerdown", { clientX: start.x + 5, clientY: start.y + 5 }));
  verticalThumb.dispatchEvent(pointer("pointermove", { clientX: start.x + 5, clientY: start.y + 50 }));

  expect(viewport.scrollTop).toBe(180);

  verticalThumb.dispatchEvent(pointer("pointerup", { clientX: start.x + 5, clientY: start.y + 50 }));

  wrapper.unmount();
});

it("keeps the bars visible while dragging", async () => {
  const wrapper = mount(ScrollArea, {
    attachTo: document.body,
    props: { delay: 50 },
    attrs: { style: "height: 300px; width: 400px" },
    slots: { default: () => h("div", { style: "height: 1200px; width: 400px" }) },
  });
  const { verticalThumb } = partsOf(wrapper.element);

  await vi.waitFor(() => expect(verticalThumb.className).toContain("opacity-0"));
  await wrapper.trigger("mouseenter");
  await vi.waitFor(() => expect(verticalThumb.className).not.toContain("opacity-0"));

  const start = verticalThumb.getBoundingClientRect();
  verticalThumb.dispatchEvent(pointer("pointerdown", { clientX: start.x + 5, clientY: start.y + 5 }));
  await wrapper.trigger("mouseleave");

  await new Promise((resolve) => setTimeout(resolve, 150));
  expect(verticalThumb.className).not.toContain("opacity-0");

  verticalThumb.dispatchEvent(pointer("pointerup", { clientX: start.x + 5, clientY: start.y + 5 }));

  wrapper.unmount();
});

it("jumps when the bar is pressed away from the thumb", async () => {
  const wrapper = mountArea();
  const { viewport, verticalBar, verticalThumb } = partsOf(wrapper.element);

  await vi.waitFor(() => expect(verticalThumb.style.height).toBe("75px"));

  const bar = verticalBar.getBoundingClientRect();
  verticalBar.dispatchEvent(pointer("pointerdown", { clientX: bar.x + 5, clientY: bar.y + 250 }));

  expect(viewport.scrollTop).toBe(850);

  verticalBar.dispatchEvent(pointer("pointerup", { clientX: bar.x + 5, clientY: bar.y + 250 }));

  wrapper.unmount();
});

it("jumps backwards when the bar is pressed above the thumb", async () => {
  const wrapper = mountArea();
  const { viewport, verticalBar, verticalThumb } = partsOf(wrapper.element);

  await vi.waitFor(() => expect(verticalThumb.style.height).toBe("75px"));

  viewport.scrollTop = 900;
  await vi.waitFor(() => expect(verticalThumb.style.transform).toBe("translateY(225px)"));

  const bar = verticalBar.getBoundingClientRect();
  verticalBar.dispatchEvent(pointer("pointerdown", { clientX: bar.x + 5, clientY: bar.y + 40 }));

  expect(viewport.scrollTop).toBe(10);

  verticalBar.dispatchEvent(pointer("pointerup", { clientX: bar.x + 5, clientY: bar.y + 40 }));

  wrapper.unmount();
});

it("starts a bar jump or a thumb drag only with the primary button", async () => {
  const wrapper = mountArea();
  const { viewport, verticalBar, verticalThumb } = partsOf(wrapper.element);
  await vi.waitFor(() => expect(verticalThumb.style.height).toBe("75px"));

  const bar = verticalBar.getBoundingClientRect();
  verticalBar.dispatchEvent(
    pointer("pointerdown", { button: 2, buttons: 2, clientX: bar.x + 5, clientY: bar.y + 250 }),
  );
  verticalBar.dispatchEvent(pointer("pointerup", { button: 2, buttons: 0, clientX: bar.x + 5, clientY: bar.y + 250 }));
  expect(viewport.scrollTop).toBe(0);

  const thumb = verticalThumb.getBoundingClientRect();
  verticalThumb.dispatchEvent(
    pointer("pointerdown", { button: 1, buttons: 4, clientX: thumb.x + 3, clientY: thumb.y + 5 }),
  );
  verticalThumb.dispatchEvent(
    pointer("pointermove", { button: -1, buttons: 4, clientX: thumb.x + 3, clientY: thumb.y + 55 }),
  );
  expect(viewport.scrollTop).toBe(0);

  wrapper.unmount();
});

it("does not jump when the press lands on the thumb", async () => {
  const wrapper = mountArea();
  const { viewport, verticalBar, verticalThumb } = partsOf(wrapper.element);

  await vi.waitFor(() => expect(verticalThumb.style.height).toBe("75px"));

  const bar = verticalBar.getBoundingClientRect();
  verticalBar.dispatchEvent(pointer("pointerdown", { clientX: bar.x + 5, clientY: bar.y + 40 }));

  expect(viewport.scrollTop).toBe(0);

  verticalBar.dispatchEvent(pointer("pointerup", { clientX: bar.x + 5, clientY: bar.y + 40 }));

  wrapper.unmount();
});

it("inverts the horizontal drag direction under rtl", async () => {
  const wrapper = mountArea({ dir: "rtl" }, "height: 100px; width: 1200px", {
    orientation: "horizontal",
  });
  const { viewport, horizontalThumb } = partsOf(wrapper.element);

  await vi.waitFor(() => expect(horizontalThumb.style.width).toBe("133px"));

  const start = horizontalThumb.getBoundingClientRect();
  horizontalThumb.dispatchEvent(pointer("pointerdown", { clientX: start.x + 5, clientY: start.y + 5 }));
  horizontalThumb.dispatchEvent(pointer("pointermove", { clientX: start.x - 95, clientY: start.y + 5 }));

  expect(viewport.scrollLeft).toBeLessThan(0);
  expect(viewport.scrollLeft).toBeCloseTo(-300, 0);

  horizontalThumb.dispatchEvent(pointer("pointerup", { clientX: start.x - 95, clientY: start.y + 5 }));

  wrapper.unmount();
});

it("lets touches on a touch screen through the bar and the thumb to the content", async () => {
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  try {
    expect(matchMedia("(pointer: coarse)").matches).toBe(true);
    const wrapper = mountArea();
    const { viewport, verticalBar, verticalThumb } = partsOf(wrapper.element);
    await vi.waitFor(() => expect(verticalThumb.style.height).toBe("75px"));

    for (const part of [verticalThumb, verticalBar]) {
      const box = part.getBoundingClientRect();
      const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height - 2);
      expect(viewport.contains(hit)).toBe(true);
    }

    wrapper.unmount();
  } finally {
    await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: false });
  }
});

const wheelAt = async (x: number, y: number) => {
  const frame = window.frameElement as HTMLElement | null;
  const box = frame?.getBoundingClientRect();
  const scale = box && frame ? box.width / frame.offsetWidth : 1;
  const left = box && frame ? box.left + frame.clientLeft * scale : 0;
  const top = box && frame ? box.top + frame.clientTop * scale : 0;
  const at = { x: left + x * scale, y: top + y * scale };
  await cdp().send("Input.dispatchMouseEvent", { type: "mouseMoved", ...at });
  await cdp().send("Input.dispatchMouseEvent", { type: "mouseWheel", ...at, deltaX: 0, deltaY: 120 });
};

it("scrolls the area, not the page, on a wheel over the bar or the thumb", async () => {
  const wrapper = mountArea();
  const spacer = document.body.appendChild(document.createElement("div"));
  spacer.style.height = "3000px";
  const page = document.scrollingElement!;
  const { viewport, verticalBar, verticalThumb } = partsOf(wrapper.element);
  await vi.waitFor(() => expect(verticalThumb.style.height).toBe("75px"));

  for (const part of [verticalBar, verticalThumb]) {
    viewport.scrollTop = 0;
    page.scrollTop = 0;
    await new Promise((resolve) => setTimeout(resolve, 100));
    const box = part.getBoundingClientRect();
    await wheelAt(box.x + box.width / 2, part === verticalBar ? box.y + 200 : box.y + box.height / 2);
    await vi.waitFor(() => expect(viewport.scrollTop + page.scrollTop).toBeGreaterThan(0));
    expect(viewport.scrollTop).toBeGreaterThan(0);
    expect(page.scrollTop).toBe(0);
  }
  spacer.remove();
  wrapper.unmount();
});
