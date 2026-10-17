import { Crosshair, Donut } from "@unovis/ts";
import { VisArea, VisAxis, VisDonut, VisSingleContainer, VisXYContainer } from "@unovis/vue";
import { mount } from "@vue/test-utils";
import { expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { type Component, defineComponent, h, nextTick, ref } from "vue";

import {
  type ChartConfig,
  ChartContainer,
  ChartCrosshair,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
  chartColors,
  useChart,
  useChartSeries,
} from "@/ui/chart";
import containerSource from "@/ui/chart/ChartContainer.vue?raw";

import { pointer, wait } from "./pointer";

type Row = { month: Date; desktop: number; mobile: number };
const rows: Row[] = [
  { month: new Date(2024, 0, 1), desktop: 186, mobile: 80 },
  { month: new Date(2024, 1, 1), desktop: 305, mobile: 200 },
  { month: new Date(2024, 2, 1), desktop: 237, mobile: 0 },
  { month: new Date(2024, 3, 1), desktop: 73, mobile: 190 },
];
const config = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig;
const keys = ["desktop", "mobile"];
const x = (d: Row) => d.month;
const y = [(d: Row) => d.desktop, (d: Row) => d.mobile];
const color = chartColors(keys);

const root = () => document.querySelector<HTMLElement>("[data-slot=chart]")!;
const tooltip = () => document.querySelector<HTMLElement>("[data-slot=chart-tooltip]")!;
const svg = () => root().querySelector("svg")!;
const legend = () => document.querySelector<HTMLElement>("[data-slot=chart-legend]")!;
const crosshairOpacity = () =>
  getComputedStyle(root().querySelector(`svg .${Crosshair.selectors.line}`)!.parentElement!).opacity;
const visible = (el: HTMLElement) => getComputedStyle(el).visibility === "visible";
const hover = (fx: number, fy = 0.5) => {
  const box = svg().getBoundingClientRect();
  const clientX = box.left + box.width * fx;
  const clientY = box.top + box.height * fy;
  svg().dispatchEvent(new MouseEvent("mousemove", { clientX, clientY, bubbles: true }));
  root().dispatchEvent(new PointerEvent("pointermove", { clientX, clientY, pointerType: "mouse", bubbles: true }));
};

type Options = {
  data?: Row[];
  renders?: { count: number };
  content?: Record<string, unknown>;
  slots?: Record<string, (props: never) => unknown>;
  container?: Record<string, unknown>;
  crosshair?: Record<string, unknown>;
  legend?: Record<string, unknown>;
};

const AreaChart = (options: Options = {}) =>
  defineComponent({
    setup: () => () =>
      h(ChartContainer, { config, class: "aspect-auto h-[200px] w-[400px]", ...options.container }, () => [
        h(
          VisXYContainer,
          {
            data: options.data ?? rows,
            duration: 0,
            onRenderComplete: () => {
              if (options.renders) options.renders.count++;
            },
          },
          () => [
            h(VisArea, { x, y, color }),
            h(VisAxis, { type: "x", x }),
            h(ChartCrosshair as Component, { x, yStacked: y, color, ...options.crosshair }),
          ],
        ),
        h(ChartTooltip, () => h(ChartTooltipContent, options.content ?? {}, options.slots)),
        h(ChartLegend, options.legend ?? {}),
      ]),
  });

const settle = () => wait(150);

it("writes --color-<key> for every colour, and light-dark() for a theme pair", () => {
  mount(ChartContainer, {
    props: { config: { a: { color: "var(--chart-1)" }, b: { theme: { light: "#111111", dark: "#eeeeee" } }, c: {} } },
    attachTo: document.body,
  });
  expect(root().style.getPropertyValue("--color-a")).toBe("var(--chart-1)");
  expect(root().style.getPropertyValue("--color-b")).toBe("light-dark(#111111, #eeeeee)");
  expect(root().style.getPropertyValue("--color-c")).toBe("");
  expect(getComputedStyle(root()).getPropertyValue("--color-a")).toMatch(/^oklch\(/);
});

it("warns in development about a key that cannot name a CSS variable", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  mount(ChartContainer, { props: { config: { "a.b": { color: "red" }, fine_1: {} } }, attachTo: document.body });
  expect(warn).toHaveBeenCalledTimes(1);
  expect(warn.mock.calls[0]![0]).toContain('"a.b"');
});

it("keeps the chart's aspect ratio by default and lets the Unovis container fill it", async () => {
  mount(
    defineComponent(
      () => () =>
        h("div", { style: "width:320px" }, [
          h(ChartContainer, { config }, () =>
            h(VisXYContainer, { data: rows, duration: 0 }, () => h(VisArea, { x, y, color })),
          ),
        ]),
    ),
    { attachTo: document.body },
  );
  await settle();
  expect(root().getBoundingClientRect().height).toBe(180);
  expect(root().querySelector<HTMLElement>("[data-vis-xy-container]")!.getBoundingClientRect().height).toBe(180);
});

it("fits a legend inside a root of fixed height", async () => {
  mount(
    defineComponent(
      () => () =>
        h(ChartContainer, { config, class: "aspect-auto h-[200px] w-[400px]" }, () => [
          h(VisXYContainer, { data: rows, duration: 0 }, () => h(VisArea, { x, y, color })),
          h(ChartLegend),
        ]),
    ),
    { attachTo: document.body },
  );
  await settle();
  const box = root().getBoundingClientRect();
  expect(svg().getBoundingClientRect().top).toBeGreaterThanOrEqual(box.top);
  expect(legend().getBoundingClientRect().bottom).toBeLessThanOrEqual(box.bottom);
  expect(box.height).toBe(200);
});

it("keeps a natural height when the root sets none", async () => {
  mount(
    defineComponent(
      () => () =>
        h(ChartContainer, { config, class: "aspect-auto" }, () => [
          h(VisXYContainer, { data: rows, duration: 0, height: 200 }, () => h(VisArea, { x, y, color })),
          h(ChartLegend),
        ]),
    ),
    { attachTo: document.body },
  );
  await nextTick();
  await settle();
  const container = root().querySelector<HTMLElement>("[data-vis-xy-container]")!;
  expect(container.offsetHeight).toBe(200);
  expect(legend().getBoundingClientRect().top).toBeGreaterThanOrEqual(container.getBoundingClientRect().bottom);
});

it("keeps its aspect ratio with a legend inside", async () => {
  mount(
    defineComponent(
      () => () =>
        h("div", { style: "width:320px" }, [
          h(ChartContainer, { config }, () => [
            h(VisXYContainer, { data: rows, duration: 0 }, () => h(VisArea, { x, y, color })),
            h(ChartLegend),
          ]),
        ]),
    ),
    { attachTo: document.body },
  );
  await settle();
  const box = root().getBoundingClientRect();
  expect(box.height).toBe(180);
  expect(legend().getBoundingClientRect().bottom).toBeLessThanOrEqual(box.bottom);
});

it("lets a class on the container override a Unovis variable", () => {
  const strokeWidth = () => getComputedStyle(root()).getPropertyValue("--vis-donut-segment-stroke-width").trim();
  mount(ChartContainer, { props: { config }, attachTo: document.body });
  expect(strokeWidth()).toBe("2px");
  document.body.innerHTML = "";
  mount(ChartContainer, {
    props: { config, class: "[--vis-donut-segment-stroke-width:0px]" },
    attachTo: document.body,
  });
  expect(strokeWidth()).toBe("0px");
});

it("keeps an area's fill opacity under the pointer", () => {
  mount(ChartContainer, {
    props: { config, class: "[--vis-area-fill-opacity:0.4]" },
    attachTo: document.body,
  });
  expect(getComputedStyle(root()).getPropertyValue("--vis-area-hover-fill-opacity").trim()).toBe("0.4");
});

it("styles Unovis through the chart root, its data attributes and --vis- variables only", () => {
  const style = containerSource.slice(containerSource.indexOf("<style"));
  expect(style).not.toMatch(/\.css-|unovis-/);
  expect(new Set(style.match(/(?<![\w-])\.-?[a-z_][\w-]*/gi))).toEqual(new Set([".kappa-chart"]));
  const deep = [...style.matchAll(/:deep\(([^)]*)\)/g)].map((match) => match[1]);
  expect(deep.length).toBeGreaterThan(0);
  for (const selector of deep) expect(selector).toMatch(/^\[data-vis-[\w-]+\]$/);
  const variables = [...style.matchAll(/^\s*(--[\w-]+):/gm)].map((match) => match[1]);
  expect(variables.length).toBeGreaterThan(0);
  for (const name of variables) expect(name).toMatch(/^--vis-/);
});

it("labels the root for assistive technology only when asked", () => {
  mount(ChartContainer, { props: { config, label: "Visitors by month" }, attachTo: document.body });
  expect(root().getAttribute("role")).toBe("group");
  expect(root().getAttribute("aria-label")).toBe("Visitors by month");
  document.body.innerHTML = "";
  mount(ChartContainer, { props: { config }, attachTo: document.body });
  expect(root().hasAttribute("role")).toBe(false);
});

it("takes the axis tick colour from the tokens of a .dark island", async () => {
  mount(
    defineComponent(
      () => () =>
        h("div", { class: "dark" }, [
          h(ChartContainer, { config, class: "aspect-auto h-[200px] w-[400px]" }, () =>
            h(VisXYContainer, { data: rows, duration: 0 }, () => [
              h(VisArea, { x, y, color }),
              h(VisAxis, { type: "x", x }),
            ]),
          ),
        ]),
    ),
    { attachTo: document.body },
  );
  await settle();
  const island = document.querySelector<HTMLElement>(".dark")!;
  const tick = root().querySelector<SVGTextElement>("svg text")!;
  expect(getComputedStyle(tick).fill).toBe(getComputedStyle(island).getPropertyValue("--muted-foreground").trim());
});

it("mounts the slot lazily when it is below the viewport", async () => {
  mount(
    defineComponent(
      () => () =>
        h("div", [
          h("div", { style: "height:3000px" }),
          h(ChartContainer, { config, lazy: true, class: "aspect-auto h-[200px] w-[400px]" }, () =>
            h(VisXYContainer, { data: rows, duration: 0 }, () => h(VisArea, { x, y, color })),
          ),
        ]),
    ),
    { attachTo: document.body },
  );
  await settle();
  expect(root().querySelector("[data-vis-xy-container]")).toBeNull();
  expect(root().getBoundingClientRect().height).toBe(200);
  root().scrollIntoView();
  await settle();
  expect(root().querySelector("[data-vis-xy-container]")).not.toBeNull();
});

it("re-renders the legend when the config changes", async () => {
  const wrapper = mount(
    defineComponent({
      props: { config: { type: Object, required: true } },
      setup: (props) => () => h(ChartContainer, { config: props.config as ChartConfig }, () => h(ChartLegend)),
    }),
    { props: { config }, attachTo: document.body },
  );
  expect(document.querySelectorAll("[data-slot=chart-legend-item]")).toHaveLength(2);
  await wrapper.setProps({ config: { ...config, tablet: { label: "Tablet", color: "var(--chart-3)" } } });
  expect(document.querySelectorAll("[data-slot=chart-legend-item]")).toHaveLength(3);
});

it("shows the hovered datum in the tooltip from the crosshair, zero included", async () => {
  mount(AreaChart(), { attachTo: document.body });
  await settle();
  hover(0.36);
  await settle();
  expect(visible(tooltip())).toBe(true);
  expect(tooltip().textContent).toContain("Desktop");
  expect(tooltip().textContent).toContain("305");
  hover(0.66);
  await settle();
  expect(tooltip().textContent).toContain("Mobile");
  expect(tooltip().textContent).toMatch(/Mobile\s*0\b/);
});

it("fills a series with the token its config colour names", async () => {
  mount(AreaChart(), { attachTo: document.body });
  await settle();
  const path = [...root().querySelectorAll<SVGPathElement>("svg path")].find(
    (element) => element.style.fill === "var(--color-desktop)",
  )!;
  expect(getComputedStyle(path).fill).toMatch(/^oklch\(/);
});

it("mounts, hovers and changes data without a console warning", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const wrapper = mount(
    defineComponent({
      props: { data: { type: Array, required: true } },
      setup: (props) => () =>
        h(ChartContainer, { config, class: "aspect-auto h-[200px] w-[400px]" }, () => [
          h(VisXYContainer, { data: props.data as Row[], duration: 0 }, () => [
            h(VisArea, { x, y, color }),
            h(ChartCrosshair as Component, { x, color }),
          ]),
          h(ChartTooltip, () => h(ChartTooltipContent)),
        ]),
    }),
    { props: { data: rows }, attachTo: document.body },
  );
  await settle();
  hover(0.36);
  await settle();
  await wrapper.setProps({ data: rows.slice(1) });
  await settle();
  expect(warn).not.toHaveBeenCalled();
});

it("hides the tooltip when the pointer leaves", async () => {
  mount(AreaChart(), { attachTo: document.body });
  await settle();
  hover(0.36);
  await settle();
  root().dispatchEvent(new PointerEvent("pointerleave", { pointerType: "mouse" }));
  svg().dispatchEvent(new MouseEvent("mouseout", { bubbles: true }));
  await nextTick();
  expect(visible(tooltip())).toBe(false);
});

it("does not re-render the chart while the pointer moves", async () => {
  const renders = { count: 0 };
  mount(AreaChart({ renders }), { attachTo: document.body });
  await settle();
  const before = renders.count;
  expect(before).toBeGreaterThan(0);
  for (let i = 0; i < 20; i++) {
    hover(0.1 + i * 0.04);
    await wait(20);
  }
  expect(renders.count).toBe(before);
});

it("positions the tooltip by transform inside the chart and flips at the right edge", async () => {
  mount(AreaChart(), { attachTo: document.body });
  await settle();
  hover(0.1);
  await settle();
  expect(tooltip().style.transform).toMatch(/^translate3d\(/);
  const chart = root().getBoundingClientRect();
  const left = tooltip().getBoundingClientRect();
  expect(left.left).toBeGreaterThan(chart.left + chart.width * 0.1);
  hover(0.95);
  await settle();
  const right = tooltip().getBoundingClientRect();
  expect(right.right).toBeLessThanOrEqual(chart.right);
  expect(right.right).toBeLessThan(chart.left + chart.width * 0.95);
});

it("positions the tooltip in layout pixels under a scaled ancestor", async () => {
  mount(
    defineComponent(() => () => h("div", { style: "transform: scale(0.5); transform-origin: 0 0" }, [h(AreaChart())])),
    { attachTo: document.body },
  );
  await settle();
  hover(0.36);
  await settle();
  const chart = root().getBoundingClientRect();
  const plot = svg().getBoundingClientRect();
  const layoutX = ((plot.left + plot.width * 0.36 - chart.left) * root().offsetWidth) / chart.width;
  const translateX = Number(/^translate3d\((-?[\d.]+)px/.exec(tooltip().style.transform)![1]);
  expect(visible(tooltip())).toBe(true);
  expect(Math.abs(translateX - (layoutX + 12))).toBeLessThanOrEqual(1);
});

it("keeps the tooltip beside the pointer in a right-to-left page", async () => {
  mount(
    defineComponent(() => () => h("div", { dir: "rtl" }, [h(AreaChart())])),
    { attachTo: document.body },
  );
  await settle();
  hover(0.1);
  await settle();
  const chart = root().getBoundingClientRect();
  const box = tooltip().getBoundingClientRect();
  expect(box.left).toBeGreaterThan(chart.left + chart.width * 0.1);
  expect(box.right).toBeLessThanOrEqual(chart.right);
});

it("scrubs with a touch pointer", async () => {
  mount(AreaChart(), { attachTo: document.body });
  await settle();
  const box = svg().getBoundingClientRect();
  pointer("pointerdown", root(), box.left + box.width * 0.36, box.top + box.height / 2);
  await wait(30);
  pointer("pointermove", root(), box.left + box.width * 0.4, box.top + box.height / 2);
  await settle();
  expect(visible(tooltip())).toBe(true);
  expect(tooltip().textContent).toContain("305");
  expect(crosshairOpacity()).toBe("1");
  pointer("pointerup", root(), box.left + box.width * 0.4, box.top + box.height / 2);
  await settle();
  expect(visible(tooltip())).toBe(false);
  expect(crosshairOpacity()).toBe("0");
});

it("scrubs to the touched point under a scaled ancestor", async () => {
  mount(
    defineComponent(() => () => h("div", { style: "transform: scale(0.5); transform-origin: 0 0" }, [h(AreaChart())])),
    { attachTo: document.body },
  );
  await settle();
  const box = svg().getBoundingClientRect();
  pointer("pointerdown", root(), box.left + box.width * 0.36, box.top + box.height / 2);
  await wait(30);
  pointer("pointermove", root(), box.left + box.width * 0.4, box.top + box.height / 2);
  await settle();
  expect(visible(tooltip())).toBe(true);
  expect(tooltip().textContent).toContain("305");
  expect(crosshairOpacity()).toBe("1");
  pointer("pointerup", root(), box.left + box.width * 0.4, box.top + box.height / 2);
  await settle();
  expect(visible(tooltip())).toBe(false);
  expect(crosshairOpacity()).toBe("0");
});

it("keeps the crosshair between sparse points", async () => {
  const sparse = [rows[0]!, rows[3]!];
  mount(AreaChart({ data: sparse }), { attachTo: document.body });
  await settle();
  hover(0.5);
  await settle();
  expect(visible(tooltip())).toBe(true);
  expect(crosshairOpacity()).toBe("1");
});

it("closes the tooltip when the crosshair hides far from a point", async () => {
  const sparse = [rows[0]!, rows[3]!];
  mount(AreaChart({ data: sparse, crosshair: { hideWhenFarFromPointer: true } }), { attachTo: document.body });
  await settle();
  hover(0.5);
  await settle();
  expect(crosshairOpacity()).toBe("0");
  expect(visible(tooltip())).toBe(false);
});

it("hands the raw x to the label formatter", async () => {
  mount(AreaChart({ content: { labelFormatter: (value: unknown) => (value instanceof Date ? "DATE" : "OTHER") } }), {
    attachTo: document.body,
  });
  await settle();
  hover(0.36);
  await settle();
  expect(tooltip().textContent).toContain("DATE");
  expect(tooltip().textContent).not.toContain("OTHER");
});

it("takes the title from a config key through labelKey and hides it with hideLabel", async () => {
  mount(AreaChart({ content: { labelKey: "desktop" } }), { attachTo: document.body });
  await settle();
  hover(0.36);
  await settle();
  expect(tooltip().querySelector(".font-medium")!.textContent).toBe("Desktop");
  document.body.innerHTML = "";
  mount(AreaChart({ content: { hideLabel: true } }), { attachTo: document.body });
  await settle();
  hover(0.36);
  await settle();
  expect(visible(tooltip())).toBe(true);
  expect(tooltip().textContent).toContain("305");
  expect(tooltip().textContent).not.toMatch(/2024/);
});

it("renders a custom item through the item slot", async () => {
  mount(
    AreaChart({
      slots: { item: ({ item }: { item: { label: string; value: number } }) => h("b", `${item.label}=${item.value}`) },
    }),
    { attachTo: document.body },
  );
  await settle();
  hover(0.36);
  await settle();
  expect(tooltip().querySelectorAll("b")).toHaveLength(2);
  expect(tooltip().textContent).toContain("Desktop=305");
});

it("lists a pie row by nameKey from component events", async () => {
  type Slice = { browser: string; visitors: number };
  const slices: Slice[] = [
    { browser: "chrome", visitors: 275 },
    { browser: "safari", visitors: 200 },
  ];
  const pie = {
    visitors: { label: "Visitors" },
    chrome: { label: "Chrome", color: "var(--chart-1)" },
    safari: { label: "Safari", color: "var(--chart-2)" },
  } satisfies ChartConfig;
  const value = (d: Slice) => d.visitors;
  const Pie = defineComponent({
    setup: () => {
      const SegmentsWithEvents = defineComponent({
        setup: () => {
          const { events } = useChart();
          const segmentEvents = events(Donut.selectors.segment);
          return () =>
            h(VisSingleContainer, { data: slices, duration: 0 }, () =>
              h(VisDonut, { value, color: (d: Slice) => `var(--color-${d.browser})`, events: segmentEvents }),
            );
        },
      });
      return () =>
        h(ChartContainer, { config: pie, class: "aspect-square h-[240px] w-[240px]" }, () => [
          h(SegmentsWithEvents),
          h(ChartTooltip, () => h(ChartTooltipContent, { nameKey: "browser", hideLabel: true })),
        ]);
    },
  });
  mount(Pie, { attachTo: document.body });
  await wait(700);
  const segment = root().querySelector<SVGPathElement>(`.${Donut.selectors.segment}`)!;
  const box = segment.getBoundingClientRect();
  const clientX = box.left + box.width / 2;
  const clientY = box.top + box.height / 2;
  root().dispatchEvent(new PointerEvent("pointermove", { clientX, clientY, pointerType: "mouse", bubbles: true }));
  segment.dispatchEvent(new PointerEvent("pointermove", { clientX, clientY, pointerType: "mouse", bubbles: true }));
  await settle();
  expect(visible(tooltip())).toBe(true);
  expect(tooltip().textContent).toContain("Chrome");
  expect(tooltip().textContent).toContain("275");
  expect(
    tooltip()
      .querySelector<HTMLElement>("[data-slot=chart-tooltip-indicator]")!
      .style.getPropertyValue("--chart-indicator"),
  ).toBe("var(--chart-1)");
});

it("renders one legend item per config key with its colour", () => {
  mount(ChartContainer, { props: { config }, attachTo: document.body, slots: { default: () => h(ChartLegend) } });
  const items = document.querySelectorAll<HTMLElement>("[data-slot=chart-legend-item]");
  expect(items).toHaveLength(2);
  expect(items[0]!.textContent?.trim()).toBe("Desktop");
  expect(items[0]!.tagName).toBe("DIV");
  expect(
    items[0]!.querySelector<HTMLElement>("[data-slot=chart-legend-swatch]")!.style.getPropertyValue("--chart-swatch"),
  ).toBe("var(--chart-1)");
  expect(items[0]!.dataset.state).toBe("visible");
});

it("toggles a series from the legend, with the keyboard, and reports it through v-model:hidden", async () => {
  const hidden: string[][] = [];
  mount(
    defineComponent(
      () => () =>
        h(ChartContainer, { config, "onUpdate:hidden": (keys: string[]) => hidden.push(keys) }, () =>
          h(ChartLegend, { toggle: true }),
        ),
    ),
    { attachTo: document.body },
  );
  const items = document.querySelectorAll<HTMLButtonElement>("[data-slot=chart-legend-item]");
  expect(items[0]!.tagName).toBe("BUTTON");
  expect(items[0]!.getAttribute("aria-pressed")).toBe("true");
  await userEvent.click(items[0]!);
  expect(items[0]!.getAttribute("aria-pressed")).toBe("false");
  expect(items[0]!.dataset.state).toBe("hidden");
  expect(hidden.at(-1)).toEqual(["desktop"]);
  items[1]!.focus();
  await userEvent.keyboard("{Enter}");
  expect(hidden.at(-1)).toEqual(["desktop", "mobile"]);
  await userEvent.keyboard("{Enter}");
  expect(hidden.at(-1)).toEqual(["desktop"]);
});

it("follows a bound v-model:hidden and emits the next keys", async () => {
  const hidden = ref<string[]>(["desktop"]);
  const emitted: string[][] = [];
  mount(
    defineComponent(
      () => () =>
        h(
          ChartContainer,
          {
            config,
            hidden: hidden.value,
            "onUpdate:hidden": (keys: string[]) => {
              emitted.push(keys);
              hidden.value = keys;
            },
          },
          () => h(ChartLegend, { toggle: true }),
        ),
    ),
    { attachTo: document.body },
  );
  const items = document.querySelectorAll<HTMLButtonElement>("[data-slot=chart-legend-item]");
  const states = () => [...items].map((item) => [item.getAttribute("aria-pressed"), item.dataset.state]);
  expect(states()).toEqual([
    ["false", "hidden"],
    ["true", "visible"],
  ]);
  await userEvent.click(items[0]!);
  expect(emitted).toEqual([[]]);
  expect(states()).toEqual([
    ["true", "visible"],
    ["true", "visible"],
  ]);
  hidden.value = ["mobile"];
  await nextTick();
  expect(states()).toEqual([
    ["true", "visible"],
    ["false", "hidden"],
  ]);
  await userEvent.click(items[0]!);
  expect(emitted.at(-1)).toEqual(["mobile", "desktop"]);
  expect(states()).toEqual([
    ["false", "hidden"],
    ["false", "hidden"],
  ]);
});

it("keeps the colours of the remaining series when one is hidden", async () => {
  const Series = defineComponent({
    setup: () => {
      const series = useChartSeries<Row>(keys);
      return () =>
        h(VisXYContainer, { data: rows, duration: 0 }, () => [
          h(VisArea, { x, y: series.y.value, color: series.color }),
        ]);
    },
  });
  mount(
    defineComponent(
      () => () =>
        h(ChartContainer, { config, class: "aspect-auto h-[200px] w-[400px]" }, () => [
          h(Series),
          h(ChartLegend, { toggle: true }),
        ]),
    ),
    { attachTo: document.body },
  );
  await settle();
  const fills = () =>
    [...root().querySelectorAll<SVGPathElement>("svg path")].map((path) => path.style.fill).filter(Boolean);
  expect(fills()).toEqual(["var(--color-mobile)", "var(--color-desktop)"]);
  await userEvent.click(document.querySelector<HTMLElement>("[data-slot=chart-legend-item]")!);
  await settle();
  expect(fills()).toEqual(["var(--color-mobile)", "var(--color-desktop)"]);
  const [mobile, desktop] = [...root().querySelectorAll<SVGPathElement>("svg path")].filter((path) => path.style.fill);
  const flat = (d: string) => new Set(d.match(/-?[\d.]+(?:e-?\d+)?/g)?.filter((_, i) => i % 2 === 1)).size === 1;
  expect(mobile!.getAttribute("d") ?? "").not.toSatisfy(flat);
  expect(desktop!.getAttribute("d") ?? "").toSatisfy(flat);
});

it("reads the hidden keys from a ref it is given, outside any container", () => {
  const series = useChartSeries<Row>(keys, ref(["desktop"]));
  expect(series.y.value[0]!(rows[1]!)).toBeNull();
  expect(series.y.value[1]!(rows[1]!)).toBe(200);
  expect(series.visible.value).toEqual(["mobile"]);
});

it("takes its width from the parent and never widens a parent that fits its content", async () => {
  mount(
    defineComponent(
      () => () =>
        h("div", { class: "flex w-[600px]" }, [
          h("div", { class: "w-fit" }, [
            h("div", { class: "h-4 w-[240px]" }),
            h(ChartContainer, { config, class: "aspect-auto h-[200px] w-full" }, () =>
              h(VisXYContainer, { data: rows, duration: 0 }, () => [h(VisArea, { x, y, color })]),
            ),
          ]),
        ]),
    ),
    { attachTo: document.body },
  );
  await settle();
  expect(root().getBoundingClientRect().width).toBe(240);
});

it("names a legend item by its key when the config gives no label", () => {
  mount(ChartContainer, {
    props: { config: { desktop: { color: "var(--chart-1)" } } },
    attachTo: document.body,
    slots: { default: () => h(ChartLegend) },
  });
  expect(document.querySelector("[data-slot=chart-legend-item]")!.textContent?.trim()).toBe("desktop");
});
