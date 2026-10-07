import { afterEach, describe, expect, it, vi } from "vitest";
import { type App, type PropType, createApp, defineComponent, h, nextTick } from "vue";

import {
  type ToastManager,
  ToastProvider,
  ToastRecordRoot,
  ToastViewport,
  createToaster,
  provideToaster,
  useToast,
  useToastGroup,
  useToastStack,
} from "../../src/toast";

const style = document.createElement("style");
style.textContent = `
  @keyframes probe-toast-out { to { opacity: 0 } }
  li[data-state="closed"] { animation: probe-toast-out 200ms linear; }
`;
document.head.append(style);

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Content = { title?: string; height?: number };

const Harness = defineComponent({
  props: {
    group: { type: String, default: undefined },
    max: { type: Number, default: 5 },
    duration: { type: Number, default: 60_000 },
  },
  setup(props) {
    const { toasts } = useToastGroup<Content>(
      () => props.group,
      () => props.max,
    );
    const stack = useToastStack(toasts);
    return () =>
      h(ToastProvider, { duration: props.duration }, () => [
        ...toasts.value.map((toast) =>
          h(
            ToastRecordRoot,
            {
              key: toast.id,
              toast,
              "data-id": toast.id,
              "data-index": stack.layout.value.get(toast.id)?.index,
              "data-offset": stack.layout.value.get(toast.id)?.offset,
              "data-height": stack.layout.value.get(toast.id)?.height,
            },
            () =>
              h("div", { ref: stack.measure(toast.id), style: { height: `${toast.height ?? 40}px` } }, [
                toast.title,
                h("button", { "data-close": toast.id }, "x"),
              ]),
          ),
        ),
        h(ToastViewport),
      ]);
  },
});

let apps: App[] = [];

const mount = (props: Record<string, unknown> = {}) => {
  const toaster = createToaster<Content>();
  const host = document.createElement("div");
  document.body.append(host);
  const app = createApp({ render: () => h(Harness, props) });
  app.use(toaster);
  app.mount(host);
  apps.push(app);
  return toaster;
};

const item = (id: string) => document.querySelector<HTMLElement>(`li[data-id="${id}"]`);

const escape = (target: EventTarget) => {
  const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
};

const timers = () => vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });

afterEach(() => {
  vi.useRealTimers();
  apps.forEach((app) => app.unmount());
  apps = [];
  document.body.replaceChildren();
});

describe("ToastRecordRoot", () => {
  it("drops the record once the exit animation ends", async () => {
    const toaster = mount();
    const id = toaster.add({ title: "Saved" });
    await nextTick();
    toaster.remove(id);
    await nextTick();
    expect(item(id)?.dataset.state).toBe("closed");
    expect(toaster.toasts.value).toHaveLength(1);
    await expect.poll(() => item(id)).toBeNull();
    expect(toaster.toasts.value).toEqual([]);
  });

  it("keeps a toast added again during its exit", async () => {
    const toaster = mount();
    const id = toaster.add({ id: "copy", title: "Copied" });
    await nextTick();
    toaster.remove(id);
    await nextTick();
    await item(id)!.getAnimations()[0]!.ready;
    toaster.add({ id: "copy", title: "Copied again" });
    await nextTick();
    expect(item(id)?.dataset.state).toBe("open");
    await wait(400);
    expect(item(id)?.dataset.state).toBe("open");
    expect(item(id)?.textContent).toContain("Copied again");
    expect(toaster.toasts.value).toHaveLength(1);
  });

  it("closes on its own timer and drops afterwards", async () => {
    timers();
    const toaster = mount({ duration: 150 });
    const id = toaster.add({ title: "Brief" });
    await vi.advanceTimersByTimeAsync(149);
    expect(item(id)?.dataset.state).toBe("open");
    await vi.advanceTimersByTimeAsync(1);
    expect(item(id)?.dataset.state).toBe("closed");
    await expect.poll(() => toaster.toasts.value).toEqual([]);
  });

  it("stays open while loading past the timer it had", async () => {
    timers();
    const toaster = mount({ duration: 300 });
    const id = toaster.add({ title: "Upload" });
    await vi.advanceTimersByTimeAsync(100);
    toaster.update(id, { title: "Uploading", loading: true });
    await vi.advanceTimersByTimeAsync(400);
    expect(item(id)?.dataset.state).toBe("open");
    toaster.update(id, { title: "Uploaded", loading: false });
    await vi.advanceTimersByTimeAsync(299);
    expect(item(id)?.dataset.state).toBe("open");
    await vi.advanceTimersByTimeAsync(1);
    expect(item(id)?.dataset.state).toBe("closed");
    await expect.poll(() => toaster.toasts.value).toEqual([]);
  });

  it("restarts the timer when an update changes the duration", async () => {
    timers();
    const toaster = mount();
    const id = toaster.add({ title: "Draft", duration: 300 });
    await vi.advanceTimersByTimeAsync(200);
    toaster.update(id, { duration: 500 });
    await vi.advanceTimersByTimeAsync(499);
    expect(item(id)?.dataset.state).toBe("open");
    await vi.advanceTimersByTimeAsync(1);
    expect(item(id)?.dataset.state).toBe("closed");
    await expect.poll(() => toaster.toasts.value).toEqual([]);
  });

  it("keeps the timer running when an update leaves the duration alone", async () => {
    timers();
    const toaster = mount();
    const id = toaster.add({ title: "Draft", duration: 300 });
    await vi.advanceTimersByTimeAsync(200);
    toaster.update(id, { title: "Draft saved" });
    await vi.advanceTimersByTimeAsync(99);
    expect(item(id)?.dataset.state).toBe("open");
    await vi.advanceTimersByTimeAsync(1);
    expect(item(id)?.dataset.state).toBe("closed");
  });

  it("ignores Escape pressed outside the toasts", async () => {
    const toaster = mount();
    toaster.add({ title: "One" });
    toaster.add({ title: "Two" });
    await nextTick();
    const event = escape(document.body);
    await nextTick();
    expect(toaster.toasts.value.map((toast) => toast.open)).toEqual([true, true]);
    expect(event.defaultPrevented).toBe(false);
  });

  it("closes only the toast that Escape was pressed in", async () => {
    const toaster = mount();
    const first = toaster.add({ title: "One" });
    const second = toaster.add({ title: "Two" });
    await nextTick();
    const button = document.querySelector<HTMLButtonElement>(`[data-close="${second}"]`)!;
    button.focus();
    escape(button);
    await nextTick();
    expect(toaster.toasts.value.map((toast) => [toast.id, toast.open])).toEqual([
      [first, true],
      [second, false],
    ]);
  });
});

describe("useToastGroup", () => {
  it("shows its own group only and closes the oldest beyond max", async () => {
    const toaster = mount({ group: "uploads", max: 2 });
    toaster.add({ id: "elsewhere", title: "Elsewhere" });
    toaster.add({ id: "a", group: "uploads" });
    toaster.add({ id: "b", group: "uploads" });
    toaster.add({ id: "c", group: "uploads" });
    await nextTick();
    expect(item("elsewhere")).toBeNull();
    expect(toaster.toasts.value.map((toast) => [toast.id, toast.open])).toEqual([
      ["elsewhere", true],
      ["a", false],
      ["b", true],
      ["c", true],
    ]);
  });
});

describe("useToastStack", () => {
  it("indexes open toasts from the newest and offsets them by newer heights", async () => {
    const toaster = mount();
    toaster.add({ id: "old", height: 40 });
    toaster.add({ id: "mid", height: 50 });
    toaster.add({ id: "new", height: 60 });
    const read = () =>
      ["old", "mid", "new"].map((id) => {
        const data = item(id)?.dataset;
        return [id, Number(data?.index), Number(data?.offset), Number(data?.height)];
      });
    await expect.poll(read).toEqual([
      ["old", 2, 110, 40],
      ["mid", 1, 60, 50],
      ["new", 0, 0, 60],
    ]);
    toaster.remove("new");
    await expect.poll(read).toEqual([
      ["old", 1, 50, 40],
      ["mid", 0, 0, 50],
      ["new", 0, 0, 60],
    ]);
  });

  it("reports the front and total heights", async () => {
    let stack: ReturnType<typeof useToastStack> | undefined;
    const toaster = createToaster<Content>();
    const Probe = defineComponent({
      props: { manager: { type: Object as PropType<ToastManager<Content>>, required: true } },
      setup() {
        const { toasts } = useToastGroup<Content>(undefined, 5);
        stack = useToastStack(toasts);
        return () =>
          h(ToastProvider, null, () => [
            ...toasts.value.map((toast) =>
              h(ToastRecordRoot, { key: toast.id, toast }, () =>
                h("div", { ref: stack!.measure(toast.id), style: { height: `${toast.height}px` } }),
              ),
            ),
            h(ToastViewport),
          ]);
      },
    });
    const app = createApp({ render: () => h(Probe, { manager: toaster }) });
    app.use(toaster);
    app.mount(document.body.appendChild(document.createElement("div")));
    apps.push(app);
    toaster.add({ height: 30 });
    toaster.add({ height: 70 });
    await expect.poll(() => [stack!.front.value, stack!.total.value, stack!.count.value]).toEqual([70, 100, 2]);
  });
});

describe("provideToaster", () => {
  it("scopes a manager to a subtree", () => {
    const outer = createToaster();
    const inner = createToaster();
    let found: unknown;
    const Child = defineComponent(() => {
      found = useToast();
      return () => null;
    });
    const Scope = defineComponent(() => {
      provideToaster(inner);
      return () => h(Child);
    });
    const app = createApp({ render: () => h(Scope) });
    app.use(outer);
    app.mount(document.body.appendChild(document.createElement("div")));
    apps.push(app);
    expect(found).toBe(inner);
  });
});
