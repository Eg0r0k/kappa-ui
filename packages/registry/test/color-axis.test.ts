import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { h } from "vue";

import { Button } from "@/ui/button";

const cleanups: (() => void)[] = [];
afterEach(() => cleanups.splice(0).forEach((cleanup) => cleanup()));

const render = (props: Record<string, unknown>, attrs: Record<string, string> = {}) => {
  const wrapper = mount(Button, { props, attrs, slots: { default: () => "Label" }, attachTo: document.body });
  cleanups.push(() => wrapper.unmount());
  return wrapper.element as HTMLElement;
};

const style = (css: string) => {
  const element = document.createElement("style");
  element.textContent = css;
  document.head.append(element);
  cleanups.push(() => element.remove());
};

describe("colour axis", () => {
  it("marks the root with the colour, primary by default", () => {
    expect(render({}).dataset.color).toBe("primary");
    expect(render({ color: "success" }).dataset.color).toBe("success");
  });

  it("draws a colour the user declares on [data-slot][data-color]", () => {
    style('[data-slot][data-color="brand"] { --tone: rgb(1, 2, 3); --tone-foreground: rgb(4, 5, 6); }');
    const button = getComputedStyle(render({ color: "brand" }));
    expect(button.backgroundColor).toBe("rgb(1, 2, 3)");
    expect(button.color).toBe("rgb(4, 5, 6)");
  });

  it("lets a class override the tone variables", () => {
    const button = getComputedStyle(render({ class: "[--tone:rgb(255,0,0)] [--tone-foreground:rgb(0,0,255)]" }));
    expect(button.backgroundColor).toBe("rgb(255, 0, 0)");
    expect(button.color).toBe("rgb(0, 0, 255)");
  });

  it("derives the soft text and the edge from --tone-text", () => {
    style(
      '[data-slot][data-color="brand"] { --tone: rgb(1, 2, 3); --tone-foreground: rgb(4, 5, 6); --tone-text: rgb(7, 8, 9); }',
    );
    const outline = getComputedStyle(render({ variant: "outline", color: "brand" }));
    expect(outline.color).toBe("rgb(7, 8, 9)");
    expect(outline.boxShadow).toContain("rgb(7, 8, 9)");
    expect(getComputedStyle(render({ variant: "soft", color: "brand" })).color).toBe("rgb(7, 8, 9)");
    expect(getComputedStyle(render({ variant: "ghost", color: "brand" })).color).toBe("rgb(7, 8, 9)");
  });

  it("follows a theme overridden on a subtree", () => {
    const wrapper = mount(
      {
        render: () =>
          h("div", { style: "--primary: rgb(255, 0, 0); --success: rgb(0, 128, 0)" }, [
            h(Button, () => "A"),
            h(Button, { color: "success" }, () => "B"),
          ]),
      },
      { attachTo: document.body },
    );
    cleanups.push(() => wrapper.unmount());
    const colours = wrapper.findAll("button").map((button) => getComputedStyle(button.element).backgroundColor);
    expect(colours).toEqual(["rgb(255, 0, 0)", "rgb(0, 128, 0)"]);
  });

  it("draws info from the info tokens", () => {
    const vars = { style: "--info: rgb(0, 0, 255); --info-foreground: rgb(1, 1, 1); --info-text: rgb(0, 0, 128)" };
    const solid = getComputedStyle(render({ color: "info" }, vars));
    expect([solid.backgroundColor, solid.color]).toEqual(["rgb(0, 0, 255)", "rgb(1, 1, 1)"]);
    expect(getComputedStyle(render({ variant: "soft", color: "info" }, vars)).color).toBe("rgb(0, 0, 128)");
  });

  it("keeps neutral's full-strength edge and foreground text", () => {
    const vars = {
      style: "--input: rgb(0, 128, 0); --foreground: rgb(10, 10, 10); --secondary-foreground: rgb(90, 90, 90)",
    };
    expect(getComputedStyle(render({ variant: "subtle", color: "neutral" }, vars)).boxShadow).toContain(
      "rgb(0, 128, 0)",
    );
    expect(getComputedStyle(render({ variant: "outline", color: "neutral" }, vars)).color).toBe("rgb(10, 10, 10)");
    expect(getComputedStyle(render({ variant: "soft", color: "neutral" }, vars)).color).toBe("rgb(90, 90, 90)");
  });
});
