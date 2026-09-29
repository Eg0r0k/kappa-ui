import { provideOverlayPortalTarget } from "@kappa-ui/core/overlay";
import { type VueWrapper, mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNodeChild, defineComponent, h, nextTick, ref, withDirectives } from "vue";

import { Button } from "@/ui/button";
import { Kbd } from "@/ui/kbd";
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger, vTooltip } from "@/ui/tooltip";

const mounted: VueWrapper[] = [];

afterEach(() => {
  for (const wrapper of mounted.splice(0)) wrapper.unmount();
  document.body.innerHTML = "";
});

const render = (children: () => VNodeChild, provider: Record<string, unknown> = { delay: 0 }) => {
  const target = ref<HTMLElement>();
  const wrapper = mount(
    defineComponent({
      setup: () => {
        provideOverlayPortalTarget(target);
        return () => [h(TooltipProvider, provider, children), h("div", { ref: target, "data-test": "portal" })];
      },
    }),
    { attachTo: document.body },
  );
  mounted.push(wrapper);
};

const tip = (name: string, content: () => VNodeChild = () => `${name} tip`, props: Record<string, unknown> = {}) =>
  h(Tooltip, props, () => [
    h(TooltipTrigger, { "data-test": `${name}-trigger` }, () => name),
    h(TooltipContent, { "data-test": `${name}-content` }, content),
  ]);

const trigger = (name: string) => document.querySelector<HTMLElement>(`[data-test=${name}-trigger]`)!;
const content = (name: string) => document.querySelector<HTMLElement>(`[data-test=${name}-content]`);

const pointer = (type: string, target: Element, init: PointerEventInit = {}) =>
  target.dispatchEvent(
    new PointerEvent(type, { bubbles: type !== "pointerleave", pointerType: "mouse", isPrimary: true, ...init }),
  );

it("draws the tooltip in the overlay portal target and merges the class", async () => {
  render(() =>
    h(Tooltip, { defaultOpen: true }, () => [
      h(TooltipTrigger, () => "Save"),
      h(TooltipContent, { class: "max-w-40" }, () => "Save the file"),
    ]),
  );
  await expect.poll(() => document.querySelector("[data-test=portal] [data-slot=tooltip-content]")).not.toBeNull();
  const panel = document.querySelector<HTMLElement>("[data-slot=tooltip-content]")!;
  expect(panel.className).toContain("bg-foreground");
  expect(panel.className).toContain("max-w-40");
  expect(panel.className).not.toContain("max-w-xs");
  expect(document.querySelector("[data-slot=tooltip-trigger]")?.tagName).toBe("BUTTON");
});

it("animates a delayed open, not an instant one, and cuts the exit when a sibling opens", async () => {
  render(() => [tip("a"), tip("b")]);
  pointer("pointermove", trigger("a"));
  await expect.poll(() => content("a")?.dataset.state).toBe("delayed-open");
  expect(getComputedStyle(content("a")!).animationName).toBe("kappa-overlay-in");
  await Promise.all(
    content("a")!
      .getAnimations()
      .map((animation) => animation.finished),
  );
  const leaving = new Promise((resolve) => content("a")!.addEventListener("leave", resolve, { once: true }));
  pointer("pointerleave", trigger("a"));
  await leaving;
  pointer("pointermove", trigger("b"));
  await nextTick();
  expect(content("a")?.dataset.instant).toBe("sibling");
  await expect.poll(() => content("b")?.dataset.state).toBe("instant-open");
  expect(getComputedStyle(content("b")!).animationName).toBe("none");
  await expect.poll(() => content("a"), { timeout: 60 }).toBeNull();
});

it("leaves no closing tooltip behind when a real pointer moves to the next trigger", async () => {
  render(() => [tip("a"), tip("b")]);
  await userEvent.hover(trigger("a"));
  await expect.poll(() => content("a")?.dataset.state).toBe("delayed-open");
  await Promise.all(
    content("a")!
      .getAnimations()
      .map((animation) => animation.finished),
  );
  await userEvent.hover(trigger("b"));
  await expect.poll(() => content("b")?.dataset.state).toBe("instant-open");
  await expect.poll(() => content("a"), { timeout: 300 }).toBeNull();
});

it("draws a tooltip opened by touch larger", async () => {
  render(() => tip("a"), { delay: 0, touchDelay: 0 });
  pointer("pointerdown", trigger("a"), { pointerType: "touch", buttons: 1 });
  await expect.poll(() => content("a")?.dataset.touch).toBe("");
  expect(getComputedStyle(content("a")!).paddingLeft).toBe("16px");
  pointer("pointerup", trigger("a"), { pointerType: "touch" });
});

it("draws an arrow part", async () => {
  render(() => tip("a", () => ["Tip", h(TooltipArrow)], { defaultOpen: true }));
  await expect.poll(() => document.querySelector("[data-slot=tooltip-arrow]")).not.toBeNull();
  expect(document.querySelector("[data-slot=tooltip-arrow]")?.tagName.toLowerCase()).toBe("svg");
});

it("colours a Kbd in a tooltip like the tooltip's text", async () => {
  render(() => tip("a", () => ["Save ", h(Kbd, () => "S")], { defaultOpen: true }));
  await expect.poll(() => content("a")).not.toBeNull();
  const kbd = content("a")!.querySelector<HTMLElement>("[data-slot=kbd]")!;
  expect(getComputedStyle(kbd).color).toBe(getComputedStyle(content("a")!).color);
});

it("opens on an aria-disabled Button whose click stays swallowed", async () => {
  const onClick = vi.fn();
  render(() =>
    h(Tooltip, null, () => [
      h(TooltipTrigger, { asChild: true }, () => h(Button, { "aria-disabled": "true", onClick }, () => "Publish")),
      h(TooltipContent, { "data-test": "a-content" }, () => "Add a title first"),
    ]),
  );
  const button = document.querySelector<HTMLElement>("button")!;
  await userEvent.hover(button);
  await expect.poll(() => content("a")).not.toBeNull();
  button.click();
  expect(onClick).not.toHaveBeenCalled();
});

it("draws v-tooltip with the registry's content", async () => {
  render(() => withDirectives(h("button", { "data-test": "a-trigger" }, "Save"), [[vTooltip, "Save file"]]));
  await nextTick();
  pointer("pointermove", trigger("a"));
  await expect.poll(() => document.querySelector("[data-test=portal] [data-slot=tooltip-content]")).not.toBeNull();
  const panel = document.querySelector<HTMLElement>("[data-slot=tooltip-content]")!;
  expect(panel.className).toContain("bg-foreground");
  expect(panel.textContent).toContain("Save file");
});
