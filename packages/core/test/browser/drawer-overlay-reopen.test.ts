import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";

import { DrawerContent, DrawerOverlay, DrawerRoot } from "../../src/drawer";
import { wait } from "./pointer";

it("keeps overlay and panel variables after close and reopen", async () => {
  const open = ref(true);
  mount(
    defineComponent({
      setup: () => () =>
        h(
          DrawerRoot,
          {
            open: open.value,
            "onUpdate:open": (v: boolean) => (open.value = v),
            snapPoints: ["100px", "200px", "400px"],
          },
          () => [
            h(DrawerOverlay, { id: "overlay" }),
            h(DrawerContent, { style: "position: fixed; left: 0; bottom: 0; width: 300px; height: 400px" }, () =>
              h("p", "x"),
            ),
          ],
        ),
    }),
    { attachTo: document.body },
  );
  const read = () => ({
    overlay: document.getElementById("overlay")?.style.getPropertyValue("--drawer-overlay-opacity"),
    movement: document.querySelector<HTMLElement>("[role=dialog]")?.style.getPropertyValue("--drawer-swipe-movement"),
  });
  await nextTick();
  await nextTick();
  expect(read()).toEqual({ overlay: "0", movement: "0px" });
  open.value = false;
  await wait(400);
  expect(document.getElementById("overlay")).toBeNull();
  open.value = true;
  await nextTick();
  await nextTick();
  await nextTick();
  expect(read()).toEqual({ overlay: "0", movement: "0px" });
});
