import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { h } from "vue";

import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { ButtonGroup } from "@/ui/button-group";

import { overrideControlTokens, px, sentinel } from "./control-tokens";

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

describe("Button aria-disabled", () => {
  it("swallows clicks and keyboard activation, keeping focus and pointer events", async () => {
    const onClick = vi.fn();
    const el = render({ "aria-disabled": "true", onClick }) as HTMLButtonElement;
    await userEvent.click(el, { force: true });
    el.focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onClick).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(el);
    expect(getComputedStyle(el).pointerEvents).toBe("auto");
  });

  it.each(["solid", "soft", "subtle", "outline", "ghost"] as const)(
    "draws %s like disabled, with no hover layer",
    async (variant) => {
      mount(
        {
          render: () => [
            h(Button, { variant, disabled: true }, () => "A"),
            h(Button, { variant, "aria-disabled": "true" }, () => "B"),
          ],
        },
        { attachTo: document.body },
      );
      const [native, aria] = [...document.querySelectorAll<HTMLElement>("[data-slot=button]")];
      const look = (el: HTMLElement) => {
        const style = getComputedStyle(el);
        return [style.backgroundColor, style.color, style.boxShadow];
      };
      expect(look(aria!)).toEqual(look(native!));
      await userEvent.hover(aria!);
      expect(getComputedStyle(aria!, "::before").opacity).toBe("0");
    },
  );
});

describe("Button control tokens", () => {
  overrideControlTokens();

  const textSizes = [
    ["xs", "xs"],
    ["sm", "sm"],
    ["default", "md"],
    ["lg", "lg"],
    ["xl", "xl"],
  ] as const;

  const withIcon = (size: (typeof textSizes)[number][0]) =>
    mount(
      { render: () => h(Button, { size }, () => [h("svg", { viewBox: "0 0 24 24" }), "Save"]) },
      { attachTo: document.body },
    ).get("[data-slot=button]").element as HTMLElement;

  it.each(textSizes)("%s reads the %s height, gap and touch height", (size, token) => {
    const style = getComputedStyle(withIcon(size));
    expect(px(style.height)).toBe(sentinel.height[token]);
    expect(px(style.columnGap)).toBe(sentinel.gap[token]);
    expect(px(style.getPropertyValue("--touch-h"))).toBe(sentinel.height[token]);
  });

  it.each(textSizes.slice(0, 3))("%s reads the %s icon", (size, token) => {
    expect(withIcon(size).querySelector("svg")!.getBoundingClientRect().width).toBe(sentinel.icon[token]);
  });

  it.each(textSizes.slice(3))("%s keeps 16px icons", (size) => {
    expect(withIcon(size).querySelector("svg")!.getBoundingClientRect().width).toBe(16);
  });

  it.each([
    ["icon-xs", "xs"],
    ["icon-sm", "sm"],
    ["icon", "md"],
    ["icon-lg", "lg"],
    ["icon-xl", "xl"],
  ] as const)("%s is a square of the %s height", (size, token) => {
    const button = render({ size });
    const box = button.getBoundingClientRect();
    expect([box.width, box.height]).toEqual([sentinel.height[token], sentinel.height[token]]);
    expect(px(getComputedStyle(button).getPropertyValue("--touch-w"))).toBe(sentinel.height[token]);
  });
});
