import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { h } from "vue";

import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, type ItemVariants, ItemTitle } from "@/ui/item";

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

const shiftY = (translate: string) => (translate === "none" ? 0 : parseFloat(translate.split(" ")[1] ?? "0"));

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
    ["xl", 40, 48],
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

    const style = getComputedStyle(item.querySelector("[data-slot=item-media]")!);
    expect(style.alignSelf).toBe("flex-start");
    expect(shiftY(style.translate)).toBe(2);
  });

  it("lets a class on the media centre it beside a description", () => {
    const item = render({}, () => [
      h(ItemMedia, { variant: "icon", class: "self-center translate-y-0" }),
      h(ItemContent, () => [h(ItemTitle, () => "Title"), h(ItemDescription, () => "Description")]),
    ]);

    const style = getComputedStyle(item.querySelector("[data-slot=item-media]")!);
    expect(style.alignSelf).toBe("center");
    expect(shiftY(style.translate)).toBe(0);
  });

  it("leaves media to the item's own alignment without a description", () => {
    const item = render({ class: "items-start" }, () => [
      h(ItemMedia, { variant: "icon" }),
      h(ItemContent, () => h(ItemTitle, () => "Title")),
    ]);

    const style = getComputedStyle(item.querySelector("[data-slot=item-media]")!);
    expect(style.alignSelf).toBe("auto");
    expect(shiftY(style.translate)).toBe(0);
  });

  it("gives a link item a state layer", () => {
    const item = render({ as: "a", href: "#" });

    expect(item.tagName).toBe("A");
    expect(getComputedStyle(item, "::before").content).toBe('""');
  });
});

describe("Item state layer", () => {
  it.each([
    ["a disabled button", { as: "button", disabled: true }],
    ["a data-disabled link", { as: "a", href: "#", "data-disabled": "" }],
  ])("stays flat under the mouse on %s", async (_, props) => {
    const item = render(props);
    await userEvent.hover(item, { force: true });
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(getComputedStyle(item, "::before").opacity).toBe("0");
    await userEvent.unhover(document.body);
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

describe("Item parts", () => {
  type Size = NonNullable<ItemVariants["size"]>;

  const fontSizeOf = (className: string) => {
    const probe = document.createElement("p");
    probe.className = className;
    document.body.append(probe);
    const size = getComputedStyle(probe).fontSize;
    probe.remove();
    return size;
  };

  const row = (size: Size, title?: string, description?: string) =>
    mount(
      {
        render: () =>
          h(Item, { size }, () =>
            h(ItemContent, () => [
              h(ItemTitle, { class: title }, () => "Title"),
              h(ItemDescription, { class: description }, () => "Text"),
            ]),
          ),
      },
      { attachTo: document.body },
    );

  const fontSize = (wrapper: ReturnType<typeof row>, slot: string) =>
    getComputedStyle(wrapper.get(`[data-slot=${slot}]`).element).fontSize;

  it("keeps the title and description text at every size", () => {
    for (const size of ["xs", "sm", "md", "lg", "xl"] as const) {
      const wrapper = row(size);
      expect(fontSize(wrapper, "item-title"), size).toBe(fontSizeOf("text-label-lg"));
      expect(fontSize(wrapper, "item-description"), size).toBe(fontSizeOf("text-body-md"));
    }
  });

  it("lets a plain class win over the text and the description's clamp", () => {
    const wrapper = row("sm", "text-title-md", "text-body-sm line-clamp-none");
    expect(fontSize(wrapper, "item-title")).toBe(fontSizeOf("text-title-md"));
    expect(fontSize(wrapper, "item-description")).toBe(fontSizeOf("text-body-sm"));

    const description = wrapper.get("[data-slot=item-description]").element;
    expect(description.className).toContain("line-clamp-none");
    expect(description.className).not.toContain("line-clamp-2");
  });

  it("sizes the icon inside media from --item-media and lets a class win over the box", () => {
    const media = (size: Size, variant: "icon" | "image", className?: string) =>
      mount(
        { render: () => h(Item, { size }, () => h(ItemMedia, { variant, class: className }, () => h("svg"))) },
        {
          attachTo: document.body,
        },
      ).get("[data-slot=item-media]").element;
    const width = (element: Element) => element.getBoundingClientRect().width;

    expect(width(media("md", "icon").querySelector("svg")!)).toBe(16);
    expect(width(media("xs", "icon").querySelector("svg")!)).toBe(12);
    expect(width(media("xl", "icon", "size-12"))).toBe(48);
    expect(width(media("xl", "image", "size-14"))).toBe(56);
  });
});

describe("Item long text", () => {
  const LONG = "A title long enough to run past a narrow row several times over, and then some more";

  const narrow = (title: () => unknown) =>
    mount(
      {
        render: () =>
          h("div", { style: "width: 240px" }, [
            h(Item, { variant: "outline" }, () => [
              h(ItemMedia, { variant: "icon" }, () => h("svg")),
              h(ItemContent, () => [title(), h(ItemDescription, () => LONG)]),
              h("div", { "data-slot": "item-actions" }, "Go"),
            ]),
          ]),
      },
      { attachTo: document.body },
    );

  const edges = (wrapper: ReturnType<typeof narrow>) => {
    const box = (slot: string) => wrapper.get(`[data-slot=${slot}]`).element.getBoundingClientRect();
    return { item: box("item"), media: box("item-media"), content: box("item-content"), title: box("item-title") };
  };

  it("keeps the content beside the media and inside the row", () => {
    const { item, media, content, title } = edges(narrow(() => h(ItemTitle, { class: "line-clamp-1" }, () => LONG)));

    expect(Math.abs(content.top - media.top)).toBeLessThan(8);
    expect(content.right).toBeLessThanOrEqual(item.right);
    expect(title.right).toBeLessThanOrEqual(content.right);
  });

  it("lets a truncate span inside the title shrink to the column", () => {
    const wrapper = narrow(() => h(ItemTitle, () => h("span", { class: "truncate" }, LONG)));
    const { content, title } = edges(wrapper);
    const span = wrapper.get("[data-slot=item-title] span").element;

    expect(title.right).toBeLessThanOrEqual(content.right);
    expect(span.scrollWidth).toBeGreaterThan(span.clientWidth);
  });
});
