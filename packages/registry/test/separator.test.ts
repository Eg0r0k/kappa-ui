import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { h } from "vue";

import { Separator } from "@/ui/separator";

const render = (props: Record<string, unknown> = {}, slot?: string) =>
  mount(
    {
      render: () =>
        h(
          "div",
          { style: "display:flex;flex-direction:column;width:200px;height:100px" },
          h(Separator, props, slot ? () => slot : undefined),
        ),
    },
    { attachTo: document.body },
  ).get("[data-slot=separator]").element as HTMLElement;

describe("Separator", () => {
  it("is a decorative 1px line across its parent by default", () => {
    const separator = render();
    const box = separator.getBoundingClientRect();

    expect(separator.getAttribute("role")).toBe("none");
    expect(separator.dataset.orientation).toBe("horizontal");
    expect([box.width, box.height]).toEqual([200, 1]);
  });

  it("is announced when not decorative, with its orientation when vertical", () => {
    const separator = render({ decorative: false, orientation: "vertical" });

    expect(separator.getAttribute("role")).toBe("separator");
    expect(separator.getAttribute("aria-orientation")).toBe("vertical");
  });

  it.each([
    ["xs", 1],
    ["sm", 2],
    ["md", 3],
    ["lg", 4],
    ["xl", 5],
  ] as const)("at size %s is %ipx thick", (size, thickness) => {
    expect(render({ size }).getBoundingClientRect().height).toBe(thickness);
  });

  it("takes its length from a class in either orientation", () => {
    mount(
      {
        render: () => [
          h(
            "div",
            { style: "display:flex;height:80px;align-items:flex-start" },
            h(Separator, { orientation: "vertical", class: "h-4", id: "vertical" }),
          ),
          h(
            "div",
            { style: "display:flex;flex-direction:column;width:200px" },
            h(Separator, { class: "w-12", id: "horizontal" }),
          ),
        ],
      },
      { attachTo: document.body },
    );

    expect(document.getElementById("vertical")!.getBoundingClientRect().height).toBe(16);
    expect(document.getElementById("horizontal")!.getBoundingClientRect().width).toBe(48);
  });

  it("puts a label between two lines, from the prop or the slot", () => {
    const separator = render({ label: "or", size: "md" });
    const lines = separator.querySelectorAll<HTMLElement>("[data-slot=separator-line]");

    expect(separator.querySelector("[data-slot=separator-label]")?.textContent).toBe("or");
    expect(lines).toHaveLength(2);
    expect(lines[0]!.getBoundingClientRect().height).toBe(3);
    expect(lines[0]!.getBoundingClientRect().width).toBeGreaterThan(50);

    document.body.innerHTML = "";
    expect(render({}, "and").querySelector("[data-slot=separator-label]")?.textContent).toBe("and");
  });

  it("stacks the label between vertical lines", () => {
    const separator = render({ label: "or", orientation: "vertical" });
    const [first] = separator.querySelectorAll<HTMLElement>("[data-slot=separator-line]");

    expect(first!.getBoundingClientRect().width).toBe(1);
    expect(first!.getBoundingClientRect().height).toBeGreaterThan(20);
  });
});
