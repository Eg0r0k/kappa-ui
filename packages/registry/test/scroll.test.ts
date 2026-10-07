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

const fakeFrames = () => vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });

const record = (host: HTMLElement, frames: number) =>
  Array.from({ length: frames }, () => {
    vi.advanceTimersToNextFrame();
    return host.scrollTop;
  });

afterEach(() => {
  vi.useRealTimers();
  window.scrollTo(0, 0);
});

it("reads the position of an element and of the window", () => {
  const host = mountScroller();
  host.scrollTop = 120;
  host.scrollLeft = 80;
  document.body.style.cssText = "height: 2000px; width: 3000px";
  window.scrollTo(30, 70);

  expect(getVerticalScrollPosition(host)).toBe(120);
  expect(getHorizontalScrollPosition(host)).toBe(80);
  expect(getVerticalScrollPosition(window)).toBe(70);
  expect(getHorizontalScrollPosition(window)).toBe(30);
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

it("does not restart when called again with the same destination", () => {
  const host = mountScroller();
  fakeFrames();

  setVerticalScrollPosition(host, 1000, 300);
  vi.advanceTimersByTime(150);
  expect(host.scrollTop).toBeGreaterThan(0);
  setVerticalScrollPosition(host, 1000, 300);
  vi.advanceTimersByTime(160);

  expect(host.scrollTop).toBe(1000);
});

it("turns around once when the destination reverses", () => {
  const host = mountScroller();
  fakeFrames();

  setVerticalScrollPosition(host, 1000, 400);
  const rising = record(host, 9);
  setVerticalScrollPosition(host, 0, 400);

  const samples = [...rising, ...record(host, 40)];
  const steps = samples
    .slice(1)
    .map((value, index) => Math.sign(value - samples[index]!))
    .filter(Boolean);
  const turns = steps.slice(1).filter((step, index) => step !== steps[index]).length;

  expect(turns).toBe(1);
  expect(host.scrollTop).toBe(0);
});

it("stops where the user takes over with the wheel", () => {
  const host = mountScroller();
  fakeFrames();

  setVerticalScrollPosition(host, 1000, 400);
  vi.advanceTimersByTime(100);
  host.dispatchEvent(new WheelEvent("wheel", { deltaY: 10 }));
  const stoppedAt = host.scrollTop;
  vi.advanceTimersByTime(400);

  expect(stoppedAt).toBeGreaterThan(0);
  expect(host.scrollTop).toBe(stoppedAt);
  expect(host.scrollTop).toBeLessThan(1000);
});

it("lets a jump cancel a running animation", () => {
  const host = mountScroller();
  fakeFrames();

  setVerticalScrollPosition(host, 1000, 300);
  vi.advanceTimersByTime(50);
  setVerticalScrollPosition(host, 100);
  vi.advanceTimersByTime(350);

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
