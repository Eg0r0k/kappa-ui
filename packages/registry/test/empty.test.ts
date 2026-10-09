import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";
import { type VNode, h } from "vue";

import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/ui/empty";

const icon = (props: Record<string, unknown> = {}) => h("svg", { viewBox: "0 0 24 24", ...props });

const render = (
  root: Record<string, unknown> = {},
  title: Record<string, unknown> = {},
  media: () => VNode = () => icon(),
) =>
  mount(
    {
      render: () =>
        h("div", { style: "width:600px" }, [
          h(Empty, root, () => [
            h(EmptyHeader, () => [
              h(EmptyMedia, media),
              h(EmptyTitle, title, () => "Nothing here"),
              h(EmptyDescription, () => "Add something to see it listed."),
            ]),
            h(EmptyContent, () => h("button", "Add")),
          ]),
        ]),
    },
    { attachTo: document.body },
  );

const q = (selector: string) => document.querySelector<HTMLElement>(selector)!;
const probeFont = (className: string) => {
  const probe = document.createElement("p");
  probe.className = className;
  document.body.append(probe);
  const size = getComputedStyle(probe).fontSize;
  probe.remove();
  return size;
};

it("renders the six parts with their data-slots and the size on the root", () => {
  render();
  for (const slot of ["empty", "empty-header", "empty-media", "empty-title", "empty-description", "empty-content"]) {
    expect(q(`[data-slot=${slot}]`)).not.toBeNull();
  }
  expect(q("[data-slot=empty]").dataset.size).toBe("md");
  expect(q("[data-slot=empty-description]").tagName).toBe("P");
});

it("titles with an h3 unless told otherwise", () => {
  render();
  expect(q("[data-slot=empty-title]").tagName).toBe("H3");
  document.body.innerHTML = "";
  render({}, { as: "h2" });
  expect(q("[data-slot=empty-title]").tagName).toBe("H2");
});

it.each([
  ["xs", 24],
  ["sm", 32],
  ["md", 40],
  ["lg", 48],
  ["xl", 56],
] as const)("sizes a bare icon at %s and keeps the text", (size, px) => {
  render({ size });
  expect(q("[data-slot=empty]").dataset.size).toBe(size);
  expect(q("[data-slot=empty-media] > svg").getBoundingClientRect().width).toBe(px);
  expect(getComputedStyle(q("[data-slot=empty-title]")).fontSize).toBe(probeFont("text-title-md"));
  expect(getComputedStyle(q("[data-slot=empty-description]")).fontSize).toBe(probeFont("text-body-md"));
});

it("leaves an icon with its own size alone", () => {
  render({}, {}, () => icon({ class: "size-4" }));
  expect(q("[data-slot=empty-media] > svg").getBoundingClientRect().width).toBe(16);
});

it("keeps the header and the content within a readable width", () => {
  render();
  expect(q("[data-slot=empty]").getBoundingClientRect().width).toBe(600);
  expect(q("[data-slot=empty-header]").getBoundingClientRect().width).toBeLessThanOrEqual(384);
  expect(q("[data-slot=empty-content]").getBoundingClientRect().width).toBe(384);
});
