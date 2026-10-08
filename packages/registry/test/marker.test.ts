import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { h } from "vue";

import { Marker, MarkerContent, MarkerIcon } from "@/ui/marker";

const render = (props: Record<string, unknown> = {}) =>
  mount(
    {
      render: () =>
        h("div", { style: "width:320px" }, [
          h(Marker, props, () => [
            h(MarkerIcon, () => h("svg", { viewBox: "0 0 24 24" })),
            h(MarkerContent, () => "Explored 4 files"),
          ]),
        ]),
    },
    { attachTo: document.body },
  ).get("[data-slot=marker]").element as HTMLElement;

const probe = (className: string, color?: string) => {
  const element = document.createElement("span");
  element.dataset.slot = "probe";
  if (color) element.dataset.color = color;
  element.className = className;
  document.body.append(element);
  return getComputedStyle(element);
};

describe("Marker", () => {
  it("is a muted row with a hidden 16px icon", () => {
    const marker = render();
    const icon = marker.querySelector<HTMLElement>("[data-slot=marker-icon]")!;

    expect(marker.dataset.variant).toBe("default");
    expect(marker.hasAttribute("data-color")).toBe(false);
    expect(getComputedStyle(marker).color).toBe(probe("text-muted-foreground").color);
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon.querySelector("svg")!.getBoundingClientRect().width).toBe(16);
  });

  it("draws a line under the border variant", () => {
    const style = getComputedStyle(render({ variant: "border" }));
    expect(style.borderBottomWidth).toBe("1px");
    expect(style.borderBottomColor).toBe(probe("bg-border").backgroundColor);
  });

  it("puts a line on each side of the separator's label", () => {
    const marker = render({ variant: "separator" });
    for (const pseudo of ["::before", "::after"]) {
      const line = getComputedStyle(marker, pseudo);
      expect(line.height).toBe("1px");
      expect(line.flexGrow).toBe("1");
      expect(line.backgroundColor).toBe(probe("bg-border").backgroundColor);
    }
    expect(getComputedStyle(marker.querySelector("[data-slot=marker-content]")!).textAlign).toBe("center");
  });

  it("takes the text and the lines from a colour", () => {
    const marker = render({ variant: "separator", color: "destructive" });
    expect(marker.dataset.color).toBe("destructive");
    expect(getComputedStyle(marker).color).toBe(probe("text-tone-text", "destructive").color);
    expect(getComputedStyle(marker, "::before").backgroundColor).toBe(
      probe("bg-tone-border-subtle", "destructive").backgroundColor,
    );
  });

  it("renders a link as the root and underlines it", () => {
    const wrapper = mount(Marker, {
      props: { asChild: true },
      slots: {
        default: () =>
          h(
            "a",
            { href: "#pull" },
            h(MarkerContent, () => "View the pull request"),
          ),
      },
      attachTo: document.body,
    });
    const link = wrapper.element as HTMLElement;
    expect(link.tagName).toBe("A");
    expect(link.dataset.slot).toBe("marker");
    expect(getComputedStyle(link).textDecorationLine).toBe("underline");
  });
});
