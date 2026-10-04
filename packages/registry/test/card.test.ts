import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { h } from "vue";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";

afterEach(() => {
  document.body.innerHTML = "";
});

const render = (props: Record<string, unknown> = {}, contentClass?: string) => {
  mount(
    {
      render: () =>
        h(Card, props, () => [
          h(CardHeader, () => [h(CardTitle, () => "Title"), h(CardDescription, () => "Description")]),
          h(CardContent, { class: contentClass }, () => "Content"),
          h(CardFooter, () => "Footer"),
        ]),
    },
    { attachTo: document.body },
  );
  return document.querySelector<HTMLElement>("[data-slot=card]")!;
};

const part = (name: string) => document.querySelector<HTMLElement>(`[data-slot=card-${name}]`)!;

describe("Card sizes", () => {
  it.each([
    ["xs", 12],
    ["sm", 16],
    ["md", 24],
    ["lg", 32],
    ["xl", 40],
  ] as const)("%s spaces by %dpx", (size, px) => {
    const card = render({ size });
    expect(card.dataset.size).toBe(size);
    expect(getComputedStyle(card).paddingTop).toBe(`${px}px`);
    expect(getComputedStyle(card).rowGap).toBe(`${px}px`);
    expect(getComputedStyle(part("header")).paddingLeft).toBe(`${px}px`);
    expect(getComputedStyle(part("content")).paddingLeft).toBe(`${px}px`);
    expect(getComputedStyle(part("footer")).paddingLeft).toBe(`${px}px`);
  });

  it("defaults to md and outline", () => {
    const card = render();
    expect(card.dataset.size).toBe("md");
    expect(card.dataset.variant).toBe("outline");
    expect(getComputedStyle(card).paddingTop).toBe("24px");
  });

  it("steps the title and description through the typescale", () => {
    render({ size: "xs" });
    expect(getComputedStyle(part("title")).fontSize).toBe("14px");
    expect(getComputedStyle(part("description")).fontSize).toBe("12px");
    document.body.innerHTML = "";
    render({ size: "xl" });
    expect(getComputedStyle(part("title")).fontSize).toBe("24px");
    expect(getComputedStyle(part("description")).fontSize).toBe("16px");
  });
});

describe("Card variants", () => {
  it("draws the edge as a ring for outline and subtle only, a shadow for solid only, and no border anywhere", () => {
    document.documentElement.style.setProperty("--surface-border", "var(--border)");
    const probe = document.createElement("div");
    probe.style.cssText = "border: 1px solid var(--border)";
    document.body.append(probe);
    const edge = `${getComputedStyle(probe).borderTopColor} 0px 0px 0px 1px`;
    const styles = Object.fromEntries(
      (["outline", "solid", "soft", "subtle"] as const).map((variant) => {
        const card = render({ variant });
        const style = getComputedStyle(card);
        const ring = style.boxShadow.includes(edge);
        const result = [card.dataset.variant, style.borderTopWidth, ring, !ring && style.boxShadow !== "none"] as const;
        document.body.innerHTML = "";
        return [variant, result];
      }),
    );
    expect(styles).toEqual({
      outline: ["outline", "0px", true, false],
      solid: ["solid", "0px", false, true],
      soft: ["soft", "0px", false, false],
      subtle: ["subtle", "0px", true, false],
    });
    document.documentElement.style.removeProperty("--surface-border");
  });

  it("tints soft and subtle with --muted", () => {
    const muted = getComputedStyle(render({ variant: "soft" })).backgroundColor;
    document.body.innerHTML = "";
    const card = getComputedStyle(render({ variant: "outline" })).backgroundColor;
    expect(muted).not.toBe(card);
  });
});

describe("Card parts", () => {
  it("drops a part's side padding with px-0", () => {
    render({}, "px-0");
    expect(getComputedStyle(part("content")).paddingLeft).toBe("0px");
    expect(getComputedStyle(part("header")).paddingLeft).toBe("24px");
  });
});
