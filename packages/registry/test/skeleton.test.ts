import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { h } from "vue";

import { Skeleton } from "@/ui/skeleton";

afterEach(() => {
  document.body.innerHTML = "";
});

const render = (props: Record<string, unknown> = {}, parent = "") =>
  mount(
    { render: () => h("div", { style: `width:200px;${parent}` }, h(Skeleton, props)) },
    { attachTo: document.body },
  ).get("[data-slot=skeleton]").element as HTMLElement;

describe("Skeleton", () => {
  it("is a hidden, pulsing, rounded block by default", () => {
    const skeleton = render({ class: "h-4" });
    const style = getComputedStyle(skeleton);

    expect(skeleton.getAttribute("aria-hidden")).toBe("true");
    expect(skeleton.dataset.variant).toBe("rect");
    expect(skeleton.dataset.animation).toBe("pulse");
    expect(style.animationName).toBe("pulse");
    expect(style.borderRadius).not.toBe("0px");
    expect(skeleton.getBoundingClientRect().height).toBe(16);
  });

  it("sweeps a wave across, and stands still with none", () => {
    const wave = render({ animation: "wave", class: "h-4" });
    expect(getComputedStyle(wave, "::after").animationName).toBe("delta-skeleton-wave");
    expect(getComputedStyle(wave).overflow).toBe("hidden");

    document.body.innerHTML = "";
    expect(getComputedStyle(render({ animation: "none", class: "h-4" })).animationName).toBe("none");
  });

  it("takes the height of the font as text and centres itself in the line", () => {
    const skeleton = render({ variant: "text" }, "font-size:20px;line-height:30px");
    const style = getComputedStyle(skeleton);

    expect(skeleton.getBoundingClientRect().height).toBe(20);
    expect([style.marginTop, style.marginBottom]).toEqual(["5px", "5px"]);
  });

  it("is a circle as tall as it is wide", () => {
    const skeleton = render({ variant: "circle", class: "w-10" });
    const box = skeleton.getBoundingClientRect();

    expect([box.width, box.height]).toEqual([40, 40]);
    expect(getComputedStyle(skeleton).borderRadius).toMatch(/px$/);
  });
});
