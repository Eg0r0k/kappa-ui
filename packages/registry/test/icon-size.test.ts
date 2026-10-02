import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { h } from "vue";

import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import { Item, ItemMedia } from "@/ui/item";

afterEach(() => {
  document.body.innerHTML = "";
});

const icon = (attrs: Record<string, unknown> = {}) => h("svg", { viewBox: "0 0 24 24", ...attrs });

const iconWidth = (props: Record<string, unknown>, attrs: Record<string, unknown> = {}) =>
  mount({ render: () => h(Button, props, () => [icon(attrs), "Save"]) }, { attachTo: document.body })
    .get("svg")
    .element.getBoundingClientRect().width;

describe("icon-size", () => {
  it("sizes an icon from the component's size", () => {
    expect(iconWidth({})).toBe(16);
    expect(iconWidth({ size: "xs" })).toBe(14);
  });

  it("leaves an icon with its own size-* class alone", () => {
    expect(iconWidth({}, { class: "size-6" })).toBe(24);
  });

  it("takes an icon-size-* from class over the component's", () => {
    expect(iconWidth({ class: "icon-size-5" })).toBe(20);
    expect(iconWidth({ size: "xs", class: "icon-size-6" })).toBe(24);
  });

  it("reads a custom property", () => {
    expect(iconWidth({ class: "icon-size-(--probe) [--probe:1.375rem]" })).toBe(22);
  });

  it("follows a group size variant", () => {
    mount(
      { render: () => h(Item, { size: "lg" }, () => h(ItemMedia, { variant: "icon" }, () => icon())) },
      { attachTo: document.body },
    );
    expect(document.querySelector("svg")!.getBoundingClientRect().width).toBe(20);
  });

  it("merges in cn like any other utility", () => {
    expect(cn("icon-size-4", "icon-size-3.5")).toBe("icon-size-3.5");
    expect(cn("icon-size-4", "icon-size-(--menu-icon)")).toBe("icon-size-(--menu-icon)");
    expect(cn("icon-size-4", "size-4")).toBe("icon-size-4 size-4");
  });
});
