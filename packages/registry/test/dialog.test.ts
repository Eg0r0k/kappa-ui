import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type Component, type VNodeChild, defineComponent, h, ref } from "vue";

import DialogNested from "@/examples/dialog/DialogNested.vue";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogScrollContent,
  DialogTitle,
  DialogTrigger,
} from "@/ui/dialog";

const settle = () => new Promise((resolve) => setTimeout(resolve, 300));
const animations = () =>
  Promise.all(
    document
      .getAnimations()
      .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
      .map((animation) => animation.finished.catch(() => undefined)),
  );
const dialog = () => document.querySelector<HTMLElement>("[role=dialog]");
const part = (slot: string) => dialog()!.querySelector<HTMLElement>(`[data-slot=${slot}]`)!;
const overlay = () => document.querySelector<HTMLElement>("[data-slot=dialog-overlay]")!;
const titles = () =>
  [...document.querySelectorAll("[role=dialog]")].map(
    (element) => element.querySelector("[data-slot=dialog-title]")?.textContent,
  );
const opened = async () => {
  await expect.poll(dialog).not.toBeNull();
  await animations();
};

type Options = {
  content?: Record<string, unknown>;
  as?: Component;
  body?: () => VNodeChild;
  footer?: () => VNodeChild;
};

const mountDialog = ({ content = {}, as = DialogContent, body, footer }: Options = {}) => {
  const open = ref(true);
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(Dialog, { open: open.value, "onUpdate:open": (value: boolean) => (open.value = value) }, () =>
          h(as, content, () => [
            h(DialogHeader, () => [
              h(DialogTitle, () => "Rename file"),
              h(DialogDescription, () => "Pick a new name."),
            ]),
            body ? h(DialogBody, body) : null,
            footer ? h(DialogFooter, footer) : null,
          ]),
        ),
    }),
    { attachTo: document.body },
  );
  return { wrapper, open };
};

describe("Dialog", () => {
  it("is named and described by its parts, and closes from its button", async () => {
    const { open } = mountDialog();
    await opened();
    const window = dialog()!;

    expect(window.getAttribute("data-slot")).toBe("dialog-content");
    expect(document.getElementById(window.getAttribute("aria-labelledby")!)?.textContent).toBe("Rename file");
    expect(document.getElementById(window.getAttribute("aria-describedby")!)?.textContent).toBe("Pick a new name.");

    await userEvent.click(part("dialog-close"));
    await expect.poll(dialog).toBeNull();
    expect(open.value).toBe(false);
  });

  it("focuses the first field when it opens, not the close button", async () => {
    mountDialog({
      body: () => [h("input", { "data-test": "first" }), h("input", { "data-test": "second" })],
    });

    await expect.poll(() => document.activeElement?.getAttribute("data-test")).toBe("first");
  });

  it("falls back to the close button when nothing else can take focus", async () => {
    mountDialog({ body: () => h("p", "Nothing to focus.") });

    await expect.poll(() => document.activeElement?.getAttribute("data-slot")).toBe("dialog-close");
  });

  it("closes on Escape and on an outside press", async () => {
    const escaped = mountDialog();
    await opened();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => escaped.open.value).toBe(false);
    escaped.wrapper.unmount();

    const pressed = mountDialog();
    await opened();
    await userEvent.click(overlay(), { position: { x: 5, y: 5 } } as never);
    await expect.poll(() => pressed.open.value).toBe(false);
  });

  it("stays open when the window prevents both ways of dismissing it", async () => {
    const prevent = (event: Event) => event.preventDefault();
    const { open } = mountDialog({ content: { onEscapeKeyDown: prevent, onInteractOutside: prevent } });
    await opened();

    await userEvent.keyboard("{Escape}");
    await userEvent.click(overlay(), { position: { x: 5, y: 5 } } as never);
    await settle();
    expect(open.value).toBe(true);
  });

  it("sizes the body to its content, and scrolls only the body once the window reaches the screen's edge", async () => {
    const short = mountDialog({ body: () => h("p", { style: "height:120px" }, "Short") });
    await opened();
    expect(Math.round(part("dialog-body").getBoundingClientRect().height)).toBe(120 + 8);
    short.wrapper.unmount();

    mountDialog({
      body: () => h("div", { style: "height:3000px" }, "Tall"),
      footer: () => h("button", "Save"),
    });
    await opened();
    const window = dialog()!.getBoundingClientRect();
    const body = part("dialog-body");

    expect(window.top).toBeGreaterThanOrEqual(0);
    expect(window.bottom).toBeLessThanOrEqual(document.documentElement.clientHeight);
    expect(part("dialog-header").getBoundingClientRect().top).toBeGreaterThanOrEqual(window.top);
    expect(part("dialog-footer").getBoundingClientRect().bottom).toBeLessThanOrEqual(window.bottom);
    expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    body.scrollTop = 500;
    expect(body.scrollTop).toBe(500);
  });

  it("keeps the header clear of the close button, and only while there is one", async () => {
    const withButton = mountDialog();
    await opened();
    expect(getComputedStyle(part("dialog-header")).paddingInlineEnd).toBe("56px");
    withButton.wrapper.unmount();

    mountDialog({ content: { showCloseButton: false } });
    await opened();
    expect(dialog()!.querySelector("[data-slot=dialog-close]")).toBeNull();
    expect(getComputedStyle(part("dialog-header")).paddingInlineEnd).toBe("24px");
  });

  it("covers the viewport with the fullscreen classes", async () => {
    mountDialog({
      content: { class: "inset-0 size-full max-h-none max-w-none translate-none rounded-none border-0" },
    });
    await opened();
    const rect = dialog()!.getBoundingClientRect();

    expect([rect.left, rect.top, Math.round(rect.width), Math.round(rect.height)]).toEqual([
      0,
      0,
      document.body.clientWidth,
      document.body.clientHeight,
    ]);
  });

  it("scrolls the overlay, not the body, in DialogScrollContent", async () => {
    mountDialog({ as: DialogScrollContent, body: () => h("div", { style: "height:3000px" }) });
    await opened();
    const body = part("dialog-body");

    expect(dialog()!.getBoundingClientRect().height).toBeGreaterThan(3000);
    expect(body.scrollHeight).toBe(body.clientHeight);
    expect(overlay().scrollHeight).toBeGreaterThan(overlay().clientHeight);
  });

  it("opens from a DialogTrigger", async () => {
    mount(
      defineComponent({
        setup: () => () =>
          h(Dialog, null, () => [
            h(DialogTrigger, { id: "trigger" }, () => "Open"),
            h(DialogContent, null, () => h(DialogHeader, () => h(DialogTitle, () => "Notes"))),
          ]),
      }),
      { attachTo: document.body },
    );
    const trigger = document.getElementById("trigger")!;

    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    await userEvent.click(trigger);
    await expect.poll(titles).toEqual(["Notes"]);
  });

  it("stacks a nested dialog and closes only the top one on Escape", async () => {
    mount(
      defineComponent({
        setup: () => () =>
          h(Dialog, null, () => [
            h(DialogTrigger, { id: "outer" }, () => "Open outer"),
            h(DialogContent, null, () => [
              h(DialogHeader, () => h(DialogTitle, () => "Outer")),
              h(DialogFooter, () =>
                h(Dialog, null, () => [
                  h(DialogTrigger, { id: "inner" }, () => "Open inner"),
                  h(DialogContent, null, () => h(DialogHeader, () => h(DialogTitle, () => "Inner"))),
                ]),
              ),
            ]),
          ]),
      }),
      { attachTo: document.body },
    );

    await userEvent.click(document.getElementById("outer")!);
    await expect.poll(titles).toEqual(["Outer"]);
    await animations();
    await userEvent.click(document.getElementById("inner")!);
    await expect.poll(titles).toEqual(["Outer", "Inner"]);
    await animations();

    await userEvent.keyboard("{Escape}");
    await expect.poll(titles).toEqual(["Outer"]);
    await expect.poll(() => document.activeElement?.id).toBe("inner");
  });

  it("closes only the inner dialog when a button in it closes it", async () => {
    const wrapper = mount(DialogNested, { attachTo: document.body });
    const button = (name: string) =>
      [...document.querySelectorAll<HTMLButtonElement>("[role=dialog] button")].find(
        (element) => element.textContent?.trim() === name,
      )!;

    await userEvent.click(wrapper.get("button").element);
    await expect.poll(titles).toEqual(["Share project"]);
    await animations();
    await userEvent.click(button("Stop sharing"));
    await expect.poll(titles).toEqual(["Share project", "Stop sharing?"]);
    await animations();
    const innerTitle = [...document.querySelectorAll("[role=dialog] [data-slot=dialog-title]")].at(-1)!;
    const changes: string[] = [];
    new MutationObserver(() => changes.push(innerTitle.textContent ?? "")).observe(innerTitle, {
      characterData: true,
      childList: true,
      subtree: true,
    });
    await userEvent.click(button("Confirm"));
    await expect.poll(titles).toEqual(["Share project"]);
    expect(changes).toEqual([]);

    expect(document.querySelector("[role=dialog] [aria-live]")?.textContent).toContain("Sharing is off");
    await expect.poll(() => document.activeElement?.textContent?.trim()).toBe("Share again");
  });
});
