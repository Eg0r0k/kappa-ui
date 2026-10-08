import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { h } from "vue";

const render = (className: string, dir?: "rtl") =>
  mount(
    { render: () => h("div", { dir }, h("p", { class: className }, "Generating response")) },
    {
      attachTo: document.body,
    },
  ).get("p").element as HTMLElement;

describe("shimmer", () => {
  it("paints the text through a sweeping gradient", () => {
    const style = getComputedStyle(render("shimmer text-muted-foreground"));

    expect(style.backgroundClip).toBe("text");
    expect(style.getPropertyValue("-webkit-text-fill-color")).toBe("rgba(0, 0, 0, 0)");
    expect(style.backgroundImage).toMatch(/^linear-gradient/);
    expect(style.animationName).toBe("kappa-shimmer");
    expect(style.animationDuration).toBe("2s");
    expect(style.animationIterationCount).toBe("infinite");
  });

  it("plays once, reverses, and runs the other way in right-to-left text", () => {
    expect(getComputedStyle(render("shimmer shimmer-once")).animationIterationCount).toBe("1");
    expect(getComputedStyle(render("shimmer shimmer-reverse")).animationDirection).toBe("reverse");
    expect(getComputedStyle(render("shimmer", "rtl")).animationDirection).toBe("reverse");
    expect(getComputedStyle(render("shimmer")).animationDirection).toBe("normal");
  });

  it("turns off with shimmer-none in either class order", () => {
    for (const className of ["shimmer shimmer-none", "shimmer-none shimmer"]) {
      const style = getComputedStyle(render(className));
      expect(style.backgroundImage).toBe("none");
      expect(style.getPropertyValue("-webkit-text-fill-color")).toBe(style.color);
    }
  });

  it("takes a duration, an angle and a colour", () => {
    expect(getComputedStyle(render("shimmer shimmer-duration-1000")).animationDuration).toBe("1s");
    expect(getComputedStyle(render("shimmer shimmer-angle-45")).getPropertyValue("--shimmer-angle")).toBe("45deg");
    expect(getComputedStyle(render("shimmer shimmer-color-[#ff0000]")).getPropertyValue("--shimmer-color")).toBe(
      "#ff0000",
    );
  });
});
