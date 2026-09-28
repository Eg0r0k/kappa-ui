import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { h } from "vue";

import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { ButtonGroup } from "@/ui/button-group";

afterEach(() => {
  document.body.innerHTML = "";
});

const render = (props: Record<string, unknown> = {}) =>
  mount({ render: () => h(Button, props, () => "Button") }, { attachTo: document.body }).get("[data-slot=button]")
    .element as HTMLElement;

describe("Button", () => {
  it("is 28px tall at xs and 28px square at icon-xs", () => {
    expect(render({ size: "xs" }).getBoundingClientRect().height).toBe(28);

    const icon = render({ size: "icon-xs" }).getBoundingClientRect();
    expect([icon.width, icon.height]).toEqual([28, 28]);
  });

  it("draws the outline and subtle edges inside the box, so every variant is the same size", () => {
    const widths = ["solid", "soft", "subtle", "outline", "ghost"].map(
      (variant) => render({ variant }).getBoundingClientRect().width,
    );
    expect(new Set(widths).size).toBe(1);

    for (const variant of ["subtle", "outline"]) {
      const style = getComputedStyle(render({ variant }));
      expect(style.borderTopWidth).toBe("0px");
      expect(style.boxShadow).toContain("inset");
    }
  });

  it("overlaps subtle buttons in a group by the width of their edge", () => {
    const group = mount(
      {
        render: () =>
          h(ButtonGroup, () => [
            h(Button, { variant: "subtle" }, () => "One"),
            h(Button, { variant: "subtle" }, () => "Two"),
          ]),
      },
      { attachTo: document.body },
    ).element as HTMLElement;
    const [one, two] = [...group.children].map((child) => child.getBoundingClientRect());

    expect(two!.left).toBe(one!.right - 1);
  });

  it("reserves a 48px touch area around xs with the wrapper touch target", () => {
    const style = getComputedStyle(render({ size: "xs", touchTarget: "wrapper" }));
    expect([style.marginTop, style.marginBottom]).toEqual(["10px", "10px"]);
  });

  it("reserves 48px around every size with touch-target wrapper", () => {
    const margins = (props: Record<string, unknown>) => {
      const style = getComputedStyle(render({ touchTarget: "wrapper", ...props }));
      return [style.marginTop, style.marginLeft];
    };
    expect(margins({ size: "default" })).toEqual(["6px", "0px"]);
    expect(margins({ size: "icon" })).toEqual(["6px", "6px"]);
    expect(margins({ size: "xl" })).toEqual(["0px", "0px"]);
  });

  it("does not inherit a touch size from an ancestor", () => {
    const wrapper = mount(
      { render: () => h("div", { style: "--touch-w: 1rem" }, [h(Button, { touchTarget: "wrapper" }, () => "A")]) },
      { attachTo: document.body },
    );
    expect(getComputedStyle(wrapper.get("button").element).marginLeft).toBe("0px");
  });
});

describe("Badge subtle", () => {
  it("draws the border soft does not have", () => {
    const badge = mount({ render: () => h(Badge, { variant: "subtle" }, () => "New") }, { attachTo: document.body })
      .element as HTMLElement;

    expect(getComputedStyle(badge).borderTopWidth).toBe("1px");
  });
});
