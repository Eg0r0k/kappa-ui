import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNodeChild, defineComponent, h, nextTick, ref } from "vue";

import { Button } from "@/ui/button";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerSwipeArea,
  DrawerTitle,
  DrawerTrigger,
} from "@/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import { drag } from "./pointer";

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
  expect(slot("drawer-header")!.hasAttribute("data-drawer-drag")).toBe(true);
  expect(slot("drawer-swipe-area")).toBeNull();
});

it("shows the swipe area only while closed", async () => {
  const open = render();
  await settle();
  open.value = false;
  await settle();
  await new Promise((resolve) => setTimeout(resolve, 300));
  expect(slot("drawer-swipe-area")).not.toBeNull();
  expect(slot("drawer-swipe-area")!.classList.contains("bottom-0")).toBe(true);
});

it("takes its side classes from the root and hides the handle on the sides", async () => {
  render({ side: "left" });
  await settle();
  expect(slot("drawer-content")!.dataset.side).toBe("left");
  expect(slot("drawer-content")!.classList.contains("left-0")).toBe(true);
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
