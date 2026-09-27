import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { type PropType, type VNodeChild, defineComponent, h, onMounted, ref } from "vue";

import {
  DialogClose,
  DialogContent,
  DialogHost,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  createDialogs,
  defineDialog,
  openDialog,
  useDialogContext,
} from "../../src/dialog";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const settle = () => wait(50);

const titles = () =>
  [...document.querySelectorAll("[role=dialog]")].map((element) => element.querySelector("h2")?.textContent);
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
  document.body.innerHTML = "";
  document.body.removeAttribute("style");
});

enableAutoUnmount(afterEach);

describe("DialogHost", () => {
  it("renders an opened dialog and resolves the value it closes with", async () => {
    const { dialogs } = mountHost();
    const handle = openDialog<string>(Window, { title: "Rename" });
    await settle();
    expect(titles()).toEqual(["Rename"]);

    await userEvent.click(document.querySelector<HTMLElement>("[data-test=ok]")!);
    expect(await handle).toEqual({ ok: true, value: "ok" });
    await settle();
    expect(titles()).toEqual([]);
    expect(dialogs.stack.value).toHaveLength(0);
  });

  it("reports Escape, an outside press, DialogClose and dismiss() as their reasons (D1, D2, D12, L2)", async () => {
    mountHost();
    const escaped = openDialog(Window);
    await settle();
    await userEvent.keyboard("{Escape}");
    const pressed = openDialog(Window);
    await settle();
    await pressOutside();
    const clicked = openDialog(Window);
    await settle();
    await userEvent.click(document.querySelector<HTMLElement>("[data-test=close]")!);
    const dismissed = openDialog(Window);
    await settle();
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
    await settle();
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
    await settle();
    composingEscape();
    await settle();
    expect(open.value).toBe(true);
    await userEvent.keyboard("{Escape}");
    expect(open.value).toBe(false);

    const handle = openDialog(Window);
    await settle();
    composingEscape();
    await settle();
    expect(handle.isOpen.value).toBe(true);
    await userEvent.keyboard("{Escape}");
    expect(await handle).toEqual({ ok: false, reason: "escape" });
  });

  it("holds the dialog open while loading, except against code (F4, F5, F6)", async () => {
    mountHost();
    const handle = openDialog(Window, { busy: true });
    await settle();
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
    await settle();
    handle.dismiss();
    await settle();
    expect(document.querySelector("[data-test=window]")).toBeNull();
    expect(dialogs.stack.value).toHaveLength(0);
  });

  it("keeps the window in the DOM until its exit animation ends (A1)", async () => {
    const style = document.createElement("style");
    style.textContent =
      "@keyframes dialog-test-out { to { opacity: 0 } } [data-test=window][data-state=closed] { animation: dialog-test-out 300ms forwards }";
    document.head.append(style);
    const { dialogs } = mountHost();
    const handle = openDialog(Window);
    await settle();
    handle.dismiss();

    await wait(100);
    expect(document.querySelector("[data-test=window]")).not.toBeNull();
    expect(dialogs.stack.value).toHaveLength(1);
    await wait(400);
    expect(document.querySelector("[data-test=window]")).toBeNull();
    expect(dialogs.stack.value).toHaveLength(0);
    style.remove();
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
    await settle();
    await userEvent.fill(document.querySelector<HTMLElement>("[data-test=draft]")!, "hello");
    await userEvent.keyboard("{Escape}");
    expect(await first).toEqual({ ok: false, reason: "escape" });
    await settle();
    expect(dialogs.stack.value).toHaveLength(1);

    const second = draft.open<string>();
    await settle();
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
    await settle();
    expect(titles()).toEqual([]);
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
    await settle();
    expect(titles()).toEqual(["Outer", "Inner"]);

    await userEvent.keyboard("{Escape}");
    await settle();
    expect(titles()).toEqual(["Outer"]);
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
