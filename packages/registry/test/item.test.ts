import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { h } from "vue";

import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/ui/item";

afterEach(() => {
  document.body.innerHTML = "";
});

const render = (
  props: Record<string, unknown> = {},
  children: () => unknown = () => h(ItemContent, () => h(ItemTitle, () => "Title")),
) =>
  mount({ render: () => h(Item, props, children) }, { attachTo: document.body }).get("[data-slot=item]")
    .element as HTMLElement;

const within = (group: Record<string, unknown>, items: Record<string, unknown>[]) =>
  mount(
    {
      render: () => h(ItemGroup, group, () => items.map((props) => h(Item, props, () => h(ItemContent, () => "Row")))),
    },
    { attachTo: document.body },
  ).get("[data-slot=item-group]").element as HTMLElement;

const borderColor = () => {
  const probe = document.createElement("div");
  probe.style.cssText = "border: 1px solid var(--border)";
  document.body.append(probe);
  return getComputedStyle(probe).borderTopColor;
};

describe("Item", () => {
  it("is a ghost md item by default", () => {
    const item = render();
    const style = getComputedStyle(item);

    expect(item.dataset).toMatchObject({ variant: "ghost", size: "md" });
    expect(style.paddingTop).toBe("16px");
    expect(style.borderTopWidth).toBe("1px");
    expect(style.borderTopColor).toBe("rgba(0, 0, 0, 0)");
  });

  it("draws an outline in the border colour", () => {
    expect(getComputedStyle(render({ variant: "outline" })).borderTopColor).toBe(borderColor());
  });

  it("draws filled with a bottom border and square bottom corners", () => {
    const style = getComputedStyle(render({ variant: "filled" }));

    expect(style.borderTopColor).toBe("rgba(0, 0, 0, 0)");
    expect(style.borderBottomColor).toBe(borderColor());
    expect(style.borderBottomLeftRadius).toBe("0px");
    expect(style.borderTopLeftRadius).not.toBe("0px");
  });

  it.each([
    ["xs", "8px", "12px"],
    ["sm", "12px", "16px"],
    ["md", "16px", "16px"],
    ["lg", "20px", "20px"],
    ["xl", "24px", "24px"],
  ])("pads %s by %s and %s", (size, block, inline) => {
    const style = getComputedStyle(render({ size }));
    expect([style.paddingTop, style.paddingInlineStart]).toEqual([block, inline]);
  });

  it.each([
    ["xs", 24, 32],
    ["md", 32, 40],
    ["xl", 40, 56],
  ])("sizes media to the %s item: icon %ipx, image %ipx", (size, icon, image) => {
    const item = render({ size }, () => [
      h(ItemMedia, { variant: "icon", "data-test": "icon" }),
      h(ItemMedia, { variant: "image", "data-test": "image" }),
      h(ItemContent, () => h(ItemTitle, () => "Title")),
    ]);

    expect(item.querySelector("[data-test=icon]")!.getBoundingClientRect().width).toBe(icon);
    expect(item.querySelector("[data-test=image]")!.getBoundingClientRect().width).toBe(image);
  });

  it("aligns media to the top when the item has a description", () => {
    const item = render({}, () => [
      h(ItemMedia, { variant: "icon" }),
      h(ItemContent, () => [h(ItemTitle, () => "Title"), h(ItemDescription, () => "Description")]),
    ]);

    expect(getComputedStyle(item.querySelector("[data-slot=item-media]")!).alignSelf).toBe("flex-start");
  });

  it("gives a link item a state layer", () => {
    const item = render({ as: "a", href: "#" });

    expect(item.tagName).toBe("A");
    expect(getComputedStyle(item, "::before").content).toBe('""');
  });
});

describe("ItemGroup", () => {
  it("is a list of list items", () => {
    const group = within({}, [{}, {}]);

    expect(group.getAttribute("role")).toBe("list");
    expect([...group.children].map((child) => child.getAttribute("role"))).toEqual(["listitem", "listitem"]);
  });

  it("leaves link and button items their own role", () => {
    const group = within({}, [{ as: "a", href: "#" }, { as: "button" }]);

    expect([...group.children].map((child) => child.getAttribute("role"))).toEqual([null, null]);
  });

  it("gives items no role in a group that is not a list", () => {
    const group = within({ role: "group" }, [{}]);

    expect(group.getAttribute("role")).toBe("group");
    expect(group.children[0]!.getAttribute("role")).toBeNull();
  });
});
