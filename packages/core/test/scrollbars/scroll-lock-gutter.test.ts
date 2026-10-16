import { mount } from "@vue/test-utils";
import { ConfigProvider, DialogPortal, DialogRoot } from "reka-ui";
import { afterEach, expect, it } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";

import { DialogOverlay } from "../../src/dialog";

const html = document.documentElement;

const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));

const harness = (pageHeight: number) => {
  const open = ref(false);
  mount(
    defineComponent({
      setup: () => () => [
        h("header", { "data-test": "header", style: "position: fixed; top: 0; right: 0; width: 100px; height: 20px" }),
        h("main", { "data-test": "content", style: `height: ${pageHeight}px` }),
        h(ConfigProvider, { scrollBody: false }, () =>
          h(DialogRoot, { open: open.value }, () => h(DialogPortal, () => h(DialogOverlay))),
        ),
      ],
    }),
    { attachTo: document.body },
  );
  const layout = () => ({
    content: document.querySelector("[data-test=content]")!.getBoundingClientRect().width,
    header: document.querySelector("[data-test=header]")!.getBoundingClientRect().left,
  });
  const toggle = async (value: boolean) => {
    open.value = value;
    await nextTick();
    await frame();
  };
  return { layout, toggle };
};

afterEach(() => {
  html.style.scrollbarGutter = "";
});

it("keeps the page and its fixed elements in place while an overlay locks a page that scrolls", async () => {
  const { layout, toggle } = harness(3000);
  await frame();
  const before = layout();
  expect(innerWidth - before.content).toBeGreaterThan(0);

  await toggle(true);
  expect(getComputedStyle(document.body).overflow).toBe("hidden");
  expect(html.style.scrollbarGutter).toBe("stable");
  expect(layout()).toEqual(before);

  await toggle(false);
  expect(getComputedStyle(document.body).overflow).not.toBe("hidden");
  expect(html.style.scrollbarGutter).toBe("");
  expect(layout()).toEqual(before);
});

it("reserves nothing on a page too short to scroll", async () => {
  const { layout, toggle } = harness(100);
  await frame();
  const before = layout();
  expect(before.content).toBe(innerWidth);

  await toggle(true);
  expect(getComputedStyle(document.body).overflow).toBe("hidden");
  expect(html.style.scrollbarGutter).toBe("");
  expect(layout()).toEqual(before);
});

it("leaves a gutter the page already reserves alone", async () => {
  html.style.scrollbarGutter = "stable both-edges";
  const { toggle } = harness(3000);
  await frame();

  await toggle(true);
  expect(html.style.scrollbarGutter).toBe("stable both-edges");

  await toggle(false);
  expect(html.style.scrollbarGutter).toBe("stable both-edges");
});
