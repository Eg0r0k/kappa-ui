import { mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, type Ref, ref, shallowRef } from "vue";

import {
  type InfiniteDirection,
  type InfiniteScrollTarget,
  ScrollArea,
  useInfiniteScroll,
  type UseInfiniteScrollReturn,
} from "@/ui/scroll-area";

type Call = { direction: InfiniteDirection; index: number };

type Options = {
  first?: number;
  last?: number;
  size?: number;
  directions?: InfiniteDirection[];
  horizontal?: boolean;
  container?: "div" | "none" | "scroll-area" | "hidden";
  containerSize?: number;
  dir?: "ltr" | "rtl";
  offset?: number;
  debounce?: number;
  initialFill?: boolean;
  disabled?: Ref<boolean>;
  target?: () => InfiniteScrollTarget | null;
  onLoad?: (context: Call, handles: { first: Ref<number>; last: Ref<number> }) => Promise<void | "stop">;
  onError?: (error: unknown, direction: InfiniteDirection) => void;
};

const render = (options: Options = {}) => {
  const first = ref(options.first ?? 0);
  const last = ref(options.last ?? 30);
  const size = options.size ?? 20;
  const calls: Call[] = [];
  const pending: Array<{ resolve: (result?: "stop") => void; reject: (error: unknown) => void }> = [];
  const rootRef = shallowRef<HTMLElement | null>(null);
  let api!: UseInfiniteScrollReturn;

  const Harness = defineComponent({
    setup() {
      api = useInfiniteScroll({
        target: options.target,
        anchor: rootRef,
        directions: options.directions ?? ["bottom"],
        offset: options.offset ?? 50,
        debounce: options.debounce ?? 0,
        initialFill: options.initialFill,
        disabled: options.disabled,
        onError: options.onError,
        onLoad:
          options.onLoad === undefined
            ? (context) => {
                calls.push(context);
                return new Promise((resolve, reject) => pending.push({ resolve, reject }));
              }
            : (context) => options.onLoad!(context, { first, last }),
      });
      return () =>
        h(
          "div",
          { ref: rootRef, style: options.horizontal ? "display: flex; width: max-content" : undefined },
          Array.from({ length: last.value - first.value }, (_, offset) => {
            const index = first.value + offset;
            const box = options.horizontal ? `width: ${size}px; height: 100px` : `width: 100px; height: ${size}px`;
            return h("div", { key: index, style: `flex: none; ${box}` }, String(index));
          }),
        );
    },
  });

  const containerSize = options.containerSize ?? 200;
  const wrap = () => {
    if (options.container === "none") return h(Harness);
    if (options.container === "scroll-area") {
      return h(
        ScrollArea,
        {
          orientation: options.horizontal ? "horizontal" : "vertical",
          style: `height: ${containerSize}px; width: 200px`,
        },
        { default: () => h(Harness) },
      );
    }
    const hidden = options.container === "hidden" ? "display: none;" : "";
    return h(
      "div",
      {
        "data-testid": "scroller",
        dir: options.dir,
        style: `${hidden} width: 200px; height: ${containerSize}px; overflow: auto`,
      },
      [h(Harness)],
    );
  };

  const wrapper = mount({ render: wrap }, { attachTo: document.body });
  const scroller = () =>
    document.querySelector<HTMLElement>("[data-testid=scroller], [data-slot=scroll-area-viewport]") ??
    (document.scrollingElement as HTMLElement);
  const finish = async (result?: "stop") => {
    pending.shift()?.resolve(result);
    await nextTick();
    await nextTick();
  };
  const fail = async (error: unknown) => {
    pending.shift()?.reject(error);
    await nextTick();
    await nextTick();
  };

  return { wrapper, first, last, calls, pending, finish, fail, scroller, api: () => api };
};

const scrollEvents = (el: HTMLElement, count: number) => {
  for (let index = 0; index < count; index++) el.dispatchEvent(new Event("scroll"));
};

const settle = () => new Promise((resolve) => setTimeout(resolve, 50));

afterEach(() => {
  vi.useRealTimers();
  window.scrollTo(0, 0);
});

it("loads once the end comes within offset, and only once while the promise is pending", async () => {
  const { calls, scroller } = render();
  await settle();
  expect(calls).toEqual([]);

  scroller().scrollTop = 400;
  await vi.waitFor(() => expect(calls).toEqual([{ direction: "bottom", index: 1 }]));
  scrollEvents(scroller(), 20);
  await settle();
  expect(calls).toHaveLength(1);
});

it("resumes after the promise settles and the content grew, with the next index", async () => {
  const { calls, last, scroller, finish, api } = render();
  scroller().scrollTop = 400;
  await vi.waitFor(() => expect(calls).toHaveLength(1));
  expect(api().state.value.bottom).toEqual({ index: 1, loading: true, stopped: false });

  last.value = 60;
  await finish();
  expect(api().state.value.bottom.loading).toBe(false);
  expect(calls).toHaveLength(1);

  scroller().scrollTop = 1000;
  await vi.waitFor(() =>
    expect(calls).toEqual([
      { direction: "bottom", index: 1 },
      { direction: "bottom", index: 2 },
    ]),
  );
});

it("stops on 'stop' and resumes on resume()", async () => {
  const { calls, scroller, finish, api } = render();
  scroller().scrollTop = 400;
  await vi.waitFor(() => expect(calls).toHaveLength(1));
  await finish("stop");
  expect(api().state.value.bottom).toEqual({ index: 1, loading: false, stopped: true });

  scrollEvents(scroller(), 5);
  await settle();
  expect(calls).toHaveLength(1);

  api().resume();
  await vi.waitFor(() => expect(calls).toHaveLength(2));
  expect(calls[1]).toEqual({ direction: "bottom", index: 2 });
});

it("fills the viewport at mount, one page at a time", async () => {
  const calls: number[] = [];
  const { api } = render({
    last: 5,
    containerSize: 600,
    onLoad: async ({ index }, { last }) => {
      calls.push(index);
      last.value += 5;
    },
  });
  await vi.waitFor(() => expect(calls).toEqual([1, 2, 3, 4, 5, 6]));
  await settle();
  expect(calls).toHaveLength(6);
  expect(api().state.value.bottom.loading).toBe(false);
});

it("does not keep filling after 'stop'", async () => {
  const calls: number[] = [];
  render({
    last: 5,
    containerSize: 600,
    onLoad: async ({ index }) => {
      calls.push(index);
      return index >= 2 ? "stop" : undefined;
    },
  });
  await vi.waitFor(() => expect(calls).toEqual([1, 2]));
  await settle();
  expect(calls).toEqual([1, 2]);
});

it("does not fill at mount with initialFill false, beyond the first check", async () => {
  const calls: number[] = [];
  render({ last: 5, containerSize: 600, initialFill: false, onLoad: async ({ index }) => void calls.push(index) });
  await settle();
  expect(calls).toEqual([1]);
});

it("keeps the reading position when content is prepended at the top", async () => {
  const disabled = ref(true);
  const { calls, first, scroller, finish } = render({ directions: ["top"], last: 60, disabled });
  scroller().scrollTop = 500;
  disabled.value = false;
  await settle();
  expect(calls).toEqual([]);

  scroller().scrollTop = 30;
  await vi.waitFor(() => expect(calls).toEqual([{ direction: "top", index: 1 }]));

  first.value = -25;
  await finish();
  expect(scroller().scrollTop).toBe(530);
  expect(scroller().style.overflowAnchor).toBe("");
});

it("keeps the position when content is prepended at the start, in ltr and rtl", async () => {
  for (const dir of ["ltr", "rtl"] as const) {
    const disabled = ref(true);
    const { calls, first, scroller, finish, wrapper } = render({
      directions: ["start"],
      horizontal: true,
      last: 60,
      dir,
      disabled,
    });
    const sign = dir === "rtl" ? -1 : 1;
    scroller().scrollLeft = sign * 500;
    disabled.value = false;
    await settle();
    expect(calls).toEqual([]);

    scroller().scrollLeft = sign * 30;
    await vi.waitFor(() => expect(calls).toEqual([{ direction: "start", index: 1 }]));

    first.value = -25;
    await finish();
    expect(scroller().scrollLeft).toBe(sign * 530);
    wrapper.unmount();
  }
});

it("loads at the end in rtl from the visually left edge", async () => {
  const { calls, scroller } = render({ directions: ["end"], horizontal: true, dir: "rtl", last: 60 });
  await settle();
  expect(calls).toEqual([]);
  scroller().scrollLeft = -(60 * 20 - 200);
  await vi.waitFor(() => expect(calls).toEqual([{ direction: "end", index: 1 }]));
});

it("runs top and bottom independently", async () => {
  const { calls, scroller } = render({ directions: ["top", "bottom"] });
  await vi.waitFor(() => expect(calls).toEqual([{ direction: "top", index: 1 }]));
  scroller().scrollTop = 400;
  await vi.waitFor(() =>
    expect(calls).toEqual([
      { direction: "top", index: 1 },
      { direction: "bottom", index: 1 },
    ]),
  );
});

it("uses the window when nothing scrolls above it", async () => {
  const { calls, api } = render({ container: "none", last: 200 });
  expect(api().getTarget()).toBe(window);
  await settle();
  expect(calls).toEqual([]);
  window.scrollTo(0, 200 * 20);
  await vi.waitFor(() => expect(calls).toEqual([{ direction: "bottom", index: 1 }]));
});

it("finds the nearest scrolling ancestor and a ScrollArea's viewport", async () => {
  const plain = render();
  expect(plain.api().getTarget()).toBe(plain.scroller());
  plain.wrapper.unmount();

  const area = render({ container: "scroll-area" });
  expect(area.api().getTarget()).toBe(document.querySelector("[data-slot=scroll-area-viewport]"));
  area.scroller().scrollTop = 400;
  await vi.waitFor(() => expect(area.calls).toHaveLength(1));
});

it("takes an explicit target", async () => {
  const outer = document.body.appendChild(document.createElement("div"));
  outer.style.cssText = "height: 100px; overflow: auto";
  outer.appendChild(document.createElement("div")).style.height = "1000px";
  const { api, calls } = render({ target: () => outer });
  expect(api().getTarget()).toBe(outer);
  outer.scrollTop = 900;
  await vi.waitFor(() => expect(calls).toHaveLength(1));
  outer.remove();
});

it("waits while disabled and polls when enabled", async () => {
  const disabled = ref(true);
  const { calls, scroller, finish } = render({ disabled });
  scroller().scrollTop = 400;
  await settle();
  expect(calls).toEqual([]);

  disabled.value = false;
  await vi.waitFor(() => expect(calls).toHaveLength(1));

  disabled.value = true;
  await finish();
  scrollEvents(scroller(), 3);
  await settle();
  expect(calls).toHaveLength(1);
});

it("stays quiet while the container has no size and polls once it appears", async () => {
  const { calls, scroller } = render({ container: "hidden", last: 5 });
  await settle();
  expect(calls).toEqual([]);
  scroller().style.display = "block";
  await vi.waitFor(() => expect(calls).toEqual([{ direction: "bottom", index: 1 }]));
});

it("ignores a promise that settles after unmount", async () => {
  const { calls, scroller, finish, wrapper, api } = render({ directions: ["top"] });
  await vi.waitFor(() => expect(calls).toHaveLength(1));
  const el = scroller();
  wrapper.unmount();
  await finish();
  expect(api().state.value.top).toEqual({ index: 1, loading: true, stopped: false });
  el.dispatchEvent(new Event("scroll"));
  expect(calls).toHaveLength(1);
});

it("reports no error for a load that fails after unmount", async () => {
  const errors: unknown[] = [];
  const { calls, fail, wrapper, api } = render({ directions: ["top"], onError: (error) => errors.push(error) });
  await vi.waitFor(() => expect(calls).toHaveLength(1));
  wrapper.unmount();
  await fail(new Error("offline"));
  expect(errors).toEqual([]);
  expect(api().state.value.top).toEqual({ index: 1, loading: true, stopped: false });
});

it("rolls the index back on a rejected load and reports the error", async () => {
  const errors: unknown[] = [];
  const { calls, scroller, fail, api } = render({ onError: (error) => errors.push(error) });
  scroller().scrollTop = 400;
  await vi.waitFor(() => expect(calls).toHaveLength(1));
  await fail(new Error("offline"));
  expect(errors).toHaveLength(1);
  expect(api().state.value.bottom).toEqual({ index: 0, loading: false, stopped: false });

  scrollEvents(scroller(), 1);
  await vi.waitFor(() =>
    expect(calls).toEqual([
      { direction: "bottom", index: 1 },
      { direction: "bottom", index: 1 },
    ]),
  );
});

it("exposes trigger, setIndex, stop and reset", async () => {
  const { calls, finish, api } = render({ offset: 0 });
  await settle();
  api().trigger();
  expect(calls).toEqual([{ direction: "bottom", index: 1 }]);
  api().trigger();
  expect(calls).toHaveLength(1);
  await finish();

  api().setIndex("bottom", 5);
  api().trigger();
  expect(calls[1]).toEqual({ direction: "bottom", index: 6 });
  await finish();

  api().stop();
  api().trigger();
  expect(calls).toHaveLength(2);

  api().reset();
  expect(api().state.value.bottom).toEqual({ index: 0, loading: false, stopped: false });
  api().trigger();
  expect(calls[2]).toEqual({ direction: "bottom", index: 1 });
});

it("checks once the scroll events pause for the debounce window", async () => {
  const { calls, scroller } = render({ debounce: 100 });
  await nextTick();
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  const scrolled = new Promise((resolve) => scroller().addEventListener("scroll", resolve, { once: true }));
  scroller().scrollTop = 400;
  await scrolled;
  vi.advanceTimersByTime(50);
  scrollEvents(scroller(), 1);
  vi.advanceTimersByTime(49);
  scrollEvents(scroller(), 1);
  vi.advanceTimersByTime(99);
  expect(calls).toEqual([]);
  vi.advanceTimersByTime(1);
  expect(calls).toEqual([{ direction: "bottom", index: 1 }]);
});

it("falls back to the pixel check when shouldLoad returns undefined", async () => {
  const calls: Call[] = [];
  const rootRef = shallowRef<HTMLElement | null>(null);
  const Harness = defineComponent({
    setup() {
      useInfiniteScroll({
        anchor: rootRef,
        debounce: 0,
        offset: 50,
        shouldLoad: () => undefined,
        onLoad: async (context) => void calls.push(context),
      });
      return () => h("div", { ref: rootRef, style: "height: 2000px" });
    },
  });
  mount(
    { render: () => h("div", { "data-testid": "scroller", style: "height: 200px; overflow: auto" }, [h(Harness)]) },
    { attachTo: document.body },
  );
  const scroller = document.querySelector<HTMLElement>("[data-testid=scroller]")!;
  await settle();
  expect(calls).toEqual([]);
  scroller.scrollTop = 1800;
  scroller.dispatchEvent(new Event("scroll"));
  await vi.waitFor(() => expect(calls).toEqual([{ direction: "bottom", index: 1 }]));
});

it("replaces the pixel check with shouldLoad", async () => {
  let allow = false;
  const calls: Call[] = [];
  const rootRef = shallowRef<HTMLElement | null>(null);
  const Harness = defineComponent({
    setup() {
      useInfiniteScroll({
        anchor: rootRef,
        debounce: 0,
        shouldLoad: () => allow,
        onLoad: async (context) => void calls.push(context),
      });
      return () => h("div", { ref: rootRef, style: "height: 2000px" });
    },
  });
  mount(
    { render: () => h("div", { "data-testid": "scroller", style: "height: 200px; overflow: auto" }, [h(Harness)]) },
    { attachTo: document.body },
  );
  const scroller = document.querySelector<HTMLElement>("[data-testid=scroller]")!;
  scroller.scrollTop = 1800;
  await settle();
  expect(calls).toEqual([]);
  allow = true;
  scroller.dispatchEvent(new Event("scroll"));
  await vi.waitFor(() => expect(calls).toEqual([{ direction: "bottom", index: 1 }]));
});
