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

  it("draws subtle with the border soft does not have", () => {
    expect(getComputedStyle(render({ variant: "subtle" })).borderTopWidth).toBe("1px");
    expect(getComputedStyle(render({ variant: "soft" })).borderTopWidth).toBe("0px");
  });

  it("collapses the border between subtle buttons in a group", () => {
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

    expect(getComputedStyle(group.children[1]!).borderInlineStartWidth).toBe("0px");
  });

  it("reserves a 48px touch area around xs with the wrapper touch target", () => {
    const style = getComputedStyle(render({ size: "xs", touchTarget: "wrapper" }));
    expect([style.marginTop, style.marginBottom]).toEqual(["10px", "10px"]);
  });
});

describe("Badge subtle", () => {
  it("draws the border soft does not have", () => {
    const badge = mount({ render: () => h(Badge, { variant: "subtle" }, () => "New") }, { attachTo: document.body })
      .element as HTMLElement;

    expect(getComputedStyle(badge).borderTopWidth).toBe("1px");
  });
});
