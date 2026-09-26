import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
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
const dialog = () => document.querySelector<HTMLElement>("[role=dialog]");
const part = (slot: string) => dialog()!.querySelector<HTMLElement>(`[data-slot=${slot}]`)!;
const overlay = () => document.querySelector<HTMLElement>("[data-slot=dialog-overlay]")!;
const titles = () =>
  [...document.querySelectorAll("[role=dialog]")].map(
    (element) => element.querySelector("[data-slot=dialog-title]")?.textContent,
  );

afterEach(() => {
  document.body.innerHTML = "";
});

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
            h(DialogHeader, () => [h(DialogTitle, () => "Rename file"), h(DialogDescription, () => "Pick a new name.")]),
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
    const { wrapper, open } = mountDialog();
    await settle();
    const window = dialog()!;

    expect(window.getAttribute("data-slot")).toBe("dialog-content");
    expect(document.getElementById(window.getAttribute("aria-labelledby")!)?.textContent).toBe("Rename file");
    expect(document.getElementById(window.getAttribute("aria-describedby")!)?.textContent).toBe("Pick a new name.");

    await userEvent.click(part("dialog-close"));
    await settle();
    expect(open.value).toBe(false);
    expect(dialog()).toBeNull();
    wrapper.unmount();
  });

  it("focuses the first field when it opens, not the close button", async () => {
    const { wrapper } = mountDialog({
      body: () => [h("input", { "data-test": "first" }), h("input", { "data-test": "second" })],
    });
    await settle();

    expect(document.activeElement).toBe(document.querySelector("[data-test=first]"));
    wrapper.unmount();
  });

  it("falls back to the close button when nothing else can take focus", async () => {
    const { wrapper } = mountDialog({ body: () => h("p", "Nothing to focus.") });
    await settle();

    expect(document.activeElement?.getAttribute("data-slot")).toBe("dialog-close");
    wrapper.unmount();
  });

  it("closes on Escape and on an outside press", async () => {
    const escaped = mountDialog();
    await settle();
    await userEvent.keyboard("{Escape}");
    await settle();
    expect(escaped.open.value).toBe(false);
    escaped.wrapper.unmount();

    const pressed = mountDialog();
    await settle();
    await userEvent.click(overlay(), { position: { x: 5, y: 5 } } as never);
    await settle();
    expect(pressed.open.value).toBe(false);
    pressed.wrapper.unmount();
  });

  it("stays open when the window prevents both ways of dismissing it", async () => {
    const prevent = (event: Event) => event.preventDefault();
    const { wrapper, open } = mountDialog({ content: { onEscapeKeyDown: prevent, onInteractOutside: prevent } });
    await settle();

    await userEvent.keyboard("{Escape}");
    await userEvent.click(overlay(), { position: { x: 5, y: 5 } } as never);
    await settle();
    expect(open.value).toBe(true);
    wrapper.unmount();
  });

  it("sizes the body to its content, and scrolls only the body once the window reaches the screen's edge", async () => {
    const short = mountDialog({ body: () => h("p", { style: "height:120px" }, "Short") });
    await settle();
    expect(Math.round(part("dialog-body").getBoundingClientRect().height)).toBe(120 + 8);
    short.wrapper.unmount();
    await settle();

    const tall = mountDialog({
      body: () => h("div", { style: "height:3000px" }, "Tall"),
      footer: () => h("button", "Save"),
    });
    await settle();
    const window = dialog()!.getBoundingClientRect();
    const body = part("dialog-body");

    expect(window.top).toBeGreaterThanOrEqual(0);
    expect(window.bottom).toBeLessThanOrEqual(document.documentElement.clientHeight);
    expect(part("dialog-header").getBoundingClientRect().top).toBeGreaterThanOrEqual(window.top);
    expect(part("dialog-footer").getBoundingClientRect().bottom).toBeLessThanOrEqual(window.bottom);
    expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    body.scrollTop = 500;
    expect(body.scrollTop).toBe(500);
    tall.wrapper.unmount();
  });

  it("keeps the header clear of the close button, and only while there is one", async () => {
    const withButton = mountDialog();
    await settle();
    expect(getComputedStyle(part("dialog-header")).paddingInlineEnd).toBe("56px");
    withButton.wrapper.unmount();
    await settle();

    const without = mountDialog({ content: { showCloseButton: false } });
    await settle();
    expect(dialog()!.querySelector("[data-slot=dialog-close]")).toBeNull();
    expect(getComputedStyle(part("dialog-header")).paddingInlineEnd).toBe("24px");
    without.wrapper.unmount();
  });

  it("covers the viewport with the fullscreen classes", async () => {
    const { wrapper } = mountDialog({
      content: { class: "inset-0 size-full max-h-none max-w-none translate-none rounded-none border-0" },
    });
    await settle();
    const rect = dialog()!.getBoundingClientRect();

    expect([rect.left, rect.top, Math.round(rect.width), Math.round(rect.height)]).toEqual([
      0,
      0,
      document.documentElement.clientWidth,
      document.documentElement.clientHeight,
    ]);
    wrapper.unmount();
  });

  it("scrolls the overlay, not the body, in DialogScrollContent", async () => {
    const { wrapper } = mountDialog({ as: DialogScrollContent, body: () => h("div", { style: "height:3000px" }) });
    await settle();
    const body = part("dialog-body");

    expect(dialog()!.getBoundingClientRect().height).toBeGreaterThan(3000);
    expect(body.scrollHeight).toBe(body.clientHeight);
    expect(overlay().scrollHeight).toBeGreaterThan(overlay().clientHeight);
    wrapper.unmount();
  });

  it("opens from a DialogTrigger", async () => {
    const wrapper = mount(
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
    await settle();
    expect(titles()).toEqual(["Notes"]);
    wrapper.unmount();
  });

  it("stacks a nested dialog and closes only the top one on Escape", async () => {
    const wrapper = mount(
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
    await settle();
    await userEvent.click(document.getElementById("inner")!);
    await settle();
    expect(titles()).toEqual(["Outer", "Inner"]);

    await userEvent.keyboard("{Escape}");
    await settle();
    expect(titles()).toEqual(["Outer"]);
    expect(document.activeElement?.id).toBe("inner");
    wrapper.unmount();
  });

  it("closes only the inner dialog when a button in it closes it", async () => {
    const wrapper = mount(DialogNested, { attachTo: document.body });
    const button = (name: string) =>
      [...document.querySelectorAll<HTMLButtonElement>("[role=dialog] button")].find(
        (element) => element.textContent?.trim() === name,
      )!;

    await userEvent.click(wrapper.get("button").element);
    await settle();
    await userEvent.click(button("Stop sharing"));
    await settle();
    const innerTitle = [...document.querySelectorAll("[role=dialog] [data-slot=dialog-title]")].at(-1)!;
    const changes: string[] = [];
    new MutationObserver(() => changes.push(innerTitle.textContent ?? "")).observe(innerTitle, {
      characterData: true,
      childList: true,
      subtree: true,
    });
    await userEvent.click(button("Confirm"));
    await settle();
    expect(changes).toEqual([]);

    expect(titles()).toEqual(["Share project"]);
    expect(document.querySelector("[role=dialog] [aria-live]")?.textContent).toContain("Sharing is off");
    expect(document.activeElement?.textContent?.trim()).toBe("Share again");
    wrapper.unmount();
  });
});
