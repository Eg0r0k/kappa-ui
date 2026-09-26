import { afterEach, expect, it, vi } from "vitest";

import {
  getHorizontalScrollDestination,
  getHorizontalScrollPosition,
  getVerticalScrollDestination,
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

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const record = (host: HTMLElement, ms: number) =>
  new Promise<number[]>((resolve) => {
    const samples: number[] = [];
    const end = performance.now() + ms;
    const sample = () => {
      samples.push(host.scrollTop);
      if (performance.now() < end) requestAnimationFrame(sample);
      else resolve(samples);
    };
    requestAnimationFrame(sample);
  });

afterEach(() => {
  vi.restoreAllMocks();
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

it("animates window scrolling vertically", async () => {
  document.body.style.height = "2000px";

  setVerticalScrollPosition(window, 500, 200);
  expect(window.scrollY).toBe(0);

  await vi.waitFor(() => expect(window.scrollY).toBeGreaterThan(0));
  await vi.waitFor(() => expect(window.scrollY).toBe(500), { timeout: 2000 });
});

it("does not restart when called again with the same destination", async () => {
  const host = mountScroller();
  const start = performance.now();

  setVerticalScrollPosition(host, 1000, 300);
  await wait(150);
  setVerticalScrollPosition(host, 1000, 300);

  await vi.waitFor(() => expect(host.scrollTop).toBe(1000), { timeout: 1000, interval: 5 });
  expect(performance.now() - start).toBeLessThan(400);
});

it("turns around once when the destination reverses", async () => {
  const host = mountScroller();

  setVerticalScrollPosition(host, 1000, 400);
  await wait(150);
  setVerticalScrollPosition(host, 0, 400);

  const samples = await record(host, 600);
  const steps = samples
    .slice(1)
    .map((value, index) => Math.sign(value - samples[index]!))
    .filter(Boolean);
  const turns = steps.slice(1).filter((step, index) => step !== steps[index]).length;

  expect(turns).toBeLessThanOrEqual(1);
  await vi.waitFor(() => expect(host.scrollTop).toBe(0), { timeout: 1000 });
});

it("stops where the user takes over with the wheel", async () => {
  const host = mountScroller();

  setVerticalScrollPosition(host, 1000, 400);
  await wait(100);
  host.dispatchEvent(new WheelEvent("wheel", { deltaY: 10 }));
  const stoppedAt = host.scrollTop;
  await wait(400);

  expect(host.scrollTop).toBe(stoppedAt);
  expect(host.scrollTop).toBeLessThan(1000);
});

it("lets a jump cancel a running animation", async () => {
  const host = mountScroller();

  setVerticalScrollPosition(host, 1000, 300);
  await wait(50);
  setVerticalScrollPosition(host, 100);
  await wait(350);

  expect(host.scrollTop).toBe(100);
});

it("jumps at once when the user prefers reduced motion", () => {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) => ({ matches: query.includes("reduce"), media: query }) as MediaQueryList,
  );
  const host = mountScroller();

  setVerticalScrollPosition(host, 500, 300);

  expect(host.scrollTop).toBe(500);
});

it("reports where a running animation is heading", async () => {
  const host = mountScroller();
  host.scrollLeft = 50;

  expect(getHorizontalScrollDestination(host)).toBe(50);
  setHorizontalScrollPosition(host, 800, 300);
  expect(getHorizontalScrollDestination(host)).toBe(800);
  setVerticalScrollPosition(host, 600, 300);
  expect(getVerticalScrollDestination(host)).toBe(600);

  await vi.waitFor(() => expect(host.scrollLeft).toBe(800), { timeout: 1000 });
  expect(getHorizontalScrollDestination(host)).toBe(800);
});
