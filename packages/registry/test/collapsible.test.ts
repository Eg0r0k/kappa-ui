import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNode, defineComponent, h, nextTick, ref } from "vue";

import { Button } from "@/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/ui/collapsible";

let unmount: (() => void) | undefined;

afterEach(() => {
  unmount?.();
  unmount = undefined;
});

const render = (
  root: Record<string, unknown> = {},
  content: Record<string, unknown> = {},
  trigger: () => VNode = () => h(CollapsibleTrigger, () => "Toggle"),
) => {
  const wrapper = mount(
    {
      render: () => h(Collapsible, root, () => [trigger(), h(CollapsibleContent, content, () => h("p", "Details"))]),
    },
    { attachTo: document.body },
  );
  unmount = () => wrapper.unmount();
  return wrapper;
};

const q = (selector: string) => document.querySelector<HTMLElement>(selector);
const root = () => q("[data-slot=collapsible]")!;
const trigger = () => q("[data-slot=collapsible-trigger]")!;
const content = () => q("[data-slot=collapsible-content]");

it("renders a button trigger wired to the content", () => {
  render();
  expect(root().dataset.state).toBe("closed");
  expect(trigger().tagName).toBe("BUTTON");
  expect(trigger().getAttribute("type")).toBe("button");
  expect(trigger().getAttribute("aria-expanded")).toBe("false");
  expect(content()!.dataset.state).toBe("closed");
});

it("toggles on click and reports through update:open", async () => {
  const updates: unknown[] = [];
  render({ "onUpdate:open": (value: unknown) => updates.push(value) });
  await userEvent.click(trigger());
  expect(root().dataset.state).toBe("open");
  expect(trigger().getAttribute("aria-expanded")).toBe("true");
  expect(trigger().getAttribute("aria-controls")).toBe(content()!.id);
  expect(content()!.dataset.state).toBe("open");
  await userEvent.click(trigger());
  expect(root().dataset.state).toBe("closed");
  expect(updates).toEqual([true, false]);
});

it("animates the height open and closed, clipping only while it moves", async () => {
  render();
  await userEvent.click(trigger());
  expect(getComputedStyle(content()!).animationName).toBe("kappa-collapsible-down");
  expect(getComputedStyle(content()!).overflow).toBe("hidden");
  await expect.poll(() => getComputedStyle(content()!).overflow).toBe("visible");
  await userEvent.click(trigger());
  expect(getComputedStyle(content()!).animationName).toBe("kappa-collapsible-up");
});

it("keeps closed content in the page as hidden until found by default", () => {
  render();
  expect(content()!.getAttribute("hidden")).toBe("until-found");
  expect(content()!.textContent).toBe("Details");
});

it("unmounts closed content with unmount-on-hide, leaving an empty hidden panel", async () => {
  render({ unmountOnHide: true });
  expect(content()!.getAttribute("hidden")).toBe("");
  expect(content()!.textContent).toBe("");
  await userEvent.click(trigger());
  expect(content()!.hasAttribute("hidden")).toBe(false);
  expect(content()!.textContent).toBe("Details");
  await userEvent.click(trigger());
  await expect.poll(() => content()!.textContent).toBe("");
  expect(content()!.getAttribute("hidden")).toBe("");
});

it("keeps closed content mounted and shown with force-mount", () => {
  render({ unmountOnHide: true }, { forceMount: true });
  expect(content()!.hasAttribute("hidden")).toBe(false);
  expect(content()!.textContent).toBe("Details");
});

it("disables the trigger", async () => {
  render({ disabled: true });
  expect(trigger().hasAttribute("disabled")).toBe(true);
  expect(trigger().dataset.disabled).toBe("");
  expect(content()!.dataset.disabled).toBe("");
  trigger().click();
  await nextTick();
  expect(root().dataset.state).toBe("closed");
});

it("stays where a controlling parent keeps it", async () => {
  const wrapper = mount(
    defineComponent({
      setup: () => {
        const open = ref(false);
        return () =>
          h(Collapsible, { open: open.value }, () => [
            h(CollapsibleTrigger, () => "Toggle"),
            h(CollapsibleContent, () => "Details"),
          ]);
      },
    }),
    { attachTo: document.body },
  );
  unmount = () => wrapper.unmount();
  await userEvent.click(trigger());
  expect(root().dataset.state).toBe("closed");
});

it("starts open from default-open without animating", async () => {
  render({ defaultOpen: true });
  await expect.poll(() => content()!.dataset.state).toBe("open");
  expect(root().dataset.state).toBe("open");
  expect(content()!.getAttribute("hidden")).toBeNull();
  expect(getComputedStyle(content()!).animationName).toBe("none");
});

it("puts its state on a child button with as-child", async () => {
  render({}, {}, () => h(CollapsibleTrigger, { asChild: true }, () => h(Button, { variant: "outline" }, () => "More")));
  const button = trigger();
  expect(button.tagName).toBe("BUTTON");
  expect(button.dataset.variant).toBe("outline");
  expect(button.getAttribute("aria-expanded")).toBe("false");
  await userEvent.click(button);
  expect(button.dataset.state).toBe("open");
});
