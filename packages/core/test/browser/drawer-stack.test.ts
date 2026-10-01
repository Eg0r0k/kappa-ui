import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
import { type VNodeChild, defineComponent, h, nextTick, ref } from "vue";

import { DialogPortal } from "../../src/dialog";
import { DrawerContent, DrawerIndent, DrawerRoot, type DrawerRootProps } from "../../src/drawer";
import { pointer, wait } from "./pointer";

const PANEL = "position: fixed; left: 0; bottom: 0; width: 300px; height: 400px";
const POINTS = ["100px", "200px", "400px"];

const sheet = document.createElement("style");
sheet.textContent = [
  "@keyframes drawer-stack-test-out { to { translate: 0 100% } }",
  "[role=dialog][data-state=closed] { animation: drawer-stack-test-out 50ms forwards }",
  "[role=dialog] { translate: 0 calc(var(--drawer-swipe-movement, 0px) + var(--drawer-snap-offset, 0px)); }",
  "[data-test-page][data-side] { transition: opacity 120ms }",
].join(" ");
document.head.append(sheet);

let unmount: (() => void) | undefined;

afterEach(() => {
  unmount?.();
  unmount = undefined;
  document.body.innerHTML = "";
  document.body.style.cssText = "";
  window.scrollTo(0, 0);
});

interface Layer {
  id: string;
  open?: boolean;
  root?: Partial<DrawerRootProps>;
}

const harness = (layers: Layer[], options: { indent?: boolean; page?: string } = {}) => {
  const opens = layers.map((layer) => ref(layer.open ?? true));
  const shown = ref(true);
  const layer = (index: number): VNodeChild => {
    const current = layers[index];
    if (!current) return null;
    const open = opens[index]!;
    return h(
      DrawerRoot,
      { ...current.root, open: open.value, "onUpdate:open": (value: boolean) => (open.value = value) },
      () =>
        h(DialogPortal, () =>
          h(DrawerContent, { id: current.id, style: PANEL }, () => [
            h("p", { id: `${current.id}-text` }, current.id),
            layer(index + 1),
          ]),
        ),
    );
  };
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        options.indent === false
          ? shown.value
            ? layer(0)
            : null
          : h(DrawerIndent, { id: "page", "data-test-page": "", style: options.page }, () =>
              shown.value ? layer(0) : null,
            ),
    }),
    { attachTo: document.body },
  );
  unmount = () => wrapper.unmount();
  return { opens, shown };
};

const settle = async () => {
  await nextTick();
  await nextTick();
};
const page = () => document.getElementById("page")!;
const pageVariable = (name: string) => page().style.getPropertyValue(name);
const presence = (id: string) =>
  1 - parseFloat(document.getElementById(id)!.style.getPropertyValue("--drawer-swipe-progress"));

const hold = async (id: string, distance: number) => {
  const target = document.getElementById(`${id}-text`)!;
  pointer("pointerdown", target, 150, 100);
  await wait(30);
  pointer("pointermove", target, 150, 100 + distance / 2);
  await wait(30);
  pointer("pointermove", target, 150, 100 + distance);
  await wait(30);
  return () => pointer("pointerup", target, 150, 100 + distance);
};

it("indents the page while a modal drawer is open and keeps its side until the return ends", async () => {
  const { opens } = harness([{ id: "a" }]);
  await expect.poll(() => page().dataset.side).toBe("bottom");
  expect(page().hasAttribute("data-open")).toBe(true);
  expect(pageVariable("--drawer-indent-progress")).toBe("1");
  expect(pageVariable("--drawer-indent-top")).toBe("0px");
  expect(pageVariable("--drawer-indent-bottom")).toBe("0px");
  opens[0]!.value = false;
  await expect.poll(() => page().hasAttribute("data-open")).toBe(false);
  expect(page().dataset.side).toBe("bottom");
  expect(pageVariable("--drawer-indent-progress")).toBe("0");
  await wait(200);
  expect(page().hasAttribute("data-side")).toBe(false);
  expect(pageVariable("--drawer-indent-progress")).toBe("");
});

it("stops indenting at once when the page has no transition", async () => {
  const { opens } = harness([{ id: "a" }], { page: "transition: none" });
  await expect.poll(() => page().dataset.side).toBe("bottom");
  opens[0]!.value = false;
  await settle();
  await wait(30);
  expect(page().hasAttribute("data-side")).toBe(false);
});

it("takes the side of the first drawer", async () => {
  harness([{ id: "a", root: { side: "left" } }]);
  await expect.poll(() => page().dataset.side).toBe("left");
});

it("leaves the page alone for a non-modal drawer", async () => {
  harness([{ id: "a", root: { modal: false } }]);
  await settle();
  await wait(30);
  expect(page().hasAttribute("data-open")).toBe(false);
  expect(page().hasAttribute("data-side")).toBe(false);
});

it("follows a swipe on the drawer and marks the page as swiping", async () => {
  harness([{ id: "a" }]);
  await expect.poll(() => page().dataset.side).toBe("bottom");
  const release = await hold("a", 100);
  expect(page().hasAttribute("data-swiping")).toBe(true);
  expect(presence("a")).toBeLessThan(1);
  expect(parseFloat(pageVariable("--drawer-indent-progress"))).toBeCloseTo(presence("a"), 3);
  release();
  await settle();
  expect(page().hasAttribute("data-swiping")).toBe(false);
});

it("follows the overlay's level with snap points", async () => {
  harness([{ id: "a", root: { snapPoints: POINTS } }]);
  await expect.poll(() => page().dataset.side).toBe("bottom");
  expect(pageVariable("--drawer-indent-progress")).toBe("0");
  unmount?.();
  harness([{ id: "b", root: { snapPoints: POINTS, activeSnapPoint: "400px" } }]);
  await expect.poll(() => pageVariable("--drawer-indent-progress")).toBe("1");
});

it("measures the visible part of a scrolled page when it starts indenting", async () => {
  document.body.style.height = "3000px";
  const { opens } = harness([{ id: "a", open: false }], {
    page: "position: absolute; inset: 0 0 auto 0; height: 3000px",
  });
  await settle();
  window.scrollTo(0, 500);
  opens[0]!.value = true;
  await expect.poll(() => pageVariable("--drawer-indent-top")).toBe("500px");
  expect(pageVariable("--drawer-indent-bottom")).toBe(`${3000 - 500 - window.innerHeight}px`);
});

it("lets the nearest DrawerIndent take the drawers inside it", async () => {
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(DrawerIndent, { id: "outer" }, () =>
          h(DrawerIndent, { id: "inner" }, () =>
            h(DrawerRoot, { open: true }, () => h(DialogPortal, () => h(DrawerContent, { style: PANEL }, () => "x"))),
          ),
        ),
    }),
    { attachTo: document.body },
  );
  unmount = () => wrapper.unmount();
  await expect.poll(() => document.getElementById("inner")!.hasAttribute("data-open")).toBe(true);
  expect(document.getElementById("outer")!.hasAttribute("data-open")).toBe(false);
});

it("lets go of the page when an open drawer unmounts", async () => {
  const { shown } = harness([{ id: "a" }]);
  await expect.poll(() => page().hasAttribute("data-open")).toBe(true);
  shown.value = false;
  await expect.poll(() => page().hasAttribute("data-open")).toBe(false);
});
