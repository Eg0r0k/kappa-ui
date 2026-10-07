import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import PageIndicatorDemo from "@/examples/page-indicator/PageIndicatorDemo.vue";

const items = () => [...document.querySelectorAll<HTMLElement>("[data-slot=page-indicator-item]")];
const active = () => items().findIndex((element) => element.dataset.state === "active") + 1;

it("jumps the demo straight to a clicked slide, then follows the gallery again", async () => {
  const wrapper = mount(PageIndicatorDemo, { attachTo: document.body });
  const track = wrapper.element.firstElementChild as HTMLElement;
  const seen: number[] = [];
  const observer = new MutationObserver(() => seen.push(active()));
  observer.observe(wrapper.element, { subtree: true, attributes: true, attributeFilter: ["data-state"] });

  await userEvent.click(items()[4]!);
  await expect.poll(() => Math.round(track.scrollLeft), { timeout: 3000 }).toBe(track.clientWidth * 4);
  observer.disconnect();
  expect([...new Set(seen)]).toEqual([5]);

  track.scrollTo({ left: track.clientWidth });
  await expect.poll(active).toBe(2);
  wrapper.unmount();
});
