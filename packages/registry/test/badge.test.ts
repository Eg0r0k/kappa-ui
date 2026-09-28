import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { h } from "vue";

import { Badge } from "@/ui/badge";

afterEach(() => {
  document.body.innerHTML = "";
});

const render = (props: Record<string, unknown> = {}, children: () => unknown = () => "New") =>
  mount({ render: () => h(Badge, props, { default: children }) }, { attachTo: document.body }).get("[data-slot=badge]")
    .element as HTMLElement;

describe("Badge", () => {
  it("is a solid primary md span by default", () => {
    const badge = render();

    expect(badge.tagName).toBe("SPAN");
    expect(badge.dataset).toMatchObject({ variant: "solid", color: "primary", size: "md" });
    expect(getComputedStyle(badge).borderTopWidth).toBe("0px");
  });

  it.each([
    ["xs", 16],
    ["sm", 20],
    ["md", 24],
    ["lg", 28],
    ["xl", 32],
  ])("is %s at %ipx tall", (size, height) => {
    expect(render({ size }).getBoundingClientRect().height).toBe(height);
  });

  it("draws a border when outlined", () => {
    expect(getComputedStyle(render({ variant: "outline" })).borderTopWidth).toBe("1px");
  });

  it("renders a single character as a square", () => {
    const { width, height } = render({ square: true }, () => "1").getBoundingClientRect();
    expect(width).toBe(height);
  });

  it("keeps even padding around longer content when square", () => {
    const badge = render({ square: true }, () => "999");
    const style = getComputedStyle(badge);

    expect(style.paddingInlineStart).toBe("4px");
    expect(style.paddingInlineEnd).toBe("4px");
    expect(badge.getBoundingClientRect().width).toBeGreaterThan(badge.getBoundingClientRect().height);
  });

  it("trims the padding on the icon's side", () => {
    const start = getComputedStyle(render({}, () => [h("svg", { "data-icon": "inline-start" }), "New"]));
    expect([start.paddingInlineStart, start.paddingInlineEnd]).toEqual(["6px", "8px"]);

    document.body.innerHTML = "";
    const end = getComputedStyle(render({}, () => ["New", h("svg", { "data-icon": "inline-end" })]));
    expect([end.paddingInlineStart, end.paddingInlineEnd]).toEqual(["8px", "6px"]);
  });

  it("sizes an icon to the badge", () => {
    const badge = render({ size: "lg" }, () => [h("svg", { "data-icon": "inline-start" }), "New"]);
    expect(badge.querySelector("svg")!.getBoundingClientRect().width).toBe(16);
  });

  it("renders as a link through as-child", () => {
    const badge = render({ asChild: true }, () => h("a", { href: "#" }, "Changelog"));
    expect(badge.tagName).toBe("A");
  });
});

describe("Badge touch target", () => {
  it("grows the pressable area to 48px with touch-target", () => {
    expect(getComputedStyle(render({ touchTarget: "expand" }), "::after").height).toBe("48px");
  });

  it("reserves the touch area in layout with the wrapper touch target", () => {
    const style = getComputedStyle(render({ touchTarget: "wrapper" }));
    expect([style.marginTop, style.marginBottom]).toEqual(["12px", "12px"]);
  });
});

describe("Badge colour", () => {
  it("draws a colour the user declares on [data-slot][data-color]", () => {
    const style = document.createElement("style");
    style.textContent = '[data-slot][data-color="brand"] { --c: rgb(1, 2, 3); --c-fg: rgb(4, 5, 6); }';
    document.head.append(style);
    const badge = getComputedStyle(render({ color: "brand" }));
    expect([badge.backgroundColor, badge.color]).toEqual(["rgb(1, 2, 3)", "rgb(4, 5, 6)"]);
    style.remove();
  });
});
