import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNode, defineComponent, h, nextTick, ref } from "vue";

import DialogNested from "@/examples/dialog/DialogNested.vue";
import { Dialog, DialogClose, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";

const settle = () => new Promise((resolve) => setTimeout(resolve, 300));
const dialog = () => document.querySelector<HTMLElement>("[role=dialog]");

afterEach(() => {
  document.body.innerHTML = "";
});

const mountDialog = (props: Record<string, unknown> = {}, slots: Record<string, (scope: { close: () => void }) => VNode | VNode[]> = {}) => {
  const open = ref(true);
  const prevented: string[] = [];
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          Dialog,
          {
            open: open.value,
            "onUpdate:open": (value: boolean) => (open.value = value),
            "onClose:prevent": () => prevented.push("prevent"),
            title: "Rename file",
            description: "Pick a new name.",
            ...props,
          },
          slots,
        ),
    }),
    { attachTo: document.body },
  );
  return { wrapper, open, prevented };
};

describe("Dialog", () => {
  it("is named and described by its title and description, and closes from its button", async () => {
    const { wrapper, open } = mountDialog();
    await settle();
    const window = dialog()!;

    expect(document.getElementById(window.getAttribute("aria-labelledby")!)?.textContent).toBe("Rename file");
    expect(document.getElementById(window.getAttribute("aria-describedby")!)?.textContent).toBe("Pick a new name.");
    expect(window.contains(document.activeElement)).toBe(true);

    await userEvent.click(window.querySelector<HTMLElement>("[data-slot=dialog-close]")!);
    await settle();
    expect(open.value).toBe(false);
    expect(dialog()).toBeNull();
    wrapper.unmount();
  });

  it("focuses the first field when it opens, not the close button", async () => {
    const { wrapper } = mountDialog({}, { body: () => [h("input", { "data-test": "first" }), h("input", { "data-test": "second" })] });
    await settle();

    expect(document.activeElement).toBe(document.querySelector("[data-test=first]"));
    wrapper.unmount();
  });

  it("falls back to the close button when nothing else can take focus", async () => {
    const { wrapper } = mountDialog({}, { body: () => h("p", "Nothing to focus.") });
    await settle();

    expect(document.activeElement?.getAttribute("data-slot")).toBe("dialog-close");
    wrapper.unmount();
  });

  it("closes on Escape and on the overlay unless it is not dismissible", async () => {
    const dismissible = mountDialog();
    await settle();
    await userEvent.keyboard("{Escape}");
    await settle();
    expect(dismissible.open.value).toBe(false);
    dismissible.wrapper.unmount();

    const kept = mountDialog({ dismissible: false });
    await settle();
    await userEvent.keyboard("{Escape}");
    await userEvent.click(document.querySelector<HTMLElement>("[data-slot=dialog-overlay]")!, {
      position: { x: 5, y: 5 },
    } as never);
    await settle();
    expect(kept.open.value).toBe(true);
    expect(kept.prevented.length).toBeGreaterThanOrEqual(2);
    kept.wrapper.unmount();
  });

  it("sizes the body to its content and scrolls it once the window is full", async () => {
    const short = mountDialog({}, { body: () => h("p", { style: "height:120px" }, "Short") });
    await settle();
    const shortBody = dialog()!.querySelector<HTMLElement>("[data-slot=dialog-body]")!;
    expect(Math.round(shortBody.getBoundingClientRect().height)).toBe(120 + 24);
    short.wrapper.unmount();
    await settle();

    const tall = mountDialog({}, { body: () => h("div", { style: "height:3000px" }, "Tall") });
    await settle();
    const window = dialog()!;
    const viewport = window.querySelector<HTMLElement>("[data-slot=dialog-body] [data-slot=scroll-area-viewport]")!;

    expect(window.getBoundingClientRect().bottom).toBeLessThanOrEqual(document.documentElement.clientHeight);
    expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
    viewport.scrollTop = 500;
    expect(viewport.scrollTop).toBe(500);
    tall.wrapper.unmount();
  });

  it("gives the footer a close function", async () => {
    const { wrapper, open } = mountDialog({}, { footer: ({ close }) => h("button", { id: "save", onClick: close }, "Save") });
    await settle();

    await userEvent.click(document.getElementById("save")!);
    await settle();
    expect(open.value).toBe(false);
    wrapper.unmount();
  });

  it("builds a window from its parts in the content slot", async () => {
    const { wrapper, open } = mountDialog(
      { title: undefined, description: undefined },
      {
        content: () => [
          h(DialogHeader, () => h(DialogTitle, () => "Delete project?")),
          h(DialogFooter, () => h(DialogClose, { id: "keep" }, () => "Keep")),
        ],
      },
    );
    await settle();
    const window = dialog()!;

    expect(document.getElementById(window.getAttribute("aria-labelledby")!)?.textContent).toBe("Delete project?");
    expect(window.querySelector("[data-slot=dialog-close]")).not.toBeNull();
    await userEvent.click(document.getElementById("keep")!);
    await settle();
    expect(open.value).toBe(false);
    wrapper.unmount();
  });

  it("opens from its trigger and scrolls the overlay when scrollable", async () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            Dialog,
            { scrollable: true, title: "Notes" },
            { default: () => h("button", { id: "trigger" }, "Open"), body: () => h("div", { style: "height:3000px" }) },
          ),
      }),
      { attachTo: document.body },
    );

    await userEvent.click(document.getElementById("trigger")!);
    await settle();
    const overlayViewport = document.querySelector<HTMLElement>(
      "[data-slot=dialog-overlay] > [data-slot=scroll-area] > [data-slot=scroll-area-viewport]",
    )!;

    expect(dialog()!.getBoundingClientRect().height).toBeGreaterThan(3000);
    expect(overlayViewport.scrollHeight).toBeGreaterThan(overlayViewport.clientHeight);
    await nextTick();
    wrapper.unmount();
  });

  it("takes an explicit DialogTrigger in the default slot without wrapping it again", async () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(Dialog, { title: "Notes" }, () =>
            h("div", { class: "toolbar" }, [
              h("span", "Toolbar"),
              h(DialogTrigger, { id: "trigger" }, () => "Open"),
            ]),
          ),
      }),
      { attachTo: document.body },
    );
    const trigger = document.getElementById("trigger")!;

    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(document.querySelector(".toolbar")?.getAttribute("aria-haspopup")).toBeNull();
    await userEvent.click(trigger);
    await settle();
    expect(dialog()).not.toBeNull();
    wrapper.unmount();
  });

  it("stacks a nested dialog and closes only the top one on Escape", async () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(Dialog, { title: "Outer" }, {
            default: () => h("button", { id: "outer" }, "Open outer"),
            footer: () => h(Dialog, { title: "Inner" }, { default: () => h("button", { id: "inner" }, "Open inner") }),
          }),
      }),
      { attachTo: document.body },
    );
    const titles = () => [...document.querySelectorAll("[role=dialog]")].map((element) => element.querySelector("h2")?.textContent);

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
    const titles = () => [...document.querySelectorAll("[role=dialog]")].map((element) => element.querySelector("h2")?.textContent);
    const button = (name: string) =>
      [...document.querySelectorAll<HTMLButtonElement>("[role=dialog] button")].find((element) => element.textContent?.trim() === name)!;

    await userEvent.click(wrapper.get("button").element);
    await settle();
    await userEvent.click(button("Stop sharing"));
    await settle();
    const innerTitle = [...document.querySelectorAll("[role=dialog] h2")].at(-1)!;
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
