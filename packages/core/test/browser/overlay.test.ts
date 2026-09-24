import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";

import { OverlayScrim, useModalScrim } from "../../src/overlay";

const harness = (options: { modal?: boolean; forceMount?: boolean } = {}) => {
  const open = ref(false);
  const modal = ref(options.modal ?? true);
  const wrapper = mount(
    defineComponent({
      setup: () => {
        const scrim = useModalScrim({ open, modal, forceMount: () => options.forceMount });
        const { ModalScrimHold } = scrim;
        return () => [
          h(OverlayScrim, { scrim, "data-test": "scrim", "data-probe": "fallthrough" }),
          open.value || options.forceMount ? h("div", { "data-test": "content" }, h(ModalScrimHold)) : null,
        ];
      },
    }),
    { attachTo: document.body },
  );
  return { open, wrapper };
};

const scrim = () => document.querySelector<HTMLElement>("[data-test=scrim]");

const settle = async () => {
  await nextTick();
  await nextTick();
};

afterEach(() => {
  document.body.innerHTML = "";
});

it("renders nothing while the overlay is closed", async () => {
  harness();
  await settle();
  expect(scrim()).toBeNull();
});

it("covers the viewport while a modal overlay is open", async () => {
  const { open } = harness();
  open.value = true;
  await settle();

  const element = scrim()!;
  expect(element.getAttribute("aria-hidden")).toBe("true");
  expect(element.getAttribute("data-probe")).toBe("fallthrough");
  expect(element.style.position).toBe("fixed");
  expect(element.style.inset).toBe("0px");
  expect(element.style.pointerEvents).toBe("auto");
});

it("is left out of a non-modal overlay", async () => {
  const { open } = harness({ modal: false });
  open.value = true;
  await settle();
  expect(scrim()).toBeNull();
});

it("outlives the content until the press that closed it ends", async () => {
  const { open } = harness();
  open.value = true;
  await settle();

  scrim()!.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
  open.value = false;
  await settle();
  expect(scrim()).not.toBeNull();

  window.dispatchEvent(new PointerEvent("pointerup"));
  await new Promise((resolve) => setTimeout(resolve));
  await settle();
  expect(scrim()).toBeNull();
});

it("stays hidden for force-mounted content that is closed", async () => {
  harness({ forceMount: true });
  await settle();
  expect(document.querySelector("[data-test=content]")).not.toBeNull();
  expect(scrim()).toBeNull();
});

it("cancels the context menu on the scrim", async () => {
  const { open } = harness();
  open.value = true;
  await settle();

  const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
  scrim()!.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(true);
});
