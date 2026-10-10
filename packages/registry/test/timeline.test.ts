import { mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import { renderToString } from "vue/server-renderer";
import { type VNode, createSSRApp, defineComponent, h, nextTick, ref } from "vue";

import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineDescription,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/ui/timeline";

let unmount: (() => void) | undefined;

const reset = () => {
  unmount?.();
  unmount = undefined;
  document.body.innerHTML = "";
};

afterEach(reset);

const events = [
  { value: "kickoff", date: "Mar 15", title: "Kickoff", description: "Team alignment" },
  { value: "design", date: "Mar 22", title: "Design", description: "Wireframes" },
  { value: "build", date: "Mar 29", title: "Build", description: "Features" },
];

const item = (event: (typeof events)[number], props: Record<string, unknown> = {}, indicator?: () => VNode) =>
  h(TimelineItem, { value: event.value, ...props }, () => [
    indicator?.() ?? h(TimelineIndicator, () => "•"),
    h(TimelineSeparator),
    h(TimelineContent, () => [
      h(TimelineDate, { datetime: "2026-03-15" }, () => event.date),
      h(TimelineTitle, () => event.title),
      h(TimelineDescription, () => event.description),
    ]),
  ]);

const render = (
  root: Record<string, unknown> = {},
  items: () => VNode[] = () => events.map((event) => item(event)),
) => {
  const wrapper = mount({ render: () => h(Timeline, root, items) }, { attachTo: document.body });
  unmount = () => wrapper.unmount();
  return wrapper;
};

const q = (selector: string) => document.querySelector<HTMLElement>(selector)!;
const all = (selector: string) => [...document.querySelectorAll<HTMLElement>(selector)];
const root = () => q("[data-slot=timeline]");
const items = () => all("[data-slot=timeline-item]");
const indicators = () => all("[data-slot=timeline-indicator]");
const separators = () => all("[data-slot=timeline-separator]");
const states = () => items().map((element) => element.dataset.state);

it("renders an ordered list of records with no state until there is a model", () => {
  render();
  expect(root().tagName).toBe("OL");
  expect(root().dataset.orientation).toBe("vertical");
  expect(root().dataset.size).toBe("md");
  expect(root().dataset.color).toBe("primary");
  expect(root().dataset.reverse).toBeUndefined();
  expect(items().map((element) => element.tagName)).toEqual(["LI", "LI", "LI"]);
  expect(states()).toEqual([undefined, undefined, undefined]);
  expect(items().some((element) => element.hasAttribute("aria-current"))).toBe(false);
  expect(q("[data-slot=timeline-date]").tagName).toBe("TIME");
  expect(q("[data-slot=timeline-date]").getAttribute("datetime")).toBe("2026-03-15");
  expect(q("[data-slot=timeline-title]").tagName).toBe("DIV");
  expect(separators()[0]!.getAttribute("data-orientation")).toBe("vertical");
});

it("marks the active record from default-value and the ones before it completed", () => {
  render({ defaultValue: "design" });
  expect(states()).toEqual(["completed", "active", "inactive"]);
  expect(items()[1]!.getAttribute("aria-current")).toBe("step");
  expect(items()[0]!.hasAttribute("aria-current")).toBe(false);
});

it("follows v-model and does not report on its own", async () => {
  const updates: unknown[] = [];
  const wrapper = mount(
    defineComponent({
      setup: () => {
        const step = ref<string>("kickoff");
        return () =>
          h(
            Timeline,
            { modelValue: step.value, "onUpdate:modelValue": (value: unknown) => updates.push(value) },
            () => [
              ...events.map((event) => item(event)),
              h("button", { id: "next", onClick: () => (step.value = "build") }, "Next"),
            ],
          );
      },
    }),
    { attachTo: document.body },
  );
  unmount = () => wrapper.unmount();
  expect(states()).toEqual(["active", "inactive", "inactive"]);
  q("#next").click();
  await nextTick();
  expect(states()).toEqual(["completed", "completed", "active"]);
  expect(updates).toEqual([]);
});

it("counts the records after the active one as completed when reversed", () => {
  render({ defaultValue: "design", reverse: true });
  expect(root().dataset.reverse).toBe("true");
  expect(states()).toEqual(["inactive", "active", "completed"]);
});

it("picks by index when the items have no value and the model is a number", () => {
  render({ defaultValue: 2 }, () => events.map((event) => item(event, { value: undefined })));
  expect(states()).toEqual(["completed", "completed", "active"]);
});

it("counts a model that matches nothing as past the last record", () => {
  render({ defaultValue: "nowhere" });
  expect(states()).toEqual(["completed", "completed", "completed"]);
  reset();

  render({ defaultValue: "nowhere", reverse: true });
  expect(states()).toEqual(["inactive", "inactive", "inactive"]);
});

it("keeps document order when a record appears later", async () => {
  const shown = ref(false);
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(Timeline, { defaultValue: "build" }, () => [
          item(events[0]!),
          shown.value ? item(events[1]!) : null,
          item(events[2]!),
        ]),
    }),
    { attachTo: document.body },
  );
  unmount = () => wrapper.unmount();
  expect(states()).toEqual(["completed", "active"]);
  shown.value = true;
  await nextTick();
  await nextTick();
  expect(states()).toEqual(["completed", "completed", "active"]);
});

it("hides the last separator", () => {
  render();
  expect(getComputedStyle(separators()[0]!).display).not.toBe("none");
  expect(getComputedStyle(separators()[2]!).display).toBe("none");
});

it("draws the indicators and the reached lines in the colour, inactive ones muted", () => {
  render({
    defaultValue: "design",
    style: "--primary: rgb(0, 0, 255); --primary-foreground: rgb(255, 255, 255)",
  });
  const [completed, active, inactive] = indicators();
  expect(getComputedStyle(completed!).backgroundColor).toBe("rgb(0, 0, 255)");
  expect(getComputedStyle(active!).backgroundColor).toBe("rgb(0, 0, 255)");
  expect(getComputedStyle(active!).color).toBe("rgb(255, 255, 255)");
  expect(getComputedStyle(inactive!).backgroundColor).not.toBe("rgb(0, 0, 255)");
  expect(getComputedStyle(separators()[0]!).backgroundColor).toBe("rgb(0, 0, 255)");
  expect(getComputedStyle(separators()[1]!).backgroundColor).not.toBe("rgb(0, 0, 255)");
  reset();

  render({ defaultValue: "design", reverse: true, style: "--primary: rgb(0, 0, 255)" });
  expect(getComputedStyle(separators()[0]!).backgroundColor).not.toBe("rgb(0, 0, 255)");
  expect(getComputedStyle(separators()[1]!).backgroundColor).toBe("rgb(0, 0, 255)");
  reset();

  render({ color: "success", style: "--success: rgb(0, 128, 0)" });
  expect(root().dataset.color).toBe("success");
  expect(getComputedStyle(indicators()[0]!).backgroundColor).toBe("rgb(0, 128, 0)");
});

it("retones one record from its indicator's colour", () => {
  render({ style: "--primary: rgb(0, 0, 255); --destructive: rgb(200, 0, 0)" }, () => [
    item(events[0]!),
    item(events[1]!, {}, () => h(TimelineIndicator, { color: "destructive" }, () => "!")),
  ]);
  expect(indicators()[1]!.dataset.color).toBe("destructive");
  expect(getComputedStyle(indicators()[0]!).backgroundColor).toBe("rgb(0, 0, 255)");
  expect(getComputedStyle(indicators()[1]!).backgroundColor).toBe("rgb(200, 0, 0)");
});

it("sizes the indicator and the line from the size prop and leaves the text alone", () => {
  render();
  expect(indicators()[0]!.getBoundingClientRect().width).toBe(32);
  expect(separators()[0]!.getBoundingClientRect().width).toBe(2);
  expect(separators()[0]!.getBoundingClientRect().height).toBeGreaterThanOrEqual(24);
  expect(separators()[0]!.getBoundingClientRect().bottom).toBeLessThanOrEqual(
    indicators()[1]!.getBoundingClientRect().top - 8,
  );
  expect(getComputedStyle(q("[data-slot=timeline-title]")).fontSize).toBe("14px");
  reset();

  render({ size: "xl" });
  expect(root().dataset.size).toBe("xl");
  expect(indicators()[0]!.getBoundingClientRect().width).toBe(48);
  expect(separators()[0]!.getBoundingClientRect().width).toBe(4);
  expect(getComputedStyle(q("[data-slot=timeline-title]")).fontSize).toBe("14px");
  reset();

  render({ size: "xs" });
  expect(indicators()[0]!.getBoundingClientRect().width).toBe(24);
  expect(separators()[0]!.getBoundingClientRect().width).toBe(1);
});

it("lays a horizontal timeline out in a row with horizontal lines", () => {
  render({ orientation: "horizontal", class: "w-[600px]" });
  expect(root().dataset.orientation).toBe("horizontal");
  expect(getComputedStyle(root()).flexDirection).toBe("row");
  expect(separators()[0]!.getAttribute("data-orientation")).toBe("horizontal");
  expect(items()[0]!.dataset.orientation).toBe("horizontal");
  const line = separators()[0]!.getBoundingClientRect();
  expect(line.height).toBe(2);
  expect(line.width).toBeGreaterThan(50);
  const indicator = indicators()[0]!.getBoundingClientRect();
  const content = q("[data-slot=timeline-content]").getBoundingClientRect();
  expect(content.top).toBeGreaterThanOrEqual(indicator.bottom);
});

it("hands the state to the item slot", () => {
  render({ defaultValue: "kickoff" }, () => [
    h(TimelineItem, { value: "kickoff" }, { default: (slot: { state?: string }) => h("span", `one ${slot.state}`) }),
    h(TimelineItem, { value: "design" }, { default: (slot: { state?: string }) => h("span", `two ${slot.state}`) }),
  ]);
  expect(items().map((element) => element.textContent)).toEqual(["one active", "two inactive"]);
});

it("merges class onto every part", () => {
  render({ class: "timeline-x" }, () => [
    h(TimelineItem, { value: "a", class: "item-x" }, () => [
      h(TimelineIndicator, { class: "indicator-x" }),
      h(TimelineSeparator, { class: "separator-x" }),
      h(TimelineContent, { class: "content-x" }, () => [
        h(TimelineDate, { class: "date-x" }, () => "D"),
        h(TimelineTitle, { class: "title-x" }, () => "T"),
        h(TimelineDescription, { class: "description-x" }, () => "X"),
      ]),
    ]),
  ]);
  for (const part of ["item", "indicator", "separator", "content", "date", "title", "description"]) {
    expect(q(`[data-slot=timeline-${part}]`).classList.contains(`${part}-x`)).toBe(true);
  }
  expect(root().classList.contains("timeline-x")).toBe(true);
});

it("treats a null model like none", () => {
  render({ modelValue: null });
  expect(states()).toEqual([undefined, undefined, undefined]);
});

it("follows the DOM order after a keyed reorder", async () => {
  const order = ref(["kickoff", "design", "build"]);
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(Timeline, { defaultValue: "design" }, () =>
          order.value.map((value) => item(events.find((event) => event.value === value)!, { key: value })),
        ),
    }),
    { attachTo: document.body },
  );
  unmount = () => wrapper.unmount();
  expect(states()).toEqual(["completed", "active", "inactive"]);
  order.value = ["build", "design", "kickoff"];
  await nextTick();
  await nextTick();
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(items().map((element) => element.textContent?.includes("Build"))).toEqual([true, false, false]);
  expect(states()).toEqual(["completed", "active", "inactive"]);
});

it("renders the state on the server and hydrates without a mismatch", async () => {
  const app = (props: Record<string, unknown>) =>
    createSSRApp({ render: () => h(Timeline, props, () => events.map((event) => item(event))) });
  const stateOf = (html: string) =>
    [...html.matchAll(/data-state="(completed|active|inactive)"/g)].map((match) => match[1]);

  const html = await renderToString(app({ defaultValue: "design" }));
  expect(stateOf(html)).toEqual(["completed", "active", "inactive"]);
  expect(html.match(/aria-current="step"/g)).toHaveLength(1);

  expect(stateOf(await renderToString(app({ defaultValue: "design", reverse: true })))).toEqual([
    "inactive",
    "active",
    "completed",
  ]);
  expect(stateOf(await renderToString(app({ defaultValue: "nowhere" })))).toEqual([
    "completed",
    "completed",
    "completed",
  ]);

  const warn = vi.spyOn(console, "warn");
  const error = vi.spyOn(console, "error");
  try {
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.append(container);
    const hydrated = app({ defaultValue: "design" });
    hydrated.mount(container);
    unmount = () => hydrated.unmount();
    await nextTick();
    const complaints = [...warn.mock.calls, ...error.mock.calls].filter((call) =>
      /hydration|mismatch/i.test(String(call[0])),
    );
    expect(complaints).toEqual([]);
    expect(states()).toEqual(["completed", "active", "inactive"]);
  } finally {
    warn.mockRestore();
    error.mockRestore();
  }
});
