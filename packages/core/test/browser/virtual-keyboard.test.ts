import { mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import { type Ref, defineComponent, h, nextTick, ref } from "vue";

import { scrollFocusedIntoView, useVirtualKeyboardInset } from "../../src/virtual-keyboard";

class FakeViewport extends EventTarget {
  height = window.innerHeight;
  offsetTop = 0;
}

const original = Object.getOwnPropertyDescriptor(window, "visualViewport");
let fake: FakeViewport;

const install = () => {
  fake = new FakeViewport();
  Object.defineProperty(window, "visualViewport", { value: fake, configurable: true });
};

afterEach(() => {
  if (original) Object.defineProperty(window, "visualViewport", original);
  document.body.innerHTML = "";
});

const host = (active: Ref<boolean>) => {
  let inset!: Ref<number>;
  mount(
    defineComponent({
      setup: () => {
        inset = useVirtualKeyboardInset(active);
        return () => h("div");
      },
    }),
    { attachTo: document.body },
  );
  return inset;
};

it("reports the height the visual viewport lost, counting its offset, only while active", async () => {
  install();
  const active = ref(true);
  const inset = host(active);
  expect(inset.value).toBe(0);
  fake.height = window.innerHeight - 300;
  fake.dispatchEvent(new Event("resize"));
  expect(inset.value).toBe(300);
  fake.offsetTop = 40;
  fake.dispatchEvent(new Event("scroll"));
  expect(inset.value).toBe(260);
  active.value = false;
  await nextTick();
  expect(inset.value).toBe(0);
});

it("stays at zero without a visual viewport", () => {
  Object.defineProperty(window, "visualViewport", { value: null, configurable: true });
  const inset = host(ref(true));
  expect(inset.value).toBe(0);
});

it("scrolls the focused element inside the root into view", () => {
  const root = document.createElement("div");
  root.innerHTML = '<input id="a" /><input id="b" />';
  document.body.append(root);
  const b = root.querySelector<HTMLInputElement>("#b")!;
  const spy = vi.spyOn(b, "scrollIntoView").mockImplementation(() => {});
  b.focus();
  scrollFocusedIntoView(root);
  expect(spy).toHaveBeenCalledWith({ block: "nearest" });
  spy.mockClear();
  scrollFocusedIntoView(document.createElement("div"));
  expect(spy).not.toHaveBeenCalled();
});
