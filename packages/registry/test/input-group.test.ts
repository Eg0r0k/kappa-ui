import { mount } from "@vue/test-utils";
import { Search } from "@lucide/vue";
import { describe, expect, it } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";

import { Checkbox } from "@/ui/checkbox";
import { Field, FieldLabel } from "@/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/ui/input-group";

import { controlSizes, overrideControlTokens, px, sentinel } from "./control-tokens";

const colors =
  "--input: rgb(0, 0, 255); --primary: rgb(0, 128, 0); --destructive: rgb(255, 0, 0); --disabled-opacity: 38%";

const render = (props: Record<string, unknown> = {}, children: () => unknown[] = () => [h(InputGroupInput)]) =>
  mount(
    defineComponent(() => () => h(InputGroup, { style: colors, ...props }, children)),
    {
      attachTo: document.body,
    },
  );

const renderInForm = (children: () => unknown[]) =>
  mount(
    defineComponent(
      () => () =>
        h("form", { onSubmit: (event: Event) => event.preventDefault() }, [h(InputGroup, { style: colors }, children)]),
    ),
    { attachTo: document.body },
  );

const group = () => document.querySelector<HTMLElement>("[data-slot=input-group]")!;
const control = () => document.querySelector<HTMLElement>("[data-slot=input-group-control]")!;
const frameColor = () => getComputedStyle(group()).borderTopColor;
const transitionsDone = async () => {
  await nextTick();
  await Promise.all(
    group()
      .getAnimations()
      .map((animation) => animation.finished),
  );
};

describe("InputGroup", () => {
  it("is a group with an outline frame of the medium height, and a frameless control", () => {
    render();
    expect(group().getAttribute("role")).toBe("group");
    expect(group().dataset.variant).toBe("outline");
    expect(group().dataset.size).toBe("md");
    expect(group().offsetHeight).toBe(36);
    expect(getComputedStyle(group()).borderTopColor).toBe("rgb(0, 0, 255)");
    expect(getComputedStyle(control()).borderTopWidth).toBe("0px");
    expect(control().offsetHeight).toBe(34);
  });

  it("takes Input's sizes", () => {
    const heights = (["xs", "sm", "md", "lg", "xl"] as const).map((size) => {
      const wrapper = render({ size });
      const height = group().offsetHeight;
      wrapper.unmount();
      return height;
    });
    expect(heights).toEqual([28, 32, 36, 40, 48]);
  });

  it("sizes the icons in addons and texts with the group", () => {
    const sizes = (["xs", "sm", "md", "lg", "xl"] as const).map((size) => {
      const wrapper = render({ size }, () => [
        h(InputGroupAddon, () => h(Search, { "data-test": "addon-icon" })),
        h(InputGroupInput),
        h(InputGroupAddon, { align: "inline-end" }, () =>
          h(InputGroupText, () => h(Search, { "data-test": "text-icon" })),
        ),
      ]);
      const width = (test: string) => document.querySelector(`[data-test=${test}]`)!.getBoundingClientRect().width;
      const result = [width("addon-icon"), width("text-icon")];
      wrapper.unmount();
      return result;
    });
    expect(sizes).toEqual([
      [14, 14],
      [16, 16],
      [16, 16],
      [20, 20],
      [20, 20],
    ]);
  });

  it("rings the frame when the control has focus, not when a button inside has", async () => {
    render({}, () => [
      h(InputGroupInput),
      h(InputGroupAddon, { align: "inline-end" }, () => h(InputGroupButton, { "aria-label": "Clear" }, () => "x")),
    ]);
    expect(getComputedStyle(group()).boxShadow).toBe("none");
    control().focus();
    await expect.poll(frameColor).toBe("rgb(0, 128, 0)");
    expect(getComputedStyle(group()).boxShadow).not.toBe("none");
    document.querySelector<HTMLElement>("[data-slot=input-group-button]")!.focus();
    await expect.poll(frameColor).toBe("rgb(0, 0, 255)");
  });

  it("turns the frame destructive when the control is invalid", () => {
    render({}, () => [h(InputGroupInput, { "aria-invalid": "true" })]);
    expect(getComputedStyle(group()).borderTopColor).toBe("rgb(255, 0, 0)");
  });

  it("rings the frame for a spinbutton nested in a control and reads its invalid state", async () => {
    render({}, () => [
      h("div", { "data-slot": "input-group-control" }, [
        h("span", { role: "spinbutton", tabindex: 0, contenteditable: "true" }, "12"),
      ]),
    ]);
    document.querySelector<HTMLElement>("[role=spinbutton]")!.focus();
    await expect.poll(frameColor).toBe("rgb(0, 128, 0)");
    document.body.innerHTML = "";

    render({}, () => [h("div", [h("span", { role: "spinbutton", tabindex: 0, "aria-invalid": "true" }, "12")])]);
    expect(getComputedStyle(group()).borderTopColor).toBe("rgb(255, 0, 0)");
  });

  it("fades the frame for a disabled input nested in a control", () => {
    render({}, () => [h("div", [h("input", { disabled: true, tabindex: -1 })])]);
    expect(getComputedStyle(group()).borderTopColor).not.toBe("rgb(0, 0, 255)");
  });

  it("ignores the hidden input of a disabled checkbox in an addon", async () => {
    renderInForm(() => [
      h(InputGroupInput),
      h(InputGroupAddon, () => h(InputGroupText, () => "$")),
      h(InputGroupAddon, { align: "inline-end" }, () => h(Checkbox, { name: "agree", disabled: true })),
    ]);
    await expect.poll(() => document.querySelector("input[type=checkbox]:disabled")).not.toBeNull();
    await transitionsDone();
    expect(getComputedStyle(group()).borderTopColor).toBe("rgb(0, 0, 255)");
    expect(getComputedStyle(document.querySelector("[data-slot=input-group-addon]")!).opacity).toBe("1");
  });

  it("ignores the hidden input of a required checkbox in an addon after a failed submit", async () => {
    renderInForm(() => [
      h(InputGroupInput),
      h(InputGroupAddon, { align: "inline-end" }, () => h(Checkbox, { name: "agree", required: true })),
    ]);
    await nextTick();
    document.querySelector("form")!.requestSubmit();
    await expect.poll(() => document.activeElement!.matches("input[type=checkbox]:user-invalid")).toBe(true);
    await transitionsDone();
    expect(getComputedStyle(group()).borderTopColor).toBe("rgb(0, 0, 255)");
  });

  it("keeps the frame destructive while an invalid control has focus", async () => {
    render({}, () => [h(InputGroupInput, { "aria-invalid": "true" })]);
    control().focus();
    await transitionsDone();
    expect(getComputedStyle(group()).borderTopColor).toBe("rgb(255, 0, 0)");
    document.body.innerHTML = "";

    renderInForm(() => [h(InputGroupInput, { required: true })]);
    document.querySelector("form")!.requestSubmit();
    await expect.poll(() => document.activeElement).toBe(control());
    await transitionsDone();
    expect(getComputedStyle(group()).borderTopColor).toBe("rgb(255, 0, 0)");
  });

  it("orders inline addons around the control and focuses it when an addon is clicked", async () => {
    render({}, () => [
      h(InputGroupInput),
      h(InputGroupAddon, { align: "inline-start" }, () => h(Search)),
      h(InputGroupAddon, { align: "inline-end" }, () => h(InputGroupText, () => "USD")),
    ]);
    const [start, end] = [...document.querySelectorAll<HTMLElement>("[data-slot=input-group-addon]")];
    expect(start!.getBoundingClientRect().right).toBeLessThanOrEqual(control().getBoundingClientRect().left);
    expect(end!.getBoundingClientRect().left).toBeGreaterThanOrEqual(control().getBoundingClientRect().right);
    end!.click();
    await nextTick();
    expect(document.activeElement).toBe(control());
  });

  it("gives a button a radius concentric with the frame", () => {
    render({}, () => [
      h(InputGroupInput),
      h(InputGroupAddon, { align: "inline-end" }, () =>
        h(InputGroupButton, { size: "icon-xs", "aria-label": "Copy" }, () => "c"),
      ),
    ]);
    const button = document.querySelector<HTMLElement>("[data-slot=input-group-button]")!;
    const outer = Number.parseFloat(getComputedStyle(group()).borderTopRightRadius);
    const inset = (group().offsetHeight - button.offsetHeight) / 2;
    expect(button.offsetHeight).toBe(24);
    expect(Number.parseFloat(getComputedStyle(button).borderTopRightRadius)).toBeCloseTo(outer - inset, 1);
    const gap = group().getBoundingClientRect().right - button.getBoundingClientRect().right;
    expect(gap).toBeCloseTo(inset, 0);
  });

  it("stacks block addons and a textarea in a column", () => {
    render({}, () => [
      h(InputGroupTextarea, { rows: 3 }),
      h(InputGroupAddon, { align: "block-end" }, () => h(InputGroupButton, () => "Send")),
    ]);
    expect(getComputedStyle(group()).flexDirection).toBe("column");
    expect(group().offsetHeight).toBeGreaterThan(80);
    expect(control().tagName).toBe("TEXTAREA");
    expect(getComputedStyle(control()).borderTopWidth).toBe("0px");
  });

  it("fades the addons when the control is disabled", () => {
    render({}, () => [h(InputGroupInput, { disabled: true }), h(InputGroupAddon, () => h(Search))]);
    const addon = document.querySelector<HTMLElement>("[data-slot=input-group-addon]")!;
    expect(Number(getComputedStyle(addon).opacity)).toBeLessThan(1);
  });

  it("focuses the first spinbutton of a nested control when an addon is clicked", async () => {
    render({}, () => [
      h(InputGroupAddon, () => h(Search)),
      h("div", { "data-slot": "input-group-control" }, [
        h("span", { role: "spinbutton", tabindex: 0 }, "12"),
        h("span", { role: "spinbutton", tabindex: 0 }, "30"),
      ]),
    ]);
    document.querySelector<HTMLElement>("[data-slot=input-group-addon]")!.click();
    await nextTick();
    expect(document.activeElement).toBe(document.querySelector("[role=spinbutton]"));
  });

  it("fades the addons when a nested input is disabled", () => {
    render({}, () => [h("div", [h("input", { disabled: true, tabindex: -1 })]), h(InputGroupAddon, () => h(Search))]);
    const addon = document.querySelector<HTMLElement>("[data-slot=input-group-addon]")!;
    expect(Number(getComputedStyle(addon).opacity)).toBeLessThan(1);
  });

  it("binds v-model and takes its id from a Field", async () => {
    const value = ref("draft");
    mount(
      defineComponent(
        () => () =>
          h(Field, () => [
            h(FieldLabel, () => "Search"),
            h(InputGroup, () =>
              h(InputGroupInput, {
                modelValue: value.value,
                "onUpdate:modelValue": (next: unknown) => (value.value = next as string),
              }),
            ),
          ]),
      ),
      { attachTo: document.body },
    );
    const input = control() as HTMLInputElement;
    expect(input.value).toBe("draft");
    expect(document.querySelector("label")!.getAttribute("for")).toBe(input.id);
    input.value = "sent";
    input.dispatchEvent(new Event("input"));
    await nextTick();
    expect(value.value).toBe("sent");
  });
});

describe("InputGroup control tokens", () => {
  overrideControlTokens();

  it.each(controlSizes)("%s reads its height token, and its addons the padding and icon tokens", (size) => {
    render({ size }, () => [h(InputGroupAddon, () => h(Search)), h(InputGroupInput, { "aria-label": "Search" })]);
    const addon = document.querySelector<HTMLElement>("[data-slot=input-group-addon]")!;

    expect(px(getComputedStyle(group()).height)).toBe(sentinel.height[size]);
    expect(px(getComputedStyle(addon).paddingInlineStart)).toBe(sentinel.padding[size]);
    expect(addon.querySelector("svg")!.getBoundingClientRect().width).toBe(sentinel.icon[size]);
  });
});
