import { mount } from "@vue/test-utils";
import { userEvent } from "vitest/browser";
import { type VNode, h } from "vue";

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/ui/menubar";

export type Fixture = {
  root?: Record<string, unknown>;
  content?: Record<string, unknown>;
  item?: Record<string, unknown>;
  editDisabled?: boolean;
  before?: () => VNode[];
  after?: () => VNode[];
};

export const fileMenu = (fixture: Fixture = {}) =>
  h(MenubarMenu, { value: "file" }, () => [
    h(MenubarTrigger, () => "File"),
    h(MenubarContent, { class: "file-menu", ...fixture.content }, () => [
      h(MenubarItem, { class: "new-tab", ...fixture.item }, () => ["New tab", h(MenubarShortcut, () => "⌘T")]),
      h(MenubarItem, () => "New window"),
      h(MenubarItem, { disabled: true }, () => "New incognito window"),
      h(MenubarSeparator),
      h(MenubarSub, () => [
        h(MenubarSubTrigger, () => "Share"),
        h(MenubarSubContent, { class: "share-menu" }, () => [
          h(MenubarItem, () => "Email link"),
          h(MenubarItem, () => "Messages"),
        ]),
      ]),
      h(MenubarSeparator),
      h(MenubarItem, () => "Print"),
    ]),
  ]);

export const editMenu = (fixture: Fixture = {}) =>
  h(MenubarMenu, { value: "edit" }, () => [
    h(MenubarTrigger, { disabled: fixture.editDisabled }, () => "Edit"),
    h(MenubarContent, { class: "edit-menu" }, () => [h(MenubarItem, () => "Undo"), h(MenubarItem, () => "Redo")]),
  ]);

export const viewMenu = (
  state: { bookmarks: boolean; profile: string } = { bookmarks: false, profile: "andy" },
  onChange?: (key: "bookmarks" | "profile", value: unknown) => void,
) =>
  h(MenubarMenu, { value: "view" }, () => [
    h(MenubarTrigger, () => "View"),
    h(MenubarContent, { class: "view-menu" }, () => [
      h(
        MenubarCheckboxItem,
        {
          modelValue: state.bookmarks,
          "onUpdate:modelValue": (value: unknown) => onChange?.("bookmarks", value),
        },
        () => "Show bookmarks",
      ),
      h(MenubarSeparator),
      h(MenubarLabel, { inset: true }, () => "Profile"),
      h(
        MenubarRadioGroup,
        { modelValue: state.profile, "onUpdate:modelValue": (value: unknown) => onChange?.("profile", value) },
        () => [
          h(MenubarRadioItem, { value: "andy" }, () => "Andy"),
          h(MenubarRadioItem, { value: "benoit" }, () => "Benoit"),
        ],
      ),
    ]),
  ]);

export const renderMenubar = (fixture: Fixture = {}) =>
  mount(
    {
      render: () => [
        h("button", { id: "before" }, "Before"),
        ...(fixture.before?.() ?? []),
        h(Menubar, { "aria-label": "Application", ...fixture.root }, () => [
          fileMenu(fixture),
          editMenu(fixture),
          viewMenu(),
        ]),
        h("button", { id: "after" }, "After"),
        ...(fixture.after?.() ?? []),
      ],
    },
    { attachTo: document.body },
  );

export const settle = () => new Promise((resolve) => setTimeout(resolve, 200));
export const q = (selector: string) => document.querySelector<HTMLElement>(selector);
export const all = (selector: string) => [...document.querySelectorAll<HTMLElement>(selector)];
export const trigger = (name: string) => all("[data-slot=menubar-trigger]").find((el) => el.textContent === name)!;
export const item = (name: string) =>
  all("[role^=menuitem]:not([data-slot=menubar-trigger])").find((el) => el.textContent?.trim().startsWith(name))!;
// Chrome replays a resting pointer over whatever renders under it, which would hover-switch an opened menu
export const parkPointer = async () => {
  const spot = document.createElement("div");
  spot.style.cssText = "position: fixed; bottom: 0; right: 0; width: 4px; height: 4px";
  document.body.append(spot);
  await userEvent.hover(spot);
  spot.remove();
};

export const openMenus = () =>
  all("[data-slot=menubar-content][data-state=open]").map((el) => el.getAttribute("aria-labelledby"));
