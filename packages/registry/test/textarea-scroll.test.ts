import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";

import { Textarea } from "@/ui/textarea";

afterEach(() => {
  document.body.innerHTML = "";
});

const lines = (count: number) => Array.from({ length: count }, (_, index) => `Line ${index + 1}`).join("\n");

const settle = async () => {
  await nextTick();
  await nextTick();
  await new Promise(requestAnimationFrame);
};

it("keeps the scroller around it in place while it grows", async () => {
  const text = ref(lines(14));
  const wrapper = mount(
    defineComponent(() => () =>
      h("div", { "data-scroller": "", style: "height: 150px; overflow: auto" }, [
        h(Textarea, {
          modelValue: text.value,
          "onUpdate:modelValue": (next: unknown) => (text.value = next as string),
          autoresize: true,
        }),
      ]),
    ),
    { attachTo: document.body },
  );
  await settle();
  const scroller = wrapper.element as HTMLElement;
  const textarea = wrapper.find("textarea").element;
  scroller.scrollTop = scroller.scrollHeight;
  const bottom = scroller.scrollTop;
  expect(bottom).toBeGreaterThan(100);

  text.value += "\nLine 15";
  await settle();

  expect(scroller.scrollTop).toBeGreaterThanOrEqual(bottom);
  expect(textarea.offsetHeight).toBe(textarea.scrollHeight + 2);
  expect(document.querySelectorAll("textarea")).toHaveLength(1);
});
