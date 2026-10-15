import { VisArea, VisAxis, VisXYContainer } from "@unovis/vue";
import { mount } from "@vue/test-utils";
import { expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";

import { type ChartConfig, ChartContainer, ChartLegend, chartColors } from "@/ui/chart";

import { wait } from "./pointer";

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
