import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { h, nextTick, ref } from "vue";

import { PageIndicator, PageIndicatorItem } from "@/ui/page-indicator";

const cleanups: (() => void)[] = [];

const style = (css: string) => {
  const element = document.createElement("style");
  element.textContent = css;
  document.head.append(element);
  cleanups.push(() => element.remove());
};

beforeEach(() =>
  style("[data-slot=page-indicator-item], [data-slot=page-indicator-item]::before { transition: none !important; }"),
);

afterEach(() => {
  cleanups.splice(0).forEach((cleanup) => cleanup());
  document.body.innerHTML = "";
});

const render = (
  props: () => Record<string, unknown> = () => ({}),
  item: (page: number) => Record<string, unknown> = () => ({}),
) => {
  const wrapper = mount(
    {
      render: () =>
        h(
          PageIndicator,
          { count: 4, ...props() },
          {
            default: ({ pages }: { pages: number[] }) =>
              pages.map((page) => h(PageIndicatorItem, { key: page, value: page, ...item(page) })),
          },
        ),
    },
    { attachTo: document.body },
  );
  cleanups.push(() => wrapper.unmount());
  return wrapper;
};

const controlled = (initial: number, props: Record<string, unknown> = {}) => {
  const page = ref(initial);
  render(() => ({ ...props, page: page.value, "onUpdate:page": (value: number) => (page.value = value) }));
  return page;
};

const roots = () => [...document.querySelectorAll<HTMLElement>("[data-slot=page-indicator]")];
const root = () => roots()[0]!;
const all = (scope: ParentNode = document) => [
  ...scope.querySelectorAll<HTMLElement>("[data-slot=page-indicator-item]"),
];
const states = () => all().map((element) => element.dataset.state);
const fill = (element: HTMLElement) => getComputedStyle(element, "::before");
const rect = (element: HTMLElement) => element.getBoundingClientRect();

const press = async (keys: string) => {
  await userEvent.keyboard(keys);
  await nextTick();
};

it("renders a group of page buttons with the current one marked", () => {
  render(() => ({ defaultPage: 2 }));
  expect(root().getAttribute("role")).toBe("group");
  expect(root().getAttribute("aria-label")).toBe("Pages");
  expect({ ...root().dataset }).toMatchObject({
    variant: "dot",
    size: "md",
    orientation: "horizontal",
    color: "primary",
  });
  expect(all().map((element) => element.tagName)).toEqual(["BUTTON", "BUTTON", "BUTTON", "BUTTON"]);
  expect(all()[0]!.getAttribute("type")).toBe("button");
  expect(all().map((element) => element.getAttribute("aria-label"))).toEqual(["Page 1", "Page 2", "Page 3", "Page 4"]);
  expect(all().map((element) => element.getAttribute("aria-current"))).toEqual([null, "true", null, null]);
  expect(states()).toEqual(["completed", "active", "inactive", "inactive"]);
});

it("hands the pages and the current page to its slot, starting on the first", () => {
  let scope: unknown;
  const wrapper = mount(
    { render: () => h(PageIndicator, { count: 3 }, { default: (props: unknown) => ((scope = props), []) }) },
    { attachTo: document.body },
  );
  cleanups.push(() => wrapper.unmount());
  expect(scope).toEqual({ pages: [1, 2, 3], page: 1 });
});

it("moves to a clicked page and reports it once", async () => {
  const updates: number[] = [];
  render(() => ({ "onUpdate:page": (value: number) => updates.push(value) }));
  await userEvent.click(all()[2]!);
  expect(updates).toEqual([3]);
  expect(states()).toEqual(["completed", "completed", "active", "inactive"]);
  await userEvent.click(all()[2]!);
  expect(updates).toEqual([3]);
});

it("shows the page it is given and leaves changes to the owner", async () => {
  const page = ref(2);
  const updates: number[] = [];
  render(() => ({ page: page.value, "onUpdate:page": (value: number) => updates.push(value) }));
  await userEvent.click(all()[3]!);
  expect(updates).toEqual([4]);
  expect(states()).toEqual(["completed", "active", "inactive", "inactive"]);
  page.value = 3;
  await nextTick();
  expect(states()).toEqual(["completed", "completed", "active", "inactive"]);
});

it("moves focus with the arrow keys, Home and End, and selects with Enter or Space", async () => {
  const page = controlled(1);
  all()[0]!.focus();
  await press("{ArrowRight}");
  expect(document.activeElement).toBe(all()[1]);
  expect(page.value).toBe(1);
  await press("{Enter}");
  expect(page.value).toBe(2);
  await press("{End}");
  expect(document.activeElement).toBe(all()[3]);
  await press("{ArrowRight}");
  expect(document.activeElement).toBe(all()[0]);
  await press("{ArrowLeft}");
  expect(document.activeElement).toBe(all()[3]);
  await press("{Home}");
  expect(document.activeElement).toBe(all()[0]);
  await press("{ArrowDown}");
  expect(document.activeElement).toBe(all()[0]);
  await press(" ");
  expect(page.value).toBe(1);
  await press("{ArrowRight}{ArrowRight} ");
  expect(page.value).toBe(3);
});

it("follows the vertical axis", async () => {
  controlled(1, { orientation: "vertical" });
  expect(getComputedStyle(root()).flexDirection).toBe("column");
  all()[0]!.focus();
  await press("{ArrowRight}");
  expect(document.activeElement).toBe(all()[0]);
  await press("{ArrowDown}");
  expect(document.activeElement).toBe(all()[1]);
  await press("{ArrowUp}");
  expect(document.activeElement).toBe(all()[0]);
});

it("reverses the horizontal arrows right to left", async () => {
  controlled(1, { dir: "rtl" });
  expect(root().getAttribute("dir")).toBe("rtl");
  all()[0]!.focus();
  await press("{ArrowLeft}");
  expect(document.activeElement).toBe(all()[1]);
});

it("keeps the single tab stop on the page set from outside", async () => {
  const page = controlled(1);
  const before = document.createElement("button");
  const after = document.createElement("button");
  document.body.prepend(before);
  document.body.append(after);
  page.value = 3;
  await nextTick();
  expect(all().map((element) => element.tabIndex)).toEqual([-1, -1, 0, -1]);
  before.focus();
  await userEvent.tab();
  expect(document.activeElement).toBe(all()[2]);
  after.focus();
  await userEvent.tab({ shift: true });
  expect(document.activeElement).toBe(all()[2]);
  expect(page.value).toBe(3);
});

it("only shows the page when readonly", async () => {
  const updates: number[] = [];
  render(() => ({ readonly: true, defaultPage: 2, "onUpdate:page": (value: number) => updates.push(value) }));
  expect(root().getAttribute("role")).toBe("img");
  expect(root().getAttribute("aria-label")).toBe("Page 2 of 4");
  expect(root().hasAttribute("tabindex")).toBe(false);
  expect(all().map((element) => element.tagName)).toEqual(["SPAN", "SPAN", "SPAN", "SPAN"]);
  expect(all().some((element) => element.hasAttribute("tabindex") || element.hasAttribute("aria-label"))).toBe(false);
  await userEvent.click(all()[3]!);
  expect(updates).toEqual([]);
  expect(states()).toEqual(["completed", "active", "inactive", "inactive"]);
});

it("takes names for the indicator and its pages from aria-label", () => {
  render(
    () => ({ "aria-label": "Photos" }),
    (page) => ({ "aria-label": `Photo ${page}` }),
  );
  render(() => ({ readonly: true, "aria-label": "Story 1 of 4" }));
  expect(roots().map((element) => element.getAttribute("aria-label"))).toEqual(["Photos", "Story 1 of 4"]);
  expect(all(roots()[0]!).map((element) => element.getAttribute("aria-label"))).toEqual([
    "Photo 1",
    "Photo 2",
    "Photo 3",
    "Photo 4",
  ]);
});

it("fills the current page, and the passed ones when cumulative", () => {
  render(() => ({ defaultPage: 3 }));
  render(() => ({ defaultPage: 3, cumulative: true }));
  const widths = (index: number) => all(roots()[index]!).map((element) => fill(element).width);
  expect(widths(0)).toEqual(["0px", "0px", "8px", "0px"]);
  expect(widths(1)).toEqual(["8px", "8px", "8px", "0px"]);
});

it("fills the current page up to progress, along the axis", () => {
  render(() => ({ variant: "pill", defaultPage: 2, progress: 0.25 }));
  render(() => ({ variant: "pill", defaultPage: 2, progress: 1.5 }));
  render(() => ({ variant: "pill", defaultPage: 2, progress: 0.5, orientation: "vertical" }));
  const current = (index: number) => fill(all(roots()[index]!)[1]!);
  expect(current(0).width).toBe("6px");
  expect(current(1).width).toBe("24px");
  expect(current(2).height).toBe("12px");
  expect(current(2).width).toBe("8px");
});

it("paints the fill from the tone and the track from a fainter tone", () => {
  style('[data-slot][data-color="brand"] { --tone: rgb(255, 0, 0); }');
  render(() => ({ color: "brand" }));
  expect(root().dataset.color).toBe("brand");
  expect(fill(all()[0]!).backgroundColor).toBe("rgb(255, 0, 0)");
  const track = getComputedStyle(all()[1]!).backgroundColor;
  expect(track).not.toBe("rgba(0, 0, 0, 0)");
  expect(track).not.toBe("rgb(255, 0, 0)");
});

it("stretches the current pill along the axis", () => {
  render(() => ({ variant: "pill", defaultPage: 2 }));
  render(() => ({ variant: "pill", defaultPage: 2, orientation: "vertical" }));
  const sizes = (index: number) => all(roots()[index]!).map((element) => [rect(element).width, rect(element).height]);
  expect(sizes(0)).toEqual([
    [8, 8],
    [24, 8],
    [8, 8],
    [8, 8],
  ]);
  expect(sizes(1)).toEqual([
    [8, 8],
    [8, 24],
    [8, 8],
    [8, 8],
  ]);
});

it("shares the length between lines", () => {
  render(() => ({ variant: "line", style: "width: 200px" }));
  expect(all().map((element) => [rect(element).width, rect(element).height])).toEqual([
    [44, 8],
    [44, 8],
    [44, 8],
    [44, 8],
  ]);
});

it("sizes the dots and gaps from xs to xl", () => {
  const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
  for (const size of sizes) render(() => ({ size }));
  const measured = roots().map((element) => {
    const [first, second] = all(element);
    return [rect(first!).width, rect(second!).left - rect(first!).right];
  });
  expect(measured).toEqual([
    [4, 4],
    [6, 6],
    [8, 8],
    [10, 10],
    [12, 12],
  ]);
  expect(roots().map((element) => element.dataset.size)).toEqual([...sizes]);
});

it("grows the pressable area with touchTarget", () => {
  render(() => ({ touchTarget: "expand" }));
  render(() => ({ touchTarget: "wrapper", variant: "pill", defaultPage: 2 }));
  const [expand, wrapper] = roots();
  const after = getComputedStyle(all(expand!)[0]!, "::after");
  expect([after.width, after.height]).toEqual(["48px", "48px"]);
  expect(rect(expand!).height).toBe(8);
  const [dot, pill] = all(wrapper!).map((element) => getComputedStyle(element));
  expect([dot!.marginLeft, dot!.marginTop]).toEqual(["20px", "20px"]);
  expect(pill!.marginLeft).toBe("12px");
  expect(rect(wrapper!).height).toBe(48);
});
