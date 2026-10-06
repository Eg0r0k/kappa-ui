import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNode, defineComponent, h, nextTick, ref } from "vue";

import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/ui/stepper";

let unmount: (() => void) | undefined;

const reset = () => {
  unmount?.();
  unmount = undefined;
  document.body.innerHTML = "";
};

afterEach(reset);

const steps = [
  { step: 1, title: "Details", description: "Name and email" },
  { step: 2, title: "Password", description: "Choose one" },
  { step: 3, title: "Drink", description: "Pick one" },
];

const item = (step: (typeof steps)[number], props: Record<string, unknown> = {}, indicator?: () => VNode) =>
  h(StepperItem, { step: step.step, class: "flex-1", ...props }, () => [
    h(StepperTrigger, () => [
      indicator?.() ?? h(StepperIndicator, () => String(step.step)),
      h(StepperTitle, () => step.title),
      h(StepperDescription, () => step.description),
    ]),
    h(StepperSeparator),
  ]);

const render = (root: Record<string, unknown> = {}, items: () => VNode[] = () => steps.map((step) => item(step))) => {
  const wrapper = mount({ render: () => h(Stepper, root, items) }, { attachTo: document.body });
  unmount = () => wrapper.unmount();
  return wrapper;
};

const q = (selector: string) => document.querySelector<HTMLElement>(selector)!;
const all = (selector: string) => [...document.querySelectorAll<HTMLElement>(selector)];
const root = () => q("[data-slot=stepper]");
const items = () => all("[data-slot=stepper-item]");
const triggers = () => all("[data-slot=stepper-trigger]");
const indicators = () => all("[data-slot=stepper-indicator]");
const separators = () => all("[data-slot=stepper-separator]");
const states = () => items().map((element) => element.dataset.state);

const mousedown = (element: HTMLElement) => {
  element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }));
  return nextTick();
};

it("renders a group of button steps that announce their position", async () => {
  render();
  await nextTick();
  expect(root().getAttribute("role")).toBe("group");
  expect(root().dataset.orientation).toBe("horizontal");
  expect(root().dataset.linear).toBe("");
  expect(root().dataset.size).toBe("md");
  expect(root().textContent).toContain("Step 1 of 3");
  expect(triggers().map((element) => element.tagName)).toEqual(["BUTTON", "BUTTON", "BUTTON"]);
  expect(triggers()[0]!.getAttribute("type")).toBe("button");
  expect(states()).toEqual(["active", "inactive", "inactive"]);
  expect(items()[0]!.getAttribute("aria-current")).toBe("true");
});

it("names each trigger by its title and describes it by its description", () => {
  render();
  const [trigger] = triggers();
  expect(trigger!.getAttribute("aria-labelledby")).toBe(q("[data-slot=stepper-title]").id);
  expect(trigger!.getAttribute("aria-describedby")).toBe(q("[data-slot=stepper-description]").id);
  expect(q("[data-slot=stepper-title]").tagName).toBe("H4");
  expect(q("[data-slot=stepper-description]").tagName).toBe("P");
});

it("moves to a clicked step and reports it", async () => {
  const updates: unknown[] = [];
  render({ "onUpdate:modelValue": (value: unknown) => updates.push(value) });
  await userEvent.click(triggers()[1]!);
  expect(states()).toEqual(["completed", "active", "inactive"]);
  expect(items()[1]!.getAttribute("aria-current")).toBe("true");
  expect(root().textContent).toContain("Step 2 of 3");
  expect(updates).toEqual([2]);
});

it("keeps steps beyond the next one out of reach while linear", async () => {
  render();
  expect(triggers().map((element) => element.tabIndex)).toEqual([0, 0, -1]);
  expect(triggers()[2]!.hasAttribute("disabled")).toBe(true);
  expect(items()[2]!.dataset.disabled).toBe("");
  await mousedown(triggers()[2]!);
  expect(states()).toEqual(["active", "inactive", "inactive"]);
});

it("reaches any step when not linear", async () => {
  render({ linear: false });
  expect(root().dataset.linear).toBeUndefined();
  expect(triggers().map((element) => element.tabIndex)).toEqual([0, 0, 0]);
  await userEvent.click(triggers()[2]!);
  expect(states()).toEqual(["completed", "completed", "active"]);
});

it("stays where a controlling parent keeps it", async () => {
  const wrapper = mount(
    defineComponent({
      setup: () => {
        const step = ref(1);
        return () => h(Stepper, { modelValue: step.value }, () => steps.map((step) => item(step)));
      },
    }),
    { attachTo: document.body },
  );
  unmount = () => wrapper.unmount();
  await userEvent.click(triggers()[1]!);
  expect(states()).toEqual(["active", "inactive", "inactive"]);
});

it("starts from default-value", () => {
  render({ defaultValue: 2 });
  expect(states()).toEqual(["completed", "active", "inactive"]);
});

it("marks a completed item and skips a disabled one", async () => {
  render({}, () => [item(steps[0]!), item(steps[1]!, { disabled: true }), item(steps[2]!, { completed: true })]);
  expect(states()).toEqual(["active", "inactive", "completed"]);
  expect(triggers()[1]!.hasAttribute("disabled")).toBe(true);
  expect(items()[1]!.dataset.disabled).toBe("");
  await mousedown(triggers()[1]!);
  expect(states()[1]).toBe("inactive");
});

it("moves focus with the arrow keys and selects with Enter and Space", async () => {
  render({ linear: false });
  triggers()[0]!.focus();
  await userEvent.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(triggers()[1]);
  await userEvent.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(triggers()[2]);
  await userEvent.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(triggers()[2]);
  await userEvent.keyboard("{Enter}");
  expect(states()).toEqual(["completed", "completed", "active"]);
  await userEvent.keyboard("{ArrowLeft}");
  await userEvent.keyboard(" ");
  expect(states()).toEqual(["completed", "active", "inactive"]);
  await userEvent.keyboard("{ArrowDown}");
  expect(document.activeElement).toBe(triggers()[1]);
});

it("skips disabled steps with the arrow keys", async () => {
  render({ linear: false }, () => [item(steps[0]!), item(steps[1]!, { disabled: true }), item(steps[2]!)]);
  triggers()[0]!.focus();
  await userEvent.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(triggers()[2]);
});

it("lays a vertical stepper out as a column with up and down arrows", async () => {
  render({ orientation: "vertical", linear: false });
  expect(root().dataset.orientation).toBe("vertical");
  expect(getComputedStyle(root()).flexDirection).toBe("column");
  expect(items()[0]!.dataset.orientation).toBe("vertical");
  expect(triggers()[0]!.dataset.orientation).toBe("vertical");
  expect(separators()[0]!.dataset.orientation).toBe("vertical");
  triggers()[0]!.focus();
  await userEvent.keyboard("{ArrowDown}");
  expect(document.activeElement).toBe(triggers()[1]);
  await userEvent.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(triggers()[1]);
});

it("draws the indicator and the separator from the item state", async () => {
  render();
  const [active, inactive] = indicators();
  expect(getComputedStyle(active!).backgroundColor).not.toBe(getComputedStyle(inactive!).backgroundColor);
  expect(getComputedStyle(active!).borderRadius).toContain("px");
  expect(inactive!.className).toContain("group-data-[state=active]:bg-tone");
  expect(inactive!.className).toContain("group-data-[state=completed]:bg-accent");
  expect(separators()[0]!.className).toContain("group-data-[state=completed]:bg-accent");
  expect(separators()[0]!.dataset.state).toBe("active");
  await userEvent.click(triggers()[1]!);
  expect(separators()[0]!.dataset.state).toBe("completed");
});

it("sizes the indicator, the separator and the type from the size prop", () => {
  render();
  expect(indicators()[0]!.getBoundingClientRect().width).toBe(32);
  expect(separators()[0]!.getBoundingClientRect().height).toBe(2);
  expect(separators()[0]!.getBoundingClientRect().width).toBeGreaterThan(0);
  const mdTitle = getComputedStyle(q("[data-slot=stepper-title]")).fontSize;
  reset();

  render({ size: "xl" });
  expect(root().dataset.size).toBe("xl");
  expect(indicators()[0]!.getBoundingClientRect().width).toBe(48);
  expect(parseFloat(getComputedStyle(q("[data-slot=stepper-title]")).fontSize)).toBeGreaterThan(parseFloat(mdTitle));
  reset();

  render({ size: "xs" });
  expect(indicators()[0]!.getBoundingClientRect().width).toBe(24);
  expect(separators()[0]!.getBoundingClientRect().height).toBe(1);
});

it("falls back to the step number in the indicator and hands it to the slot", () => {
  render({}, () => [
    item(steps[0]!, {}, () => h(StepperIndicator)),
    item(steps[1]!, {}, () => h(StepperIndicator, ({ step }: { step: number }) => `#${step}`)),
  ]);
  expect(indicators()[0]!.textContent!.trim()).toBe("Step 1");
  expect(indicators()[1]!.textContent).toBe("#2");
});

it("hands the state to the item slot and the navigation to the root slot", async () => {
  render({}, () => [
    h(StepperItem, { step: 1 }, { default: (slot: { state: string }) => h(StepperTrigger, () => `one ${slot.state}`) }),
    h(StepperItem, { step: 2 }, { default: (slot: { state: string }) => h(StepperTrigger, () => `two ${slot.state}`) }),
  ]);
  expect(triggers().map((element) => element.textContent)).toEqual(["one active", "two inactive"]);
  reset();

  const wrapper = mount(
    {
      render: () =>
        h(Stepper, null, {
          default: (slot: { nextStep: () => void; isLastStep: boolean }) => [
            ...steps.map((step) => item(step)),
            h("button", { id: "next", disabled: slot.isLastStep, onClick: slot.nextStep }, "Next"),
          ],
        }),
    },
    { attachTo: document.body },
  );
  unmount = () => wrapper.unmount();
  await userEvent.click(q("#next"));
  await userEvent.click(q("#next"));
  await nextTick();
  expect(states()).toEqual(["completed", "completed", "active"]);
  expect((q("#next") as HTMLButtonElement).disabled).toBe(true);
});

it("merges class onto every part", () => {
  render({ class: "stepper-x" }, () => [
    h(StepperItem, { step: 1, class: "item-x" }, () => [
      h(StepperTrigger, { class: "trigger-x" }, () => [
        h(StepperIndicator, { class: "indicator-x" }),
        h(StepperTitle, { class: "title-x" }, () => "T"),
        h(StepperDescription, { class: "description-x" }, () => "D"),
      ]),
      h(StepperSeparator, { class: "separator-x" }),
    ]),
  ]);
  for (const part of ["stepper", "item", "trigger", "indicator", "title", "description", "separator"]) {
    const slot = part === "stepper" ? "stepper" : `stepper-${part}`;
    expect(q(`[data-slot=${slot}]`).classList.contains(`${part}-x`)).toBe(true);
  }
});
