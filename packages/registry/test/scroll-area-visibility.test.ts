import { mount } from "@vue/test-utils";
import { beforeEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { h } from "vue";

import { ScrollArea } from "@/ui/scroll-area";

const mountArea = (props: Record<string, unknown> = {}) =>
  mount(ScrollArea, {
    attachTo: document.body,
    props,
    attrs: { style: "height: 300px; width: 400px" },
    slots: { default: () => h("div", { style: "height: 1200px; width: 400px" }) },
  });

const thumbOf = (root: Element) =>
  root.querySelector<HTMLElement>("[data-slot=scroll-area-thumb][data-axis=vertical]")!;

beforeEach(async () => {
  const away = document.body.appendChild(document.createElement("div"));
  away.style.cssText = "position: fixed; right: 0; bottom: 0; width: 8px; height: 8px";
  await userEvent.hover(away);
  away.remove();
});

it("shows the bars while scrolling and hides them after the delay", async () => {
  const wrapper = mountArea({ delay: 100 });
  const thumb = thumbOf(wrapper.element);
  const viewport = wrapper.element.querySelector("[data-slot=scroll-area-viewport]")!;

  await vi.waitFor(() => expect(thumb.style.height).toBe("75px"));
  await vi.waitFor(() => expect(thumb.className).toContain("opacity-0"));

  viewport.scrollTop = 200;
  await vi.waitFor(() => expect(thumb.className).not.toContain("opacity-0"));
  await vi.waitFor(() => expect(thumb.className).toContain("opacity-0"), { timeout: 2000 });

  wrapper.unmount();
});

it("does not change the DOM synchronously on mouse enter", async () => {
  const wrapper = mountArea({ delay: 50 });
  const thumb = thumbOf(wrapper.element);

  await vi.waitFor(() => expect(thumb.className).toContain("opacity-0"));
  await new Promise((resolve) => setTimeout(resolve, 120));
  expect(thumb.className).toContain("opacity-0");

  await wrapper.trigger("mouseenter");
  expect(thumb.className).toContain("opacity-0");

  await vi.waitFor(() => expect(thumb.className).not.toContain("opacity-0"));

  wrapper.unmount();
});

it("stays hidden when the pointer leaves within the enter delay", async () => {
  const wrapper = mountArea({ delay: 50 });
  const thumb = thumbOf(wrapper.element);

  await vi.waitFor(() => expect(thumb.className).toContain("opacity-0"));

  await wrapper.trigger("mouseenter");
  await wrapper.trigger("mouseleave");

  await new Promise((resolve) => setTimeout(resolve, 150));
  expect(thumb.className).toContain("opacity-0");

  wrapper.unmount();
});

it("lets the visible prop override hover in both directions", async () => {
  const wrapper = mountArea({ visible: true, delay: 50 });
  const thumb = thumbOf(wrapper.element);

  await vi.waitFor(() => expect(thumb.style.height).toBe("75px"));
  await new Promise((resolve) => setTimeout(resolve, 150));
  expect(thumb.className).not.toContain("opacity-0");

  await wrapper.setProps({ visible: false });
  await wrapper.trigger("mouseenter");
  await new Promise((resolve) => setTimeout(resolve, 150));
  expect(thumb.className).toContain("opacity-0");

  wrapper.unmount();
});

it("marks the root and the content active while the bars show", async () => {
  const wrapper = mountArea({ visible: true });
  const content = wrapper.element.querySelector("[data-slot=scroll-area-content]")!;

  await vi.waitFor(() => expect(wrapper.element.hasAttribute("data-active")).toBe(true));
  expect(content.hasAttribute("data-active")).toBe(true);

  wrapper.unmount();
});

it("makes a scrollable viewport focusable and a full one not", async () => {
  const scrollable = mountArea();
  const viewport = scrollable.element.querySelector("[data-slot=scroll-area-viewport]")!;
  await vi.waitFor(() => expect(viewport.getAttribute("tabindex")).toBe("0"));
  scrollable.unmount();

  const full = mount(ScrollArea, {
    attachTo: document.body,
    attrs: { style: "height: 300px; width: 400px" },
    slots: { default: () => h("div", { style: "height: 50px; width: 50px" }) },
  });
  const fullViewport = full.element.querySelector("[data-slot=scroll-area-viewport]")!;
  await vi.waitFor(() => expect(fullViewport.hasAttribute("tabindex")).toBe(false));
  full.unmount();
});

it("honours an explicit tabindex", async () => {
  const wrapper = mountArea({ tabindex: -1 });
  const viewport = wrapper.element.querySelector("[data-slot=scroll-area-viewport]")!;

  await vi.waitFor(() => expect(viewport.getAttribute("tabindex")).toBe("-1"));

  wrapper.unmount();
});

it('renders no bar or thumb with :scrollbar="false"', () => {
  const wrapper = mount(ScrollArea, {
    attachTo: document.body,
    props: { scrollbar: false },
    attrs: { style: "height: 100px; width: 200px" },
    slots: { default: () => h("div", { style: "height: 600px" }) },
  });

  expect(wrapper.find("[data-slot=scroll-area-bar]").exists()).toBe(false);
  expect(wrapper.find("[data-slot=scroll-area-thumb]").exists()).toBe(false);
  wrapper.unmount();
});
