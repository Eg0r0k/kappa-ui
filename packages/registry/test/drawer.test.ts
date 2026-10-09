import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNodeChild, defineComponent, h, nextTick, ref } from "vue";

import { Button } from "@/ui/button";
import { DialogHost, createDialogs } from "@/ui/dialog";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerIndent,
  DrawerSwipeArea,
  DrawerTitle,
  DrawerTrigger,
  openDrawer,
  useDialogContext,
} from "@/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import { drag, pointer, wait } from "./pointer";

let unmount: (() => void) | undefined;

afterEach(() => {
  unmount?.();
  unmount = undefined;
  document.documentElement.removeAttribute("dir");
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
// A transition only moves when a rendered frame advances the document timeline. One slow frame after a release
// can take longer than any fixed wait, and the value read then is still the one it started from, so wait for the
// release's own transition to have run before reading where it has got to.
const runningTranslate = async (element: HTMLElement) => {
  const transition = element
    .getAnimations()
    .find(
      (animation): animation is CSSTransition =>
        animation instanceof CSSTransition && animation.transitionProperty === "translate",
    );
  expect(transition).toBeDefined();
  await expect.poll(() => Number(transition!.currentTime ?? 0)).toBeGreaterThan(0);
  return transition!;
};
const animations = (element: HTMLElement) =>
  element
    .getAnimations()
    .map((animation) =>
      animation instanceof CSSTransition
        ? `transition:${animation.transitionProperty}`
        : (animation as CSSAnimation).animationName,
    );
const finished = (element: HTMLElement) =>
  Promise.all(element.getAnimations().map((animation) => animation.finished.catch(() => undefined)));
const closed = () => expect.poll(() => slot("drawer-content")).toBeNull();

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
  expect(getComputedStyle(slot("drawer-content")!).bottom).toBe("0px");
  expect(getComputedStyle(slot("drawer-content")!).touchAction).toBe("pan-x");
  expect(slot("drawer-swipe-area")).not.toBeNull();
});

it("keeps the swipe area rendered on both sides of a close", async () => {
  const open = render();
  await settle();
  expect(getComputedStyle(slot("drawer-swipe-area")!).bottom).toBe("0px");
  open.value = false;
  await closed();
  expect(slot("drawer-swipe-area")).not.toBeNull();
});

it("takes its side classes from the root and hides the handle on the sides", async () => {
  render({ side: "left" });
  await settle();
  expect(slot("drawer-content")!.dataset.side).toBe("left");
  expect(getComputedStyle(slot("drawer-content")!).left).toBe("0px");
  expect(getComputedStyle(slot("drawer-content")!).touchAction).toBe("pan-y");
  expect(slot("drawer-handle")).toBeNull();
});

it.each([
  ["ltr", "left"],
  ["ltr", "right"],
  ["rtl", "left"],
  ["rtl", "right"],
] as const)(
  "in %s, keeps a %s drawer on its screen edge with the corners and handle on its inner edge",
  async (dir, side) => {
    document.documentElement.dir = dir;
    render({ side }, { showHandle: true });
    await settle();
    const content = slot("drawer-content")!;
    await finished(content);
    const panel = content.getBoundingClientRect();
    const handle = slot("drawer-handle")!.getBoundingClientRect();
    const area = slot("drawer-swipe-area")!.getBoundingClientRect();
    const style = getComputedStyle(content);
    const left = [style.borderTopLeftRadius, style.borderBottomLeftRadius];
    const right = [style.borderTopRightRadius, style.borderBottomRightRadius];
    const [inner, outer] = side === "left" ? [right, left] : [left, right];

    // the box fixed elements are placed in: under rtl the page scrollbar moves to the left
    const probe = document.body.appendChild(
      Object.assign(document.createElement("div"), { style: "position:fixed;inset:0" }),
    );
    const viewport = probe.getBoundingClientRect();

    expect(outer).toEqual(["0px", "0px"]);
    for (const radius of inner) expect(parseFloat(radius)).toBeGreaterThan(0);
    if (side === "left") {
      expect(panel.left).toBe(viewport.left);
      expect(panel.right - handle.right).toBeCloseTo(8, 0);
      expect(area.left).toBe(viewport.left);
    } else {
      expect(panel.right).toBe(viewport.right);
      expect(handle.left - panel.left).toBeCloseTo(8, 0);
      expect(area.right).toBe(viewport.right);
    }
  },
);

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
  const option = () =>
    [...document.querySelectorAll<HTMLElement>("[role=option]")].find((item) => item.textContent === "B");
  await expect.poll(option).toBeDefined();
  await userEvent.click(option()!);
  await expect.poll(() => slot("select-trigger")!.textContent).toContain("B");
  await wait(300);
  expect(open.value).toBe(true);
});

it("returns a released drag by its transition instead of replaying the enter animation, and enters again on reopen", async () => {
  const open = render({}, {}, () => h("div", { style: "height: 300px" }));
  await settle();
  const content = slot("drawer-content")!;
  const body = slot("drawer-body")!;
  await finished(content);
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
  expect(open.value).toBe(true);
  expect(animations(content)).not.toContain("kappa-drawer-in-bottom");
  expect(animations(content)).toContain("transition:translate");
  const release = await runningTranslate(content);
  expect(animations(content)).not.toContain("kappa-drawer-in-bottom");
  expect(translateY(content)).toBeLessThan(held);
  await release.finished;
  expect(translateY(content)).toBe(0);

  open.value = false;
  await closed();
  open.value = true;
  await settle();
  expect(animations(slot("drawer-content")!)).toContain("kappa-drawer-in-bottom");
});

it("runs its exit animation when Escape closes it in the middle of a drag", async () => {
  const open = render({}, {}, () => h("div", { style: "height: 300px" }));
  await settle();
  await finished(slot("drawer-content")!);
  const body = slot("drawer-body")!;
  pointer("pointerdown", body, 100, 100);
  for (const y of [115, 125, 135, 145, 160]) {
    await wait(50);
    pointer("pointermove", body, 100, y);
  }
  await wait(50);
  expect(slot("drawer-content")!.hasAttribute("data-swiping")).toBe(true);
  (document.activeElement ?? document.body).dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
  );
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
  await closed();
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
  expect(open.value).toBe(true);
  expect(animations(content)).not.toContain("kappa-drawer-in-bottom");
  expect(animations(content)).toContain("transition:translate");
  const release = await runningTranslate(content);
  expect(animations(content)).not.toContain("kappa-drawer-in-bottom");
  expect(translateY(content)).toBeLessThan(held);
  await release.finished;
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
  await finished(content);
  expect(translateY(content)).toBeCloseTo(280, 0);
  expect(content.hasAttribute("data-expanded")).toBe(false);
  expect(getComputedStyle(body).overflowY).toBe("hidden");

  snap.value = "400px";
  await settle();
  await finished(content);
  expect(translateY(content)).toBe(0);
  expect(content.hasAttribute("data-expanded")).toBe(true);
  expect(getComputedStyle(body).overflowY).toBe("auto");

  snap.value = "120px";
  await settle();
  const back = await runningTranslate(content);
  back.pause();
  back.currentTime = 100;
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
  await expect.poll(() => translateY(content)).toBeCloseTo(280, 0);
  expect(snap.value).toBe("120px");
});

it("scales the page in DrawerIndent behind an open drawer and gives it back after the close", async () => {
  const open = ref(false);
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(DrawerIndent, { class: "bg-red-500" }, () => [
          h("header", { id: "sticky", class: "sticky top-0" }, "Header"),
          h(Drawer, { open: open.value, "onUpdate:open": (value: boolean) => (open.value = value) }, () =>
            h(DrawerContent, () => [h(DrawerTitle, () => "Title"), h(DrawerDescription, () => "Description")]),
          ),
        ]),
    }),
    { attachTo: document.body },
  );
  unmount = () => wrapper.unmount();
  const outer = slot("drawer-indent")!;
  const page = slot("drawer-indent-page")!;
  expect(outer.className).toContain("bg-red-500");
  expect(outer.className).not.toContain("bg-black");
  expect(getComputedStyle(page).scale).toBe("none");
  open.value = true;
  await expect.poll(() => getComputedStyle(page).scale).toBe("0.95");
  expect(getComputedStyle(page).translate).toBe("0px 12px");
  expect(getComputedStyle(page).clipPath).toMatch(/^inset\(/);
  expect(getComputedStyle(page).overflow).toBe("visible");
  expect(getComputedStyle(document.getElementById("sticky")!).position).toBe("sticky");
  expect(page.contains(slot("drawer-content"))).toBe(false);
  expect(document.body.style.background).toBe("");
  open.value = false;
  await expect.poll(() => getComputedStyle(page).scale).toBe("none");
  expect(getComputedStyle(page).clipPath).toBe("none");
  expect(document.body.style.background).toBe("");
});

it("rounds the indented page with the surface radius set on an ancestor", async () => {
  const open = ref(false);
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h("div", { style: "--surface-radius: 4px" }, [
          h(DrawerIndent, () =>
            h(Drawer, { open: open.value, "onUpdate:open": (value: boolean) => (open.value = value) }, () =>
              h(DrawerContent, () => [h(DrawerTitle, () => "Title"), h(DrawerDescription, () => "Description")]),
            ),
          ),
        ]),
    }),
    { attachTo: document.body },
  );
  unmount = () => wrapper.unmount();
  const page = slot("drawer-indent-page")!;
  open.value = true;
  await expect.poll(() => getComputedStyle(page).scale).toBe("0.95");
  expect(getComputedStyle(page).clipPath).toContain("round 5.6px");
});

it("steps a drawer back while a nested one is open", async () => {
  const inner = ref(false);
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(Drawer, { open: true }, () =>
          h(DrawerContent, { id: "parent" }, () => [
            h(DrawerTitle, () => "Parent"),
            h(DrawerDescription, () => "Description"),
            h(Drawer, { open: inner.value, "onUpdate:open": (value: boolean) => (inner.value = value) }, () =>
              h(DrawerContent, { id: "child" }, () => [
                h(DrawerTitle, () => "Child"),
                h(DrawerDescription, () => "Description"),
              ]),
            ),
          ]),
        ),
    }),
    { attachTo: document.body },
  );
  unmount = () => wrapper.unmount();
  const parent = () => document.getElementById("parent")!;
  await expect.poll(() => getComputedStyle(parent()).scale).toBe("1");
  inner.value = true;
  await expect.poll(() => getComputedStyle(parent()).scale).toBe("0.94");
  expect(getComputedStyle(parent()).transform).toBe("matrix(1, 0, 0, 1, 0, -16)");
  expect(parent().hasAttribute("data-nested-open")).toBe(true);
  inner.value = false;
  await expect.poll(() => getComputedStyle(parent()).scale).toBe("1");
});

it("opens a drawer from code through @/ui/drawer and resolves the value it closes with", async () => {
  const Share = defineComponent({
    setup: () => {
      const { close } = useDialogContext<string>();
      return () =>
        h(DrawerContent, () => [
          h(DrawerTitle, () => "Share"),
          h(DrawerDescription, () => "Pick a target."),
          h(Button, { "data-test": "mail", onClick: () => close("Mail") }, () => "Mail"),
        ]);
    },
  });
  const wrapper = mount(defineComponent({ setup: () => () => h(DialogHost) }), {
    attachTo: document.body,
    global: { plugins: [createDialogs()] },
  });
  unmount = () => wrapper.unmount();
  const handle = openDrawer<string>(Share, {}, { side: "right" });
  await expect.poll(() => slot("drawer-content")?.dataset.side).toBe("right");
  await userEvent.click(document.querySelector<HTMLElement>("[data-test=mail]")!);
  expect(await handle).toEqual({ ok: true, value: "Mail" });
});
