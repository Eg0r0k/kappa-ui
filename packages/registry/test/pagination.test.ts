import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { defineComponent, h, nextTick, ref } from "vue";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/ui/pagination";

import { controlSizes, overrideControlTokens, px, sentinel } from "./control-tokens";

type Item = { type: "page"; value: number } | { type: "ellipsis" };

afterEach(() => {
  document.body.innerHTML = "";
});

const render = (
  props: Record<string, unknown> = {},
  link: (item: { type: "page"; value: number }) => unknown = (item) => h(PaginationLink, { value: item.value }),
) => {
  const page = ref((props.page as number | undefined) ?? 1);
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          Pagination,
          {
            total: 100,
            itemsPerPage: 10,
            ...props,
            page: page.value,
            "onUpdate:page": (value: number) => {
              page.value = value;
            },
          },
          () =>
            h(PaginationContent, null, {
              default: ({ items }: { items: Item[] }) => [
                h(PaginationItem, () => h(PaginationPrevious)),
                ...items.map((item, index) =>
                  h(PaginationItem, { key: index }, () => (item.type === "page" ? link(item) : h(PaginationEllipsis))),
                ),
                h(PaginationItem, () => h(PaginationNext)),
              ],
            }),
        ),
    }),
    { attachTo: document.body },
  );
  return { wrapper, page };
};

const link = (value: number) =>
  [...document.querySelectorAll<HTMLElement>("[data-slot=pagination-link]")].find(
    (element) => element.textContent?.trim() === String(value),
  )!;
const slot = (name: string) => document.querySelector<HTMLElement>(`[data-slot=${name}]`)!;

describe("Pagination", () => {
  it("is a labelled nav around a list of items", () => {
    render();
    const nav = slot("pagination");
    const list = slot("pagination-content");

    expect(nav.tagName).toBe("NAV");
    expect(nav.getAttribute("aria-label")).toBe("Pagination");
    expect(list.tagName).toBe("UL");
    expect([...list.children].every((child) => child.tagName === "LI")).toBe(true);
  });

  it("draws the current page solid primary and the others ghost neutral", () => {
    render();

    expect(link(1).getAttribute("aria-current")).toBe("page");
    expect(link(1).dataset).toMatchObject({ variant: "solid", color: "primary" });
    expect(link(2).dataset).toMatchObject({ variant: "ghost", color: "neutral" });
  });

  it("moves to the page that is pressed", async () => {
    const { page } = render();

    await userEvent.click(link(3));
    await nextTick();

    expect(page.value).toBe(3);
    expect(link(3).getAttribute("aria-current")).toBe("page");
    expect(link(3).dataset.variant).toBe("solid");
  });

  it("hands the root's look to every part, and a part's own prop wins", () => {
    render({ variant: "outline", activeVariant: "soft" }, (item) =>
      h(PaginationLink, { value: item.value, variant: item.value === 3 ? "subtle" : undefined }),
    );

    expect(link(1).dataset.variant).toBe("soft");
    expect(link(2).dataset.variant).toBe("outline");
    expect(link(3).dataset.variant).toBe("subtle");
    expect(slot("pagination-next").dataset.variant).toBe("outline");
  });

  it.each([
    ["xs", 28],
    ["md", 36],
    ["xl", 48],
  ])("is %s at %ipx tall, pages at least square", (size, height) => {
    render({ size });
    const box = link(1).getBoundingClientRect();

    expect(box.height).toBe(height);
    expect(box.width).toBeGreaterThanOrEqual(height);
    expect(slot("pagination-previous").getBoundingClientRect().height).toBe(height);
  });

  it("disables Previous on the first page and Next on the last", () => {
    render();
    expect((slot("pagination-previous") as HTMLButtonElement).disabled).toBe(true);
    expect((slot("pagination-next") as HTMLButtonElement).disabled).toBe(false);

    document.body.innerHTML = "";
    render({ page: 10 });
    expect((slot("pagination-next") as HTMLButtonElement).disabled).toBe(true);
  });

  it("marks skipped pages with an ellipsis that names them", () => {
    render({ total: 200, showEdges: true });

    expect(slot("pagination-ellipsis").textContent).toContain("More pages");
  });

  it("renders a page as a link through as-child", () => {
    render({}, (item) =>
      h(PaginationLink, { value: item.value, asChild: true }, () => h("a", { href: `#${item.value}` }, item.value)),
    );

    expect(link(1).tagName).toBe("A");
    expect(link(1).getAttribute("aria-current")).toBe("page");
  });
});

describe("Pagination control tokens", () => {
  overrideControlTokens();

  it.each(controlSizes)("%s pages are at least the height token wide, the ellipsis is its square", (size) => {
    render({ size, total: 200, showEdges: true });
    const ellipsis = slot("pagination-ellipsis").getBoundingClientRect();

    expect(px(getComputedStyle(link(1)).minWidth)).toBe(sentinel.height[size]);
    expect([ellipsis.width, ellipsis.height]).toEqual([sentinel.height[size], sentinel.height[size]]);
  });

  it.each(["xs", "sm", "md"] as const)("the %s ellipsis icon reads the icon token", (size) => {
    render({ size, total: 200, showEdges: true });
    expect(slot("pagination-ellipsis").querySelector("svg")!.getBoundingClientRect().width).toBe(sentinel.icon[size]);
  });
});
