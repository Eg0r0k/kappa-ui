import { Donut } from "@unovis/ts";
import { VisArea, VisAxis, VisDonut, VisSingleContainer, VisXYContainer } from "@unovis/vue";
import { mount } from "@vue/test-utils";
import { expect, it, vi } from "vitest";
import { type Component, defineComponent, h, nextTick } from "vue";

import {
  type ChartConfig,
  ChartContainer,
  ChartCrosshair,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
  chartColors,
  useChart,
} from "@/ui/chart";

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
            h(ChartCrosshair as Component, { x, y, color }),
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

it.skip("re-renders the legend when the config changes", async () => {
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
  pointer("pointerup", root(), box.left + box.width * 0.4, box.top + box.height / 2);
  await settle();
  expect(visible(tooltip())).toBe(false);
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
});

it("keeps the crosshair between sparse points", async () => {
  const sparse = [rows[0]!, rows[3]!];
  mount(AreaChart({ data: sparse }), { attachTo: document.body });
  await settle();
  hover(0.5);
  await settle();
  expect(visible(tooltip())).toBe(true);
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
