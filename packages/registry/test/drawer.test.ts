import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNodeChild, defineComponent, h, nextTick, ref } from "vue";

import { Button } from "@/ui/button";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerSwipeArea,
  DrawerTitle,
  DrawerTrigger,
} from "@/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import { drag, pointer, wait } from "./pointer";

let unmount: (() => void) | undefined;

afterEach(() => {
  unmount?.();
  unmount = undefined;
  document.body.innerHTML = "";
});

const render = (
  root: Record<string, unknown> = {},
  content: Record<string, unknown> = {},
  body: () => VNodeChild = () => h("p", "Body"),
) => {
  const open = ref(true);
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(Drawer, { open: open.value, "onUpdate:open": (value: boolean) => (open.value = value), ...root }, () => [
          h(DrawerTrigger, () => "Open"),
          h(DrawerSwipeArea),
          h(DrawerContent, content, () => [
            h(DrawerHeader, () => [h(DrawerTitle, () => "Title"), h(DrawerDescription, () => "Description")]),
            h(DrawerBody, body),
            h(DrawerFooter, () => h(Button, () => "Done")),
          ]),
        ]),
    }),
    { attachTo: document.body },
  );
  unmount = () => wrapper.unmount();
  return open;
};

const settle = async () => {
  await nextTick();
  await nextTick();
};
const slot = (name: string) => document.querySelector<HTMLElement>(`[data-slot=${name}]`);
const translateY = (element: HTMLElement) => parseFloat(getComputedStyle(element).translate.split(" ")[1] ?? "0") || 0;
const animations = (element: HTMLElement) =>
  element
    .getAnimations()
    .map((animation) =>
      animation instanceof CSSTransition
        ? `transition:${animation.transitionProperty}`
        : (animation as CSSAnimation).animationName,
    );

it("renders every part with its data-slot and the side on the content", async () => {
  render();
  await settle();
  for (const name of [
    "drawer-trigger",
    "drawer-overlay",
    "drawer-content",
    "drawer-handle",
    "drawer-header",
    "drawer-title",
    "drawer-description",
    "drawer-body",
    "drawer-footer",
  ]) {
    expect(slot(name), name).not.toBeNull();
  }
  expect(slot("drawer-content")!.dataset.side).toBe("bottom");
  expect(slot("drawer-content")!.classList.contains("bottom-0")).toBe(true);
  expect(slot("drawer-content")!.classList.contains("touch-pan-x")).toBe(true);
  expect(slot("drawer-swipe-area")).not.toBeNull();
});

it("keeps the swipe area rendered on both sides of a close", async () => {
  const open = render();
  await settle();
  expect(slot("drawer-swipe-area")!.classList.contains("bottom-0")).toBe(true);
  open.value = false;
  await settle();
  await new Promise((resolve) => setTimeout(resolve, 300));
  expect(slot("drawer-swipe-area")).not.toBeNull();
});

it("takes its side classes from the root and hides the handle on the sides", async () => {
  render({ side: "left" });
  await settle();
  expect(slot("drawer-content")!.dataset.side).toBe("left");
  expect(slot("drawer-content")!.classList.contains("left-0")).toBe(true);
  expect(slot("drawer-content")!.classList.contains("touch-pan-y")).toBe(true);
  expect(slot("drawer-handle")).toBeNull();
});

it("lets class replace the background and showHandle/showCloseButton flip the defaults", async () => {
  render({}, { class: "bg-red-500", showHandle: false, showCloseButton: true });
  await settle();
  const content = slot("drawer-content")!;
  expect(content.classList.contains("bg-red-500")).toBe(true);
  expect(content.classList.contains("bg-popover")).toBe(false);
  expect(slot("drawer-handle")).toBeNull();
  expect(slot("drawer-close")).not.toBeNull();
});

it("renders no overlay in a non-modal drawer", async () => {
  render({ modal: false });
  await settle();
  expect(slot("drawer-overlay")).toBeNull();
  expect(slot("drawer-content")).not.toBeNull();
});

it("closes on Escape and on a drag", async () => {
  const open = render();
  await settle();
  await userEvent.keyboard("{Escape}");
  expect(open.value).toBe(false);
  open.value = true;
  await settle();
  await drag(slot("drawer-body")!, [100, 100], [100, 400]);
  await settle();
  expect(open.value).toBe(false);
});

it("keeps a non-dismissible drawer open on Escape and an outside click, and closes it from DrawerClose", async () => {
  const open = render({ dismissible: false }, {}, () => h(DrawerClose, () => "Close"));
  await settle();
  await userEvent.keyboard("{Escape}");
  await settle();
  expect(open.value).toBe(true);
  await userEvent.click(slot("drawer-overlay")!, { position: { x: 5, y: 5 } } as never);
  await settle();
  expect(open.value).toBe(true);
  await userEvent.click(slot("drawer-close")!);
  await settle();
  expect(open.value).toBe(false);
});

it("keeps a Select inside it open and usable", async () => {
  const open = render({}, {}, () =>
    h(Select, { defaultValue: "a" }, () => [
      h(SelectTrigger, () => h(SelectValue)),
      h(SelectContent, () => [h(SelectItem, { value: "a" }, () => "A"), h(SelectItem, { value: "b" }, () => "B")]),
    ]),
  );
  await settle();
  await userEvent.click(slot("select-trigger")!);
  await settle();
  const option = [...document.querySelectorAll<HTMLElement>("[role=option]")].find((item) => item.textContent === "B")!;
  await userEvent.click(option);
  await settle();
  expect(open.value).toBe(true);
  expect(slot("select-trigger")!.textContent).toContain("B");
});

it("returns a released drag by its transition instead of replaying the enter animation, and enters again on reopen", async () => {
  const open = render({}, {}, () => h("div", { style: "height: 300px" }));
  await settle();
  await wait(500);
  const content = slot("drawer-content")!;
  const body = slot("drawer-body")!;
  pointer("pointerdown", body, 100, 100);
  for (const y of [115, 125, 135, 145, 160]) {
    await wait(50);
    pointer("pointermove", body, 100, y);
  }
  await wait(50);
  const held = translateY(content);
  expect(held).toBeCloseTo(50, 0);
  pointer("pointerup", body, 100, 160);
  await settle();
  await wait(30);
  expect(open.value).toBe(true);
  expect(animations(content)).not.toContain("kappa-drawer-in-bottom");
  expect(animations(content)).toContain("transition:translate");
  expect(translateY(content)).toBeLessThan(held);
  await wait(400);
  expect(translateY(content)).toBe(0);

  open.value = false;
  await settle();
  await wait(300);
  open.value = true;
  await settle();
  expect(animations(slot("drawer-content")!)).toContain("kappa-drawer-in-bottom");
});

it("runs its exit animation when Escape closes it in the middle of a drag", async () => {
  const open = render({}, {}, () => h("div", { style: "height: 300px" }));
  await settle();
  await wait(500);
  const body = slot("drawer-body")!;
  pointer("pointerdown", body, 100, 100);
  for (const y of [115, 125, 135, 145, 160]) {
    await wait(50);
    pointer("pointermove", body, 100, y);
  }
  await wait(50);
  expect(slot("drawer-content")!.hasAttribute("data-swiping")).toBe(true);
  await userEvent.keyboard("{Escape}");
  await settle();
  expect(open.value).toBe(false);
  const content = slot("drawer-content")!;
  expect(content.hasAttribute("data-swiping")).toBe(false);
  expect(animations(content)).toContain("kappa-drawer-out-bottom");
});

it("settles a swipe-to-open release by its transition instead of replaying the enter animation", async () => {
  const open = render({}, {}, () => h("div", { style: "height: 300px" }));
  await settle();
  open.value = false;
  await settle();
  await wait(300);
  const area = slot("drawer-swipe-area")!;
  pointer("pointerdown", area, 100, 600);
  for (const y of [580, 560, 540, 520, 500, 480, 460, 440, 420, 400]) {
    await wait(50);
    pointer("pointermove", area, 100, y);
  }
  await wait(50);
  const content = slot("drawer-content")!;
  const held = translateY(content);
  expect(held).toBeGreaterThan(0);
  pointer("pointerup", area, 100, 400);
  await settle();
  await wait(30);
  expect(open.value).toBe(true);
  expect(animations(content)).not.toContain("kappa-drawer-in-bottom");
  expect(animations(content)).toContain("transition:translate");
  expect(translateY(content)).toBeLessThan(held);
  await wait(400);
  expect(translateY(content)).toBe(0);
});

it("plays the enter animation with snap points, lands on the first point and scrolls the body only when expanded", async () => {
  const snap = ref<string | number | null>("120px");
  const open = ref(true);
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          Drawer,
          {
            open: open.value,
            "onUpdate:open": (value: boolean) => (open.value = value),
            snapPoints: ["120px", "400px"],
            activeSnapPoint: snap.value,
            "onUpdate:activeSnapPoint": (value: string | number | null) => (snap.value = value),
          },
          () => [
            h(DrawerContent, { class: "h-[400px]" }, () => [
              h(DrawerHeader, () => [h(DrawerTitle, () => "Title"), h(DrawerDescription, () => "Description")]),
              h(DrawerBody, () => h("div", { style: "height: 900px" })),
            ]),
          ],
        ),
    }),
    { attachTo: document.body },
  );
  unmount = () => wrapper.unmount();
  await settle();
  const content = slot("drawer-content")!;
  const body = slot("drawer-body")!;
  expect(animations(content)).toContain("kappa-drawer-in-bottom");
  await wait(500);
  expect(translateY(content)).toBeCloseTo(280, 0);
  expect(content.hasAttribute("data-expanded")).toBe(false);
  expect(getComputedStyle(body).overflowY).toBe("hidden");

  snap.value = "400px";
  await settle();
  await wait(400);
  expect(translateY(content)).toBe(0);
  expect(content.hasAttribute("data-expanded")).toBe(true);
  expect(getComputedStyle(body).overflowY).toBe("auto");

  snap.value = "120px";
  await settle();
  await wait(100);
  const midway = translateY(content);
  expect(midway).toBeGreaterThan(0);
  expect(midway).toBeLessThan(280);
  const before = translateY(content);
  pointer("pointerdown", body, 100, 100);
  await wait(30);
  pointer("pointermove", body, 100, 85);
  await wait(30);
  const after = translateY(content);
  expect(after).toBeGreaterThan(before - 20);
  expect(after).toBeLessThan(before + 60);
  pointer("pointerup", body, 100, 85);
  await settle();
  await wait(400);
  expect(snap.value).toBe("120px");
  expect(translateY(content)).toBeCloseTo(280, 0);
});
