import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNode, defineComponent, h, ref, withDirectives } from "vue";

import { Dialog, DialogContent, DialogTitle } from "@/ui/dialog";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/ui/menubar";
import { Popover, PopoverAnchor, PopoverContent } from "@/ui/popover";
import { vTooltip } from "@/ui/tooltip";

import { item, openMenus, parkPointer, q, settle, trigger } from "./menubar-fixture";
import { pointer, wait } from "./pointer";

enableAutoUnmount(afterEach);
beforeEach(parkPointer);

const editMenu = (content: Record<string, unknown>, items: () => VNode[]) =>
  h(Menubar, { "aria-label": "App" }, () =>
    h(MenubarMenu, () => [h(MenubarTrigger, () => "Edit"), h(MenubarContent, content, items)]),
  );

describe("Menubar focus on close", () => {
  it("returns focus to the trigger after an item is chosen", async () => {
    mount({ render: () => editMenu({}, () => [h(MenubarItem, () => "Undo")]) }, { attachTo: document.body });
    trigger("Edit").focus();
    await userEvent.keyboard("{Enter}");
    await settle();
    await userEvent.keyboard("{Enter}");
    await settle();
    expect(openMenus()).toEqual([]);
    expect(document.activeElement).toBe(trigger("Edit"));
  });

  // Reka's MenubarContent refocuses the trigger even when close-auto-focus is prevented
  it("does not refocus the trigger when close-auto-focus is prevented", async () => {
    mount(
      {
        render: () =>
          editMenu({ onCloseAutoFocus: (event: Event) => event.preventDefault() }, () => [
            h(MenubarItem, () => "Toggle sidebar"),
          ]),
      },
      { attachTo: document.body },
    );
    trigger("Edit").focus();
    await userEvent.keyboard("{Enter}");
    await settle();
    await userEvent.keyboard("{Enter}");
    await settle();
    expect(openMenus()).toEqual([]);
    expect(document.activeElement).not.toBe(trigger("Edit"));
  });

  // nuxt/ui#3968 in menubar form: an item that moves focus keeps it there
  it("leaves focus where an item put it when close-auto-focus is prevented", async () => {
    const closeEvents: Event[] = [];
    let focusMoved = false;
    mount(
      {
        render: () => [
          editMenu(
            {
              onCloseAutoFocus: (event: Event) => {
                closeEvents.push(event);
                if (focusMoved) event.preventDefault();
                focusMoved = false;
              },
            },
            () => [
              h(
                MenubarItem,
                {
                  onSelect: () => {
                    focusMoved = true;
                    q("#search")!.focus();
                  },
                },
                () => "Find…",
              ),
            ],
          ),
          h("input", { id: "search", "aria-label": "Search" }),
        ],
      },
      { attachTo: document.body },
    );
    trigger("Edit").focus();
    await userEvent.keyboard("{Enter}");
    await settle();
    await userEvent.keyboard("{Enter}");
    await settle();
    await wait(200);

    expect(closeEvents).toHaveLength(1);
    expect(openMenus()).toEqual([]);
    expect(document.activeElement).toBe(q("#search"));
    // the trigger is back in the menu context for the next close
    trigger("Edit").focus();
    await userEvent.keyboard("{Enter}");
    await settle();
    await userEvent.keyboard("{Escape}");
    await settle();
    expect(document.activeElement).toBe(trigger("Edit"));
  });

  // nuxt/ui#6463, nuxt/ui#5105: a non-modal overlay opened from an item lost focus to the trigger and closed
  it("keeps a non-modal popover opened from an item open", async () => {
    const share = ref(false);
    mount(
      defineComponent({
        setup: () => () =>
          h(
            Popover,
            { open: share.value, modal: false, "onUpdate:open": (value: boolean) => (share.value = value) },
            () => [
              h(PopoverAnchor, { asChild: true }, () =>
                h("div", [
                  editMenu({ onCloseAutoFocus: (event: Event) => event.preventDefault() }, () => [
                    h(MenubarItem, { onSelect: () => (share.value = true) }, () => "Share…"),
                  ]),
                ]),
              ),
              h(PopoverContent, { class: "share-popover" }, () => h("input", { "aria-label": "Email" })),
            ],
          ),
      }),
      { attachTo: document.body },
    );
    await userEvent.click(trigger("Edit"));
    await settle();
    await userEvent.click(item("Share"));
    await settle();
    await wait(300);
    expect(share.value).toBe(true);
    expect(q(".share-popover")).not.toBeNull();
    expect(document.activeElement?.closest(".share-popover")).not.toBeNull();
  });
});

describe("Menubar with other overlays", () => {
  // reka-ui#2993: a Tooltip component around the trigger steals its popper anchor; the directive does not
  it("positions the menu under a trigger that carries v-tooltip", async () => {
    mount(
      {
        render: () =>
          h(Menubar, { "aria-label": "App", class: "ms-40 mt-20" }, () =>
            h(MenubarMenu, () => [
              withDirectives(
                h(MenubarTrigger, { "aria-label": "Settings" }, () => "⚙"),
                [[vTooltip, "Settings"]],
              ),
              h(MenubarContent, () => h(MenubarItem, () => "Preferences")),
            ]),
          ),
      },
      { attachTo: document.body },
    );
    const settings = q("[data-slot=menubar-trigger]")!;
    pointer("pointermove", settings, 1, 1, "mouse");
    await userEvent.click(settings);
    await settle();
    const triggerBox = settings.getBoundingClientRect();
    const contentBox = q("[data-slot=menubar-content]")!.getBoundingClientRect();
    expect(Math.round(contentBox.top - triggerBox.bottom)).toBe(4);
    expect(Math.round(contentBox.left)).toBe(Math.round(triggerBox.left));
  });

  it("works inside a modal dialog", async () => {
    const chosen: string[] = [];
    mount(
      {
        render: () =>
          h(Dialog, { open: true }, () =>
            h(DialogContent, () => [
              h(DialogTitle, () => "Editor"),
              h(Menubar, { "aria-label": "App" }, () =>
                h(MenubarMenu, () => [
                  h(MenubarTrigger, () => "File"),
                  h(MenubarContent, () => h(MenubarItem, { onSelect: () => chosen.push("save") }, () => "Save")),
                ]),
              ),
            ]),
          ),
      },
      { attachTo: document.body },
    );
    await settle();
    await userEvent.click(trigger("File"));
    await settle();
    expect(openMenus()).toHaveLength(1);
    await userEvent.click(item("Save"));
    await settle();
    expect(chosen).toEqual(["save"]);
    expect(q("[data-slot=dialog-content]")).not.toBeNull();
  });

  // reka-ui#2119: 2.10 did not declare open-auto-focus on MenubarContent; it must still reach the menu
  it("passes open-auto-focus and attributes through to the menu", async () => {
    const opened: Event[] = [];
    mount(
      {
        render: () =>
          editMenu({ onOpenAutoFocus: (event: Event) => opened.push(event), "data-test": "menu" }, () => [
            h(MenubarItem, () => "Undo"),
          ]),
      },
      { attachTo: document.body },
    );
    await userEvent.click(trigger("Edit"));
    await settle();
    expect(opened).toHaveLength(1);
    expect(q("[data-slot=menubar-content]")!.dataset.test).toBe("menu");
  });
});

describe("Menubar submenus", () => {
  // reka-ui#2929, reka-ui#2446
  it("keeps a submenu open while the pointer moves within its trigger", async () => {
    mount(
      {
        render: () =>
          editMenu({}, () => [
            h(MenubarItem, () => "Undo"),
            h(MenubarSub, () => [
              h(MenubarSubTrigger, () => "Find"),
              h(MenubarSubContent, () => [h(MenubarItem, () => "Find next"), h(MenubarItem, () => "Find previous")]),
            ]),
          ]),
      },
      { attachTo: document.body },
    );
    await userEvent.click(trigger("Edit"));
    await settle();
    const find = item("Find");
    await userEvent.hover(find, { position: { x: 10, y: 10 } });
    await settle();
    expect(q("[data-slot=menubar-sub-content]")).not.toBeNull();
    await userEvent.hover(find, { position: { x: 40, y: 12 } });
    await userEvent.hover(find, { position: { x: 70, y: 14 } });
    await settle();
    expect(q("[data-slot=menubar-sub-content]")).not.toBeNull();
    expect(find.dataset.state).toBe("open");
  });
});
