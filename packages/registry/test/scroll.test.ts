import { afterEach, expect, it, vi } from "vitest";

import {
  getHorizontalScrollPosition,
  getVerticalScrollPosition,
  setHorizontalScrollPosition,
  setVerticalScrollPosition,
} from "@/lib/scroll";

const mountScroller = () => {
  const host = document.createElement("div");
  host.style.cssText = "height: 200px; width: 200px; overflow: auto";

  const inner = document.createElement("div");
  inner.style.cssText = "height: 1200px; width: 1200px";

  host.append(inner);
  document.body.append(host);
  return host;
};

afterEach(() => {
  document.body.innerHTML = "";
});

it("reads the position of an element and of the window", () => {
  const host = mountScroller();
  host.scrollTop = 120;
  host.scrollLeft = 80;

  expect(getVerticalScrollPosition(host)).toBe(120);
  expect(getHorizontalScrollPosition(host)).toBe(80);
  expect(getVerticalScrollPosition(window)).toBe(window.scrollY);
  expect(getHorizontalScrollPosition(window)).toBe(window.scrollX);
});

it("jumps when no duration is given", () => {
  const host = mountScroller();

  setVerticalScrollPosition(host, 300);
  expect(host.scrollTop).toBe(300);

  setHorizontalScrollPosition(host, 250);
  expect(host.scrollLeft).toBe(250);
});

it("animates when a duration is given", async () => {
  const host = mountScroller();

  setVerticalScrollPosition(host, 500, 200);
  expect(host.scrollTop).toBe(0);

  await vi.waitFor(() => expect(host.scrollTop).toBeGreaterThan(0));
  await vi.waitFor(() => expect(host.scrollTop).toBe(500), { timeout: 2000 });
});

it("animates horizontally too", async () => {
  const host = mountScroller();

  setHorizontalScrollPosition(host, 400, 200);
  expect(host.scrollLeft).toBe(0);

  await vi.waitFor(() => expect(host.scrollLeft).toBe(400), { timeout: 2000 });
});
