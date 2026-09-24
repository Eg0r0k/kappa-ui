import { mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import { h } from "vue";

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
