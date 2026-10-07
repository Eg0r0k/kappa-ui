import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, onTestFinished, vi } from "vitest";
import { userEvent } from "vitest/browser";
import {
  type Component,
  type PropType,
  type VNodeChild,
  defineAsyncComponent,
  defineComponent,
  h,
  inject,
  nextTick,
  onMounted,
  provide,
  ref,
} from "vue";

import {
  DialogClose,
  DialogContent,
  DialogHost,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  closeAllDialogs,
  createDialogs,
  defineDialog,
  openDialog,
  useDialogContext,
} from "../../src/dialog";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const settle = () => wait(50);

const titles = () =>
  [...document.querySelectorAll("[role=dialog]")].map((element) => element.querySelector("h2")?.textContent);
const shown = () =>
  [...document.querySelectorAll<HTMLElement>("[role=dialog]")].map((element) =>
    element.dataset.state === "open" ? element.querySelector("h2")?.textContent : "(closed)",
  );
const overlays = () => [...document.querySelectorAll<HTMLElement>("[data-test=overlay]")];
const pressOutside = async () => {
  await userEvent.click(overlays().at(-1)!, { position: { x: 5, y: 5 } } as never);
  await settle();
};
const composingEscape = () =>
  document.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", isComposing: true, bubbles: true, cancelable: true }),
  );

const Window = defineComponent({
  props: {
    title: { type: String, default: "Window" },
    content: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
    busy: Boolean,
  },
  setup: (props) => {
    const { close, loading } = useDialogContext<string>();
    if (props.busy) loading.value = true;
    return () =>
      h(DialogPortal, () => [
        h(DialogOverlay, { "data-test": "overlay", style: { position: "fixed", inset: "0" } }),
        h(
          DialogContent,
          { "data-test": "window", style: { position: "fixed", top: "40%", left: "40%" }, ...props.content },
          () => [
            h(DialogTitle, () => props.title),
            h("button", { "data-test": "ok", onClick: () => close("ok") }, "OK"),
            h(DialogClose, { "data-test": "close" }, () => "Close"),
          ],
        ),
      ]);
  },
});

const mountHost = (extra?: () => VNodeChild) => {
  const dialogs = createDialogs();
  const wrapper = mount(defineComponent({ setup: () => () => [h(DialogHost), extra?.()] }), {
    attachTo: document.body,
    global: { plugins: [dialogs] },
  });
  return { wrapper, dialogs };
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("DialogHost", () => {
  it("renders an opened dialog and resolves the value it closes with", async () => {
    const { dialogs } = mountHost();
    const handle = openDialog<string>(Window, { title: "Rename" });
    await expect.poll(shown).toEqual(["Rename"]);

    await userEvent.click(document.querySelector<HTMLElement>("[data-test=ok]")!);
    expect(await handle).toEqual({ ok: true, value: "ok" });
    await expect.poll(shown).toEqual([]);
    expect(dialogs.stack.value).toHaveLength(0);
  });

  it("reports Escape, an outside press, DialogClose and dismiss() as their reasons (D1, D2, D12, L2)", async () => {
    mountHost();
    const escaped = openDialog(Window);
    await expect.poll(shown).toEqual(["Window"]);
    await userEvent.keyboard("{Escape}");
    const pressed = openDialog(Window);
    await expect.poll(shown).toEqual(["Window"]);
    await pressOutside();
    const clicked = openDialog(Window);
    await expect.poll(shown).toEqual(["Window"]);
    await userEvent.click(document.querySelector<HTMLElement>("[data-test=close]")!);
    const dismissed = openDialog(Window);
    await expect.poll(shown).toEqual(["Window"]);
    dismissed.dismiss();

    expect(await Promise.all([escaped, pressed, clicked, dismissed])).toEqual([
      { ok: false, reason: "escape" },
      { ok: false, reason: "outside" },
      { ok: false, reason: "close-button" },
      { ok: false, reason: "programmatic" },
    ]);
  });

  it("stays open when the content prevents Escape and outside presses (D6, D7)", async () => {
    mountHost();
    const prevent = (event: Event) => event.preventDefault();
    const handle = openDialog(Window, { content: { onEscapeKeyDown: prevent, onInteractOutside: prevent } });
    await expect.poll(shown).toEqual(["Window"]);
    await userEvent.keyboard("{Escape}");
    await pressOutside();
    expect(handle.isOpen.value).toBe(true);
    handle.dismiss();
  });

  it("ignores Escape while an input method is composing, here and in a declarative dialog (D8)", async () => {
    const open = ref(true);
    mountHost(() =>
      h(DialogRoot, { open: open.value, "onUpdate:open": (value: boolean) => (open.value = value) }, () =>
        h(DialogPortal, () => h(DialogContent, null, () => h(DialogTitle, () => "Declarative"))),
      ),
    );
    await expect.poll(shown).toEqual(["Declarative"]);
    composingEscape();
    await settle();
    expect(open.value).toBe(true);
    await userEvent.keyboard("{Escape}");
    expect(open.value).toBe(false);

    const handle = openDialog(Window);
    await expect.poll(shown).toEqual(["Window"]);
    composingEscape();
    await settle();
    expect(handle.isOpen.value).toBe(true);
    await userEvent.keyboard("{Escape}");
    expect(await handle).toEqual({ ok: false, reason: "escape" });
  });

  it("holds the dialog open while loading, except against code (F4, F5, F6)", async () => {
    mountHost();
    const handle = openDialog(Window, { busy: true });
    await expect.poll(shown).toEqual(["Window"]);
    await userEvent.keyboard("{Escape}");
    await pressOutside();
    await userEvent.click(document.querySelector<HTMLElement>("[data-test=close]")!);
    await settle();
    expect(handle.isOpen.value).toBe(true);

    handle.dismiss();
    expect(await handle).toEqual({ ok: false, reason: "programmatic" });
  });

  it("removes a dialog without an exit animation at once (A2)", async () => {
    const { dialogs } = mountHost();
    const handle = openDialog(Window);
    await expect.poll(shown).toEqual(["Window"]);
    handle.dismiss();
    await flushPromises();
    expect(document.querySelector("[data-test=window]")).toBeNull();
    expect(dialogs.stack.value).toHaveLength(0);
  });

  it("keeps the window in the DOM until its exit animation ends (A1)", async () => {
    const style = document.createElement("style");
    style.textContent =
      "@keyframes dialog-test-out { to { opacity: 0 } } [data-test=window][data-state=closed] { animation: dialog-test-out 300ms forwards }";
    document.head.append(style);
    onTestFinished(() => style.remove());
    const { dialogs } = mountHost();
    const handle = openDialog(Window);
    await expect.poll(shown).toEqual(["Window"]);
    handle.dismiss();
    await nextTick();

    const [exit] = document.querySelector<HTMLElement>("[data-test=window]")!.getAnimations();
    await exit!.ready;
    exit!.currentTime = 290;
    await nextTick();
    expect(document.querySelector("[data-test=window]")).not.toBeNull();
    expect(dialogs.stack.value).toHaveLength(1);
    await expect.poll(() => document.querySelector("[data-test=window]")).toBeNull();
    expect(dialogs.stack.value).toHaveLength(0);
  });

  it("keeps a keepMounted dialog's state and resolves each open on its own (A4, A5)", async () => {
    const Draft = defineComponent({
      setup: () => {
        const { close } = useDialogContext<string>();
        const text = ref("");
        return () =>
          h(DialogPortal, () =>
            h(DialogContent, null, () => [
              h(DialogTitle, () => "Draft"),
              h("input", {
                "data-test": "draft",
                value: text.value,
                onInput: (event: Event) => (text.value = (event.target as HTMLInputElement).value),
              }),
              h("button", { "data-test": "send", onClick: () => close(text.value) }, "Send"),
            ]),
          );
      },
    });
    const { dialogs } = mountHost();
    const draft = defineDialog(Draft, { keepMounted: true });
    const first = draft.open<string>();
    await expect.poll(shown).toEqual(["Draft"]);
    await userEvent.fill(document.querySelector<HTMLElement>("[data-test=draft]")!, "hello");
    await userEvent.keyboard("{Escape}");
    expect(await first).toEqual({ ok: false, reason: "escape" });
    await settle();
    expect(dialogs.stack.value).toHaveLength(1);

    const second = draft.open<string>();
    await expect.poll(shown).toEqual(["Draft"]);
    expect(document.querySelector<HTMLInputElement>("[data-test=draft]")!.value).toBe("hello");
    await userEvent.click(document.querySelector<HTMLElement>("[data-test=send]")!);
    expect(await second).toEqual({ ok: true, value: "hello" });
  });

  it("settles a dialog that closes itself as it mounts (L6)", async () => {
    const Instant = defineComponent({
      setup: () => {
        const { close } = useDialogContext<string>();
        onMounted(() => close("now"));
        return () => h(DialogPortal, () => h(DialogContent, null, () => h(DialogTitle, () => "Instant")));
      },
    });
    const { dialogs } = mountHost();
    const handle = openDialog<string>(Instant);
    expect(await handle).toEqual({ ok: true, value: "now" });
    await expect.poll(shown).toEqual([]);
    expect(dialogs.stack.value).toHaveLength(0);
  });

  it("leaves the outer dialog's reason alone when a declarative dialog inside it closes", async () => {
    const Outer = defineComponent({
      setup: () => () =>
        h(DialogPortal, () =>
          h(DialogContent, null, () => [
            h(DialogTitle, () => "Outer"),
            h(DialogClose, { "data-test": "outer-close" }, () => "Close"),
            h(DialogRoot, { defaultOpen: true }, () =>
              h(DialogPortal, () => h(DialogContent, null, () => h(DialogTitle, () => "Inner"))),
            ),
          ]),
        ),
    });
    const { dialogs } = mountHost();
    const handle = openDialog(Outer);
    await expect.poll(shown).toEqual(["Outer", "Inner"]);

    await userEvent.keyboard("{Escape}");
    await expect.poll(shown).toEqual(["Outer"]);
    expect(handle.isOpen.value).toBe(true);
    expect(dialogs.stack.value).toHaveLength(1);

    await userEvent.click(document.querySelector<HTMLElement>("[data-test=outer-close]")!);
    expect(await handle).toEqual({ ok: false, reason: "close-button" });
  });

  it("throws a clear error when useDialogContext() runs outside a dialog (C9)", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const Stray = defineComponent({
      setup: () => {
        useDialogContext();
        return () => null;
      },
    });
    expect(() => mount(Stray)).toThrow("useDialogContext() found no dialog");
  });
});

describe("DialogHost edge cases", () => {
  it("settles with error and drops a dialog whose setup throws, and still reports the error (H1)", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const errorHandler = vi.fn();
    const dialogs = createDialogs();
    mount(defineComponent({ setup: () => () => h(DialogHost) }), {
      attachTo: document.body,
      global: { plugins: [dialogs], config: { errorHandler } },
    });
    const Broken = defineComponent({
      setup: () => {
        throw new Error("broken");
      },
    });

    const handle = openDialog(Broken);
    expect(await handle).toEqual({ ok: false, reason: "error" });
    expect(errorHandler).toHaveBeenCalledWith(
      expect.objectContaining({ message: "broken" }),
      expect.anything(),
      expect.anything(),
    );
    await expect.poll(() => dialogs.stack.value).toHaveLength(0);
  });

  it("keeps a dialog open when one of its handlers throws (F2)", async () => {
    const errorHandler = vi.fn();
    mount(defineComponent({ setup: () => () => h(DialogHost) }), {
      attachTo: document.body,
      global: { plugins: [createDialogs()], config: { errorHandler } },
    });
    const Throwing = defineComponent({
      setup: () => () =>
        h(DialogPortal, () =>
          h(DialogContent, null, () => [
            h(DialogTitle, () => "Throws"),
            h(
              "button",
              {
                "data-test": "boom",
                onClick: () => {
                  throw new Error("boom");
                },
              },
              "Boom",
            ),
          ]),
        ),
    });

    const handle = openDialog(Throwing);
    await expect.poll(shown).toEqual(["Throws"]);
    await userEvent.click(document.querySelector<HTMLElement>("[data-test=boom]")!);
    await settle();
    expect(errorHandler).toHaveBeenCalledWith(
      expect.objectContaining({ message: "boom" }),
      expect.anything(),
      expect.anything(),
    );
    expect(handle.isOpen.value).toBe(true);
    handle.dismiss();
  });

  it("settles a lazy dialog closed before it loaded and renders nothing later (C10)", async () => {
    const { dialogs } = mountHost();
    const Late = defineAsyncComponent(
      () => new Promise<Component>((resolve) => setTimeout(() => resolve(Window), 100)),
    );
    const handle = openDialog(Late);
    handle.close();
    expect(await handle).toEqual({ ok: true, value: undefined });
    await wait(200);
    expect(titles()).toEqual([]);
    expect(dialogs.stack.value).toHaveLength(0);
  });

  it("gives the dialog what is provided above the host (C1)", async () => {
    const Injected = defineComponent({
      setup: () => {
        const token = inject("token", "missing");
        return () => h(DialogPortal, () => h(DialogContent, null, () => h(DialogTitle, () => token)));
      },
    });
    mount(
      defineComponent({
        setup: () => {
          provide("token", "from above");
          return () => h(DialogHost);
        },
      }),
      { attachTo: document.body, global: { plugins: [createDialogs()] } },
    );
    const handle = openDialog(Injected);
    await expect.poll(shown).toEqual(["from above"]);
    handle.dismiss();
  });

  it("opens from a timer, outside any component (C4)", async () => {
    mountHost();
    let handle: ReturnType<typeof openDialog> | undefined;
    setTimeout(() => (handle = openDialog(Window, { title: "Timer" })));
    await expect.poll(shown).toEqual(["Timer"]);
    handle!.dismiss();
  });

  it("closes the top dialog first, programmatic or declarative (S1, S11)", async () => {
    const open = ref(true);
    mountHost(() =>
      h(DialogRoot, { open: open.value, "onUpdate:open": (value: boolean) => (open.value = value) }, () =>
        h(DialogPortal, () => h(DialogContent, null, () => h(DialogTitle, () => "Declarative"))),
      ),
    );
    await expect.poll(shown).toEqual(["Declarative"]);
    const lower = openDialog(Window, { title: "Lower" });
    await expect.poll(shown).toEqual(["Declarative", "Lower"]);
    const upper = openDialog(Window, { title: "Upper" });
    await expect.poll(shown).toEqual(["Declarative", "Lower", "Upper"]);

    await userEvent.keyboard("{Escape}");
    expect(await upper).toEqual({ ok: false, reason: "escape" });
    await expect.poll(shown).toEqual(["Declarative", "Lower"]);
    expect(lower.isOpen.value).toBe(true);
    await userEvent.keyboard("{Escape}");
    expect(await lower).toEqual({ ok: false, reason: "escape" });
    await expect.poll(shown).toEqual(["Declarative"]);
    expect(open.value).toBe(true);
    await userEvent.keyboard("{Escape}");
    expect(open.value).toBe(false);
  });

  it("renders dialogs in one host when two are mounted (C7)", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    mount(defineComponent({ setup: () => () => [h(DialogHost), h(DialogHost)] }), {
      attachTo: document.body,
      global: { plugins: [createDialogs()] },
    });
    const handle = openDialog(Window, { title: "Once" });
    await expect.poll(shown).toEqual(["Once"]);
    handle.dismiss();
  });

  it("settles open dialogs with unmount when the host goes (L9)", async () => {
    const visible = ref(true);
    const dialogs = createDialogs();
    mount(defineComponent({ setup: () => () => (visible.value ? h(DialogHost) : null) }), {
      attachTo: document.body,
      global: { plugins: [dialogs] },
    });
    const handle = openDialog(Window);
    await expect.poll(shown).toEqual(["Window"]);
    visible.value = false;
    expect(await handle).toEqual({ ok: false, reason: "unmount" });
    await expect.poll(shown).toEqual([]);
    expect(dialogs.stack.value).toHaveLength(0);
  });

  it("resolves no-host with a warning once the app that installed the manager is gone (C5)", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { wrapper } = mountHost();
    wrapper.unmount();
    expect(await openDialog(Window)).toEqual({ ok: false, reason: "no-host" });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("app.use(createDialogs())"));
  });

  it("closes every dialog with closeAllDialogs() (S6)", async () => {
    const { dialogs } = mountHost();
    const first = openDialog(Window, { title: "First" });
    const second = openDialog(Window, { title: "Second" });
    await expect.poll(shown).toEqual(["First", "Second"]);
    closeAllDialogs();
    expect(await Promise.all([first, second])).toEqual([
      { ok: false, reason: "close-all" },
      { ok: false, reason: "close-all" },
    ]);
    await expect.poll(() => dialogs.stack.value).toHaveLength(0);
  });
});
