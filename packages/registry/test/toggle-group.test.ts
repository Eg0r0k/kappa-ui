import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";
import { h, nextTick } from "vue";

import { ToggleGroup, ToggleGroupItem } from "@/ui/toggle-group";

const render = (props: Record<string, unknown>, items: Record<string, unknown>[] = [{}, {}, {}]) => {
  mount(
    {
      render: () =>
        h(ToggleGroup, props, () =>
          items.map((item, index) => h(ToggleGroupItem, { value: `v${index}`, ...item }, () => `Item ${index}`)),
        ),
    },
    { attachTo: document.body },
  );
  return {
    root: document.querySelector<HTMLElement>("[data-slot=toggle-group]")!,
    items: [...document.querySelectorAll<HTMLElement>("[data-slot=toggle-group-item]")],
  };
};

it("keeps one item on in single mode", async () => {
  const { items } = render({ type: "single" });
  items[0]!.click();
  await nextTick();
  items[1]!.click();
  await nextTick();
  expect(items.map((item) => item.dataset.state)).toEqual(["off", "on", "off"]);
});

it("keeps several items on in multiple mode", async () => {
  const { items } = render({ type: "multiple" });
  items[0]!.click();
  await nextTick();
  items[2]!.click();
  await nextTick();
  expect(items.map((item) => item.dataset.state)).toEqual(["on", "off", "on"]);
});

it("passes its style to the items, which can override it", () => {
  const { items } = render(
    { type: "single", variant: "outline", color: "primary", size: "sm", activeColor: "success" },
    [{}, { variant: "solid" }],
  );
  expect(
    items.map((item) => [item.dataset.variant, item.dataset.color, item.dataset.activeColor, item.dataset.size]),
  ).toEqual([
    ["outline", "primary", "success", "sm"],
    ["solid", "primary", "success", "sm"],
  ]);
});

it("joins the items like a button group", () => {
  const { root, items } = render({ type: "single", variant: "outline" });
  expect(root.dataset.orientation).toBe("horizontal");
  const [first, middle, last] = items.map((item) => getComputedStyle(item));
  expect(first!.borderTopRightRadius).toBe("0px");
  expect([middle!.borderTopLeftRadius, middle!.borderTopRightRadius]).toEqual(["0px", "0px"]);
  expect(last!.borderTopLeftRadius).toBe("0px");
  expect(middle!.marginLeft).toBe("-1px");
});

it("stacks vertically", () => {
  const { root, items } = render({ type: "single", orientation: "vertical", variant: "outline" });
  expect(getComputedStyle(root).flexDirection).toBe("column");
  expect(getComputedStyle(items[0]!).borderBottomLeftRadius).toBe("0px");
});
