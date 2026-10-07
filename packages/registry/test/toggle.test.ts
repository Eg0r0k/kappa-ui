import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
import { type VNode, h, nextTick } from "vue";

import { Button } from "@/ui/button";
import { Toggle } from "@/ui/toggle";

afterEach(() => {
  document.body.innerHTML = "";
});

const render = (nodes: () => VNode[]) => {
  mount({ render: () => h("div", nodes()) }, { attachTo: document.body });
  return [...document.querySelectorAll<HTMLElement>("button")];
};

const visibleShadows = (shadow: string) =>
  shadow === "none"
    ? []
    : shadow
        .split(/,(?![^(]*\))/)
        .map((layer) => layer.trim())
        .filter((layer) => !layer.startsWith("rgba(0, 0, 0, 0)") && !/ 0px 0px 0px 0px/.test(layer));

const look = (element: HTMLElement) => {
  const style = getComputedStyle(element);
  return { background: style.backgroundColor, color: style.color, shadow: visibleShadows(style.boxShadow) };
};

it("is a button that toggles aria-pressed and data-state", async () => {
  const updates: unknown[] = [];
  const [toggle] = render(() => [
    h(Toggle, { "aria-label": "Bold", "onUpdate:modelValue": (value: unknown) => updates.push(value) }, () => "B"),
  ]);
  expect(toggle!.dataset.slot).toBe("toggle");
  expect(toggle!.getAttribute("aria-pressed")).toBe("false");
  expect(toggle!.dataset.state).toBe("off");
  toggle!.click();
  await nextTick();
  expect(toggle!.getAttribute("aria-pressed")).toBe("true");
  expect(toggle!.dataset.state).toBe("on");
  expect(updates).toEqual([true]);
});

it("lets attributes passed in win over its own, so a wrapper can name its data-slot", async () => {
  const [toggle] = render(() => [h(Toggle, { "aria-label": "Bold", "data-slot": "editor-toggle" }, () => "B")]);
  expect(toggle!.dataset.slot).toBe("editor-toggle");
  toggle!.click();
  await nextTick();
  expect(toggle!.dataset.state).toBe("on");
});

it("looks like a ghost neutral button when off and a soft neutral one when on", () => {
  const [off, on, ghost, soft] = render(() => [
    h(Toggle, () => "A"),
    h(Toggle, { defaultValue: true }, () => "A"),
    h(Button, { variant: "ghost", color: "neutral" }, () => "A"),
    h(Button, { variant: "soft", color: "neutral" }, () => "A"),
  ]);
  expect(look(off!)).toEqual(look(ghost!));
  expect(look(on!)).toEqual(look(soft!));
});

it("takes activeVariant and activeColor when on", () => {
  const props = { variant: "outline", activeVariant: "solid", color: "neutral", activeColor: "primary" } as const;
  const [off, on, outline, solid] = render(() => [
    h(Toggle, props, () => "A"),
    h(Toggle, { ...props, defaultValue: true }, () => "A"),
    h(Button, { variant: "outline", color: "neutral" }, () => "A"),
    h(Button, { variant: "solid", color: "primary" }, () => "A"),
  ]);
  expect(on!.dataset.activeColor).toBe("primary");
  expect(look(off!)).toEqual(look(outline!));
  expect(look(on!)).toEqual(look(solid!));
});

it("reads the active colour's text over neutral's", () => {
  const [on, ghost] = render(() => [
    h(Toggle, { variant: "ghost", activeVariant: "ghost", activeColor: "primary", defaultValue: true }, () => "A"),
    h(Button, { variant: "ghost", color: "primary" }, () => "A"),
  ]);
  expect(look(on!).color).toBe(look(ghost!).color);
});

it("keeps the disabled colours while on", () => {
  const [on, disabled] = render(() => [
    h(Toggle, { activeVariant: "solid", color: "primary", defaultValue: true, disabled: true }, () => "A"),
    h(Button, { variant: "solid", color: "primary", disabled: true }, () => "A"),
  ]);
  expect(look(on!)).toEqual(look(disabled!));
});
