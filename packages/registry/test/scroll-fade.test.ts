import { mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { h } from "vue";

import ScrollAreaEdgeFade from "@/examples/scroll-area/ScrollAreaEdgeFade.vue";
import { ScrollArea } from "@/ui/scroll-area";

afterEach(() => {
  document.body.innerHTML = "";
});

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
  const wrapper = document.createElement("div");
  wrapper.className = "scroll-fade-overlay";
  wrapper.style.height = "100px";
  wrapper.style.overflow = "hidden";
  wrapper.innerHTML = '<div class="h-full overflow-y-auto" style="height: 100%">'
    + '<div style="height: 1000px"></div>'
    + "</div>";
  document.body.append(wrapper);

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

  wrapper.remove();
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
