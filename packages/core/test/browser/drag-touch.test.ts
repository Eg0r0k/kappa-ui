import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
import { cdp } from "vitest/browser";
import { defineComponent, h, nextTick, ref } from "vue";

import { DrawerContent, DrawerRoot } from "../../src/drawer";
import { pointer, wait } from "./pointer";

afterEach(async () => {
  document.body.innerHTML = "";
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: false });
});

const touch = (type: "touchstart" | "touchmove" | "touchend", target: Element, x: number, y: number) => {
  const point = new Touch({ identifier: 1, target, clientX: x, clientY: y, pageX: x, pageY: y });
  target.dispatchEvent(
    new TouchEvent(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      touches: type === "touchend" ? [] : [point],
      targetTouches: type === "touchend" ? [] : [point],
      changedTouches: [point],
    }),
  );
};

it("drags with a finger on a page whose touch was switched on after it loaded", async () => {
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  expect("ontouchstart" in window).toBe(false);
  const open = ref(true);
  mount(
    defineComponent({
      setup: () => () =>
        h(DrawerRoot, { open: open.value, "onUpdate:open": (value: boolean) => (open.value = value) }, () =>
          h(DrawerContent, { style: "position: fixed; left: 0; bottom: 0; width: 300px; height: 400px" }, () =>
            h(
              "div",
              { id: "body", style: "height: 200px; overflow: auto" },
              h("p", { id: "text", style: "height: 600px" }, "Body"),
            ),
          ),
        ),
    }),
    { attachTo: document.body },
  );
  await nextTick();
  await nextTick();
  const text = document.getElementById("text")!;
  pointer("pointerdown", text, 150, 100, "touch");
  touch("touchstart", text, 150, 100);
  await wait(30);
  touch("touchmove", text, 150, 120);
  text.dispatchEvent(new PointerEvent("pointercancel", { pointerId: 1, pointerType: "touch", bubbles: true }));
  for (const y of [160, 220, 280, 330]) {
    await wait(30);
    touch("touchmove", text, 150, y);
  }
  await nextTick();
  expect(document.querySelector("[role=dialog]")!.hasAttribute("data-swiping")).toBe(true);
  await wait(30);
  touch("touchend", text, 150, 330);
  await nextTick();
  await nextTick();
  expect(open.value).toBe(false);
});
