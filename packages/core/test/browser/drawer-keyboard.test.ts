import { mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";

import { DrawerContent, DrawerRoot } from "../../src/drawer";

class FakeViewport extends EventTarget {
  height = window.innerHeight;
  offsetTop = 0;
}

const original = Object.getOwnPropertyDescriptor(window, "visualViewport");
let fake: FakeViewport;

afterEach(() => {
  if (original) Object.defineProperty(window, "visualViewport", original);
});

const settle = async () => {
  await nextTick();
  await nextTick();
};

it("lifts the panel by the keyboard inset and scrolls the focused field into view", async () => {
  fake = new FakeViewport();
  Object.defineProperty(window, "visualViewport", { value: fake, configurable: true });
  const open = ref(true);
  mount(
    defineComponent({
      setup: () => () =>
        h(DrawerRoot, { open: open.value, "onUpdate:open": (value: boolean) => (open.value = value) }, () =>
          h(DrawerContent, { style: "position: fixed; left: 0; bottom: 0; width: 300px; height: 400px" }, () =>
            h("div", { style: "height: 100px; overflow: auto" }, [
              h("input", { id: "a" }),
              h("div", { style: "height: 300px" }),
              h("input", { id: "b" }),
            ]),
          ),
        ),
    }),
    { attachTo: document.body },
  );
  await settle();
  const panel = document.querySelector<HTMLElement>("[role=dialog]")!;
  const field = document.getElementById("b") as HTMLInputElement;
  const scrolled = vi.spyOn(field, "scrollIntoView").mockImplementation(() => {});
  field.focus();

  fake.height = window.innerHeight - 320;
  fake.dispatchEvent(new Event("resize"));
  await settle();
  expect(panel.style.getPropertyValue("--drawer-keyboard-inset")).toBe("320px");
  expect(scrolled).toHaveBeenCalledWith({ block: "nearest" });

  fake.height = window.innerHeight;
  fake.dispatchEvent(new Event("resize"));
  await settle();
  expect(panel.style.getPropertyValue("--drawer-keyboard-inset")).toBe("0px");

  open.value = false;
  await settle();
  expect(panel.style.getPropertyValue("--drawer-keyboard-inset")).toBe("0px");
});
