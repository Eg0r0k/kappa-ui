import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
import { h } from "vue";

import { ScrollArea } from "@/ui/scroll-area";

afterEach(() => {
  document.body.innerHTML = "";
});

it("does not re-render the slot on every scroll event once both edges are known", async () => {
  let count = 0;
  const wrapper = mount(
    {
      render: () =>
        h(
          ScrollArea,
          {
            orientation: "vertical",
            style: "height: 100px; width: 200px",
            onVnodeUpdated: () => count++,
          },
          { default: () => h("div", { style: "height: 2000px; width: 200px" }) },
        ),
    },
    { attachTo: document.body },
  );

  const viewport = (wrapper.element as Element).querySelector<HTMLElement>(
    "[data-slot=scroll-area-viewport]",
  )!;

  count = 0;

  for (let top = 100; top <= 1000; top += 100) {
    viewport.scrollTop = top;
    viewport.dispatchEvent(new Event("scroll"));
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  expect(count).toBeLessThanOrEqual(2);

  wrapper.unmount();
});
