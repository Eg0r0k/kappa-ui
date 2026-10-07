import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { defineComponent, h } from "vue";

import {
  DialogHost,
  DialogPortal,
  DialogTitle,
  closeAllDialogs,
  createDialogs,
  useDialogContext,
} from "../../src/dialog";
import { DrawerContent, DrawerHandle, DrawerIndent, defineDrawer, openDrawer } from "../../src/drawer";
import { drag, wait } from "./pointer";

const PANEL = "position: fixed; left: 0; bottom: 0; width: 300px; height: 400px";

const sheet = document.createElement("style");
sheet.textContent = [
  "@keyframes drawer-manager-test-out { to { translate: 0 100% } }",
  "[role=dialog][data-state=closed] { animation: drawer-manager-test-out 50ms forwards }",
  "[role=dialog] { translate: 0 calc(var(--drawer-swipe-movement, 0px) + var(--drawer-snap-offset, 0px)); }",
].join(" ");
document.head.append(sheet);

const Panel = defineComponent({
  props: { title: { type: String, default: "Panel" }, busy: Boolean },
  setup: (props) => {
    const { close, loading } = useDialogContext<string>();
    if (props.busy) loading.value = true;
    return () =>
      h(DialogPortal, () =>
        h(DrawerContent, { "data-test": "panel", style: PANEL }, () => [
          h(DrawerHandle, { "data-test": "handle" }),
          h(DialogTitle, () => props.title),
          h("p", { "data-test": "text" }, "Text"),
          h("button", { "data-test": "ok", onClick: () => close("ok") }, "OK"),
        ]),
      );
  },
});

const mountHost = () =>
  mount(defineComponent({ setup: () => () => h(DrawerIndent, { "data-test": "page" }, () => h(DialogHost)) }), {
    attachTo: document.body,
    global: { plugins: [createDialogs()] },
  });

const settle = () => wait(50);
const panels = () => [...document.querySelectorAll<HTMLElement>("[data-test=panel]")];
const page = () => document.querySelector<HTMLElement>("[data-test=page]")!;
const text = () => document.querySelector<HTMLElement>("[data-test=text]")!;

it("opens a component in a drawer with the options given and resolves the value it closes with", async () => {
  mountHost();
  const handle = openDrawer<string>(Panel, { title: "Share" }, { side: "left" });
  await settle();
  expect(panels()[0]!.dataset.side).toBe("left");
  expect(page().hasAttribute("data-open")).toBe(true);
  await userEvent.click(document.querySelector<HTMLElement>("[data-test=ok]")!);
  expect(await handle).toEqual({ ok: true, value: "ok" });
});

it("resolves a swipe that closes it with the reason swipe", async () => {
  mountHost();
  const handle = openDrawer(Panel);
  await settle();
  await drag(text(), [150, 100], [150, 350]);
  expect(await handle).toEqual({ ok: false, reason: "swipe" });
});

it("springs back from a swipe while it is loading", async () => {
  mountHost();
  const handle = openDrawer(Panel, { busy: true });
  await settle();
  await drag(text(), [150, 100], [150, 350]);
  await settle();
  expect(handle.isOpen.value).toBe(true);
  expect(panels()[0]!.style.getPropertyValue("--drawer-swipe-movement")).toBe("0px");
  handle.dismiss();
});

it("keeps a drawer that is not dismissible open on Escape and on a swipe", async () => {
  mountHost();
  const handle = openDrawer(Panel, {}, { dismissible: false });
  await settle();
  await userEvent.keyboard("{Escape}");
  await drag(text(), [150, 100], [150, 350]);
  await settle();
  expect(handle.isOpen.value).toBe(true);
  handle.dismiss();
});

it("defines a drawer once, with its options, and lets its snap points move on their own", async () => {
  mountHost();
  const definition = defineDrawer(Panel, { props: { title: "Places" }, snapPoints: ["100px", "400px"] });
  const handle = definition.open();
  await settle();
  expect(panels()[0]!.style.getPropertyValue("--drawer-snap-offset")).toBe("300px");
  document.querySelector<HTMLElement>("[data-test=handle]")!.click();
  await settle();
  expect(panels()[0]!.style.getPropertyValue("--drawer-snap-offset")).toBe("0px");
  expect(definition.open()).toBe(handle);
  definition.dismiss();
  expect(await handle).toEqual({ ok: false, reason: "programmatic" });
});

it("stacks a drawer opened from code on an open one", async () => {
  mountHost();
  const first = openDrawer(Panel, { title: "First" });
  await settle();
  const second = openDrawer(Panel, { title: "Second" });
  await settle();
  expect(panels().map((panel) => panel.hasAttribute("data-nested-open"))).toEqual([true, false]);
  closeAllDialogs();
  expect(await Promise.all([first, second])).toEqual([
    { ok: false, reason: "close-all" },
    { ok: false, reason: "close-all" },
  ]);
});
