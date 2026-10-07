import { vScrollFade } from "@kappa-ui/core/scroll-fade";
import { mount } from "@vue/test-utils";
import { expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { defineComponent, h, withDirectives } from "vue";

import ScrollAreaEdgeFade from "@/examples/scroll-area/ScrollAreaEdgeFade.vue";
import { Card } from "@/ui/card";
import { dialogSurface } from "@/ui/dialog";
import { listboxVariants } from "@/ui/listbox";
import { ScrollArea } from "@/ui/scroll-area";
import { overlaySurface } from "@/ui/popover";

it("masks the edges of a scroll container in mask mode", () => {
  const element = document.createElement("div");
  element.className = "scroll-fade-x overflow-x-auto";
  element.style.width = "200px";
  element.innerHTML = '<div style="width: 600px; height: 20px"></div>';
  document.body.append(element);

  expect(getComputedStyle(element).maskImage).not.toBe("none");
});

it("shows an overlay only at the edges a scroll area can still scroll towards", async () => {
  const wrapper = mount(ScrollArea, {
    attachTo: document.body,
    props: { orientation: "horizontal" },
    attrs: { class: "scroll-fade-overlay-x", style: "height: 100px; width: 200px" },
    slots: { default: () => h("div", { style: "width: 600px; height: 50px" }) },
  });
  const root = wrapper.element as HTMLElement;

  await vi.waitFor(() => {
    expect(getComputedStyle(root, "::after").opacity).toBe("1");
    expect(getComputedStyle(root, "::before").opacity).toBe("0");
  });

  root.querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")!.scrollLeft = 400;
  await vi.waitFor(() => {
    expect(getComputedStyle(root, "::after").opacity).toBe("0");
    expect(getComputedStyle(root, "::before").opacity).toBe("1");
  });
  wrapper.unmount();
});

it("hides both overlays with scroll-fade-overlay-none", () => {
  const element = document.createElement("div");
  element.className = "scroll-fade-overlay-x scroll-fade-overlay-none";
  document.body.append(element);

  expect(getComputedStyle(element, "::before").display).toBe("none");
  expect(getComputedStyle(element, "::after").display).toBe("none");
});

it("fades a wrapper's edges from its only scrolling child", async () => {
  const mounted = mount(
    defineComponent({
      setup: () => () =>
        h("div", { class: "scroll-fade-overlay", style: "height: 100px; overflow: hidden" }, [
          withDirectives(h("div", { class: "h-full overflow-y-auto" }, [h("div", { style: "height: 1000px" })]), [
            [vScrollFade],
          ]),
        ]),
    }),
    { attachTo: document.body },
  );
  const wrapper = mounted.element as HTMLElement;
  const child = wrapper.firstElementChild as HTMLElement;

  await vi.waitFor(() => {
    expect(getComputedStyle(wrapper, "::before").opacity).toBe("0");
    expect(getComputedStyle(wrapper, "::after").opacity).toBe("1");
  });

  child.scrollTop = child.scrollHeight;
  await vi.waitFor(() => {
    expect(getComputedStyle(wrapper, "::before").opacity).toBe("1");
    expect(getComputedStyle(wrapper, "::after").opacity).toBe("0");
  });

  mounted.unmount();
});

it("masks only the edges a scroll container can still scroll towards", async () => {
  const mounted = mount(
    defineComponent({
      setup: () => () =>
        withDirectives(
          h("div", { class: "scroll-fade overflow-y-auto", style: "height: 100px; --scroll-fade-size: 20px" }, [
            h("div", { style: "height: 1000px" }),
          ]),
          [[vScrollFade]],
        ),
    }),
    { attachTo: document.body },
  );
  const element = mounted.element as HTMLElement;
  const edge = (name: "t" | "b") => getComputedStyle(element).getPropertyValue(`--scroll-fade-${name}`);

  await vi.waitFor(() => {
    expect(edge("t")).toBe("0px");
    expect(edge("b")).toBe("20px");
  });

  element.scrollTop = element.scrollHeight;
  await vi.waitFor(() => {
    expect(edge("t")).toBe("20px");
    expect(edge("b")).toBe("0px");
  });

  mounted.unmount();
});

it.skipIf(CSS.supports("animation-timeline: scroll()"))(
  "keeps both mask edges without the directive where scroll-driven animations are missing",
  () => {
    const element = document.createElement("div");
    element.className = "scroll-fade overflow-y-auto";
    element.style.cssText = "height: 100px; --scroll-fade-size: 20px";
    element.innerHTML = '<div style="height: 1000px"></div>';
    document.body.append(element);

    const style = getComputedStyle(element);
    expect(style.getPropertyValue("--scroll-fade-t")).toBe("20px");
    expect(style.getPropertyValue("--scroll-fade-b")).toBe("20px");
  },
);

it.each([
  { utility: "scroll-fade-l", edge: "s", atStart: "20px", atEnd: "0px" },
  { utility: "scroll-fade-r", edge: "e", atStart: "0px", atEnd: "20px" },
])("keeps $utility on its physical edge in RTL", async ({ utility, edge, atStart, atEnd }) => {
  const mounted = mount(
    defineComponent({
      setup: () => () =>
        withDirectives(
          h(
            "div",
            { class: `${utility} overflow-x-auto`, dir: "rtl", style: "width: 200px; --scroll-fade-size: 20px" },
            [h("div", { style: "width: 1000px; height: 10px" })],
          ),
          [[vScrollFade]],
        ),
    }),
    { attachTo: document.body },
  );
  const element = mounted.element as HTMLElement;
  const value = () => getComputedStyle(element).getPropertyValue(`--scroll-fade-${edge}`);

  await vi.waitFor(() => expect(value()).toBe(atStart));

  element.scrollLeft = -element.scrollWidth;
  await vi.waitFor(() => expect(value()).toBe(atEnd));

  mounted.unmount();
});

it("hides the start overlay with scroll-fade-overlay-e", () => {
  const wrapper = mount(ScrollArea, {
    attachTo: document.body,
    props: { orientation: "horizontal" },
    attrs: { class: "scroll-fade-overlay-e", style: "height: 100px; width: 200px" },
    slots: { default: () => h("div", { style: "width: 600px; height: 50px" }) },
  });
  const root = wrapper.element as HTMLElement;

  expect(getComputedStyle(root, "::before").display).toBe("none");
  expect(getComputedStyle(root, "::after").display).not.toBe("none");

  wrapper.unmount();
});

it("runs the RTL start gradient from the right and isolates the viewport", () => {
  const wrapper = mount(ScrollArea, {
    attachTo: document.body,
    props: { orientation: "horizontal" },
    attrs: {
      class: "scroll-fade-overlay-x",
      style: "height: 100px; width: 200px",
      dir: "rtl",
    },
    slots: { default: () => h("div", { style: "width: 600px; height: 50px" }) },
  });
  const root = wrapper.element as HTMLElement;
  const viewport = root.querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")!;

  expect(getComputedStyle(root, "::before").backgroundImage).toContain("to left");
  expect(getComputedStyle(viewport).isolation).toBe("isolate");

  wrapper.unmount();
});

it("shows each step button only when its direction can scroll", async () => {
  const wrapper = mount(ScrollAreaEdgeFade, { attachTo: document.body });
  const button = (name: string) => document.querySelector<HTMLElement>(`[data-test=${name}]`)!;

  await vi.waitFor(() => {
    expect(getComputedStyle(button("forward")).display).not.toBe("none");
    expect(getComputedStyle(button("back")).display).toBe("none");
  });

  await userEvent.click(button("forward"));
  await vi.waitFor(() => expect(getComputedStyle(button("back")).display).not.toBe("none"));
  wrapper.unmount();
});

it("centres the chip row in the edge-fade area", () => {
  const wrapper = mount(ScrollAreaEdgeFade, { attachTo: document.body });
  const area = document.querySelector<HTMLElement>("[data-slot=scroll-area]")!.getBoundingClientRect();
  const chip = document.querySelector<HTMLElement>("[data-slot=badge]")!.getBoundingClientRect();

  expect(chip.top + chip.height / 2).toBeCloseTo(area.top + area.height / 2, 0);
  wrapper.unmount();
});

it("adds up quick steps", async () => {
  const wrapper = mount(ScrollAreaEdgeFade, { attachTo: document.body });
  const viewport = document.querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")!;
  const forward = document.querySelector<HTMLElement>("[data-test=forward]")!;

  await vi.waitFor(() => expect(getComputedStyle(forward).display).not.toBe("none"));
  await userEvent.click(forward);
  await userEvent.click(forward);

  const expected = Math.min(viewport.scrollWidth - viewport.clientWidth, 2 * 0.8 * viewport.clientWidth);
  await vi.waitFor(() => expect(Math.abs(viewport.scrollLeft - expected)).toBeLessThan(1), { timeout: 2000 });
  wrapper.unmount();
});

it("runs the overlay gradient to the background of the card or popover it sits in", () => {
  const root = document.createElement("div");
  root.style.cssText = "--background: rgb(1, 1, 1); --card: rgb(2, 2, 2); --popover: rgb(3, 3, 3)";
  document.body.append(root);
  const gradient = (surface: Element) =>
    getComputedStyle(surface.querySelector(".scroll-fade-overlay-y")!, "::before").backgroundImage;
  const surface = (className: string) => {
    const element = document.createElement("div");
    element.className = className;
    element.innerHTML = '<div class="scroll-fade-overlay-y"></div>';
    root.append(element);
    return element;
  };
  const card = mount(Card, { attachTo: root, slots: { default: () => h("div", { class: "scroll-fade-overlay-y" }) } });

  expect(gradient(surface(""))).toContain("rgb(1, 1, 1)");
  expect(gradient(card.element as Element)).toContain("rgb(2, 2, 2)");
  expect(gradient(surface(listboxVariants()))).toContain("rgb(2, 2, 2)");
  expect(gradient(surface(overlaySurface))).toContain("rgb(3, 3, 3)");
  expect(gradient(surface(dialogSurface))).toContain("rgb(3, 3, 3)");
});
