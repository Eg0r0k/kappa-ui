import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { defineComponent, h, nextTick, reactive, ref } from "vue";

import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@/ui/menubar";

import {
  all,
  focused,
  gone,
  item,
  openMenus,
  opened,
  parkPointer,
  q,
  renderMenubar,
  settle,
  trigger,
  viewMenu,
} from "./menubar-fixture";

beforeEach(parkPointer);

const probe = (className: string) => {
  const element = document.body.appendChild(Object.assign(document.createElement("span"), { className }));
  const color = getComputedStyle(element).color;
  element.remove();
  return color;
};

describe("Menubar structure", () => {
  it("renders a menubar of menu buttons that are closed", async () => {
    renderMenubar();
    await nextTick();
    const bar = q("[data-slot=menubar]")!;
    expect(bar.getAttribute("role")).toBe("menubar");
    expect(bar.dataset.size).toBe("md");
    expect(bar.dataset.variant).toBe("outline");

    const file = trigger("File");
    expect(file.tagName).toBe("BUTTON");
    expect(file.getAttribute("type")).toBe("button");
    expect(file.getAttribute("role")).toBe("menuitem");
    expect(file.getAttribute("aria-haspopup")).toBe("menu");
    expect(file.getAttribute("aria-expanded")).toBe("false");
    // reka-ui#2597: aria-controls only points at content that exists
    expect(file.hasAttribute("aria-controls")).toBe(false);
    expect(file.dataset.state).toBe("closed");
    expect(q("[data-slot=menubar-content]")).toBeNull();
  });

  it("opens on click and links the trigger and the menu", async () => {
    renderMenubar();
    const file = trigger("File");
    await userEvent.click(file);
    await opened("File");
    await settle();

    const content = q("[data-slot=menubar-content]")!;
    expect(content.getAttribute("role")).toBe("menu");
    expect(content.getAttribute("aria-labelledby")).toBe(file.id);
    expect(file.getAttribute("aria-expanded")).toBe("true");
    expect(file.getAttribute("aria-controls")).toBe(content.id);
    expect(file.dataset.state).toBe("open");
    // a pointer open highlights no item
    expect(document.activeElement?.closest("[role=menuitem]:not([data-slot=menubar-trigger])")).toBeNull();
    expect(q("[data-highlighted]:not([data-slot=menubar-trigger])")).toBeNull();
    expect(q("[data-slot=menubar-shortcut]")!.getAttribute("dir")).toBe("ltr");
  });

  it("puts the trigger semantics on the child with as-child (reka-ui#2047)", async () => {
    mount(
      {
        render: () =>
          h(Menubar, { "aria-label": "App" }, () =>
            h(MenubarMenu, () => [
              h(MenubarTrigger, { asChild: true }, () => h("span", { class: "custom", tabindex: 0 }, "Custom")),
              h(MenubarContent, () => h(MenubarItem, () => "One")),
            ]),
          ),
      },
      { attachTo: document.body },
    );
    await nextTick();
    const custom = q(".custom")!;
    expect(custom.tagName).toBe("SPAN");
    expect(custom.dataset.slot).toBe("menubar-trigger");
    expect(custom.getAttribute("role")).toBe("menuitem");
    expect(custom.getAttribute("aria-haspopup")).toBe("menu");
    expect(custom.getAttribute("aria-expanded")).toBe("false");
    await userEvent.click(custom);
    await expect.poll(() => custom.getAttribute("aria-expanded")).toBe("true");
  });

  it("stays non-modal: no pointer lock, no scrim", async () => {
    renderMenubar();
    await userEvent.click(trigger("File"));
    await opened("File");
    await settle();
    expect(getComputedStyle(document.body).pointerEvents).not.toBe("none");
    expect(document.body.style.overflow).not.toBe("hidden");
    expect(q("[data-slot$=scrim]")).toBeNull();
    expect(trigger("Edit").closest("[aria-hidden=true]")).toBeNull();
  });
});

describe("Menubar v-model", () => {
  it("types and emits the open menu's value as a string", async () => {
    expectTypeOf<NonNullable<InstanceType<typeof Menubar>["$props"]["onUpdate:modelValue"]>>()
      .parameter(0)
      .toEqualTypeOf<string>();

    const values: string[] = [];
    renderMenubar({ root: { "onUpdate:modelValue": (value: string) => values.push(value) } });
    await userEvent.click(trigger("File"));
    await opened("File");
    await userEvent.keyboard("{Escape}");
    await opened();
    expect(values).toEqual(["file", ""]);
  });

  it("opens from defaultValue without being controlled", async () => {
    renderMenubar({ root: { defaultValue: "edit" } });
    await opened("Edit");
    // Regression: Reka left an empty aria-controls on a trigger whose menu was open on first render
    expect(trigger("Edit").getAttribute("aria-controls")).toBe(q("[data-slot=menubar-content]")!.id);
    expect(q("[data-slot=menubar-content]")!.id).not.toBe("");
    await userEvent.keyboard("{Escape}");
    await opened();
  });

  it("opens and switches menus from code", async () => {
    const open = ref("");
    mount(
      defineComponent({
        setup: () => () =>
          renderBar({
            modelValue: open.value,
            "onUpdate:modelValue": (value: string) => (open.value = value),
          }),
      }),
      { attachTo: document.body },
    );
    open.value = "file";
    await opened("File");
    open.value = "edit";
    await opened("Edit");
    await userEvent.click(document.body, { position: { x: 5, y: 400 } });
    await expect.poll(() => open.value).toBe("");
  });
});

const renderBar = (root: Record<string, unknown>) =>
  h(Menubar, { "aria-label": "App", ...root }, () => [
    h(MenubarMenu, { value: "file" }, () => [
      h(MenubarTrigger, () => "File"),
      h(MenubarContent, () => h(MenubarItem, () => "New")),
    ]),
    h(MenubarMenu, { value: "edit" }, () => [
      h(MenubarTrigger, () => "Edit"),
      h(MenubarContent, () => h(MenubarItem, () => "Undo")),
    ]),
  ]);

describe("Menubar pointer", () => {
  it("switches menus on hover once one is open, but never opens on hover alone", async () => {
    renderMenubar();
    await userEvent.hover(trigger("Edit"));
    await settle();
    expect(openMenus()).toEqual([]);

    await userEvent.click(trigger("File"));
    await opened("File");
    await userEvent.hover(trigger("Edit"));
    await opened("Edit");
    expect(trigger("File").dataset.state).toBe("closed");
  });

  // Regression: the closing menu saw the earlier menu take focus as focus outside and closed the whole bar
  it("switches back to an earlier menu on hover", async () => {
    renderMenubar();
    await userEvent.click(trigger("View"));
    await opened("View");
    await userEvent.hover(trigger("Edit"));
    await opened("Edit");
    await userEvent.hover(trigger("File"));
    await opened("File");
  });

  it("closes on an outside click without pulling focus back to the trigger", async () => {
    renderMenubar({
      after: () => [h("button", { id: "far", style: "position: fixed; bottom: 8px; right: 8px" }, "Far")],
    });
    await userEvent.click(trigger("File"));
    await opened("File");
    await userEvent.click(q("#far")!);
    await opened();
    await settle();
    expect(document.activeElement).toBe(q("#far"));
  });
});

describe("Menubar keyboard", () => {
  it("is one tab stop with arrow keys between triggers that wrap by default", async () => {
    renderMenubar();
    q("#before")!.focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(trigger("File"));
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(trigger("Edit"));
    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(trigger("View"));
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(trigger("File"));
    await userEvent.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(trigger("View"));
    await userEvent.keyboard("{Home}");
    expect(document.activeElement).toBe(trigger("File"));
    await userEvent.tab();
    expect(document.activeElement).toBe(q("#after"));
  });

  it("stops at the ends with loop off and skips a disabled trigger", async () => {
    renderMenubar({ root: { loop: false }, editDisabled: true });
    trigger("File").focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(trigger("View"));
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(trigger("View"));
    expect(trigger("Edit").hasAttribute("data-disabled")).toBe(true);
    expect((trigger("Edit") as HTMLButtonElement).disabled).toBe(true);
  });

  it.each(["{Enter}", " ", "{ArrowDown}"])("opens with %s and focuses the first item", async (key) => {
    renderMenubar();
    trigger("File").focus();
    await userEvent.keyboard(key);
    await focused(() => item("New tab"));
    expect(openMenus()).toEqual([trigger("File").id]);
  });

  it("moves through items, skipping disabled ones, and jumps with typeahead", async () => {
    renderMenubar();
    trigger("File").focus();
    await userEvent.keyboard("{Enter}");
    await focused(() => item("New tab"));
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(item("New window"));
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(item("Share"));
    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(item("Print"));
    await userEvent.keyboard("{Home}");
    expect(document.activeElement).toBe(item("New tab"));
    await userEvent.keyboard("p");
    expect(document.activeElement).toBe(item("Print"));
  });

  it("moves between menus with the left and right arrows", async () => {
    renderMenubar();
    trigger("File").focus();
    await userEvent.keyboard("{Enter}");
    await focused(() => item("New tab"));
    await userEvent.keyboard("{ArrowRight}");
    await opened("Edit");
    await gone(".file-menu");
    // Reka focuses the next menu itself, not its first item; ArrowDown takes it from there
    await focused(() => q(".edit-menu"));
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(item("Undo"));
    await userEvent.keyboard("{ArrowLeft}");
    await opened("File");
    await gone(".edit-menu");
    await focused(() => q(".file-menu"));
    await userEvent.keyboard("{ArrowLeft}");
    await opened("View");
  });

  it("opens a submenu with ArrowRight on its trigger instead of switching menus", async () => {
    renderMenubar();
    trigger("File").focus();
    await userEvent.keyboard("{Enter}");
    await focused(() => item("New tab"));
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(document.activeElement).toBe(item("Share"));
    await userEvent.keyboard("{ArrowRight}");
    await focused(() => item("Email link"));
    expect(openMenus()).toEqual([trigger("File").id]);
    expect(q("[data-slot=menubar-sub-content]")).not.toBeNull();

    await userEvent.keyboard("{ArrowLeft}");
    await expect.poll(() => q("[data-slot=menubar-sub-content]")).toBeNull();
    await focused(() => item("Share"));

    await userEvent.keyboard("{ArrowRight}");
    await focused(() => item("Email link"));
    await userEvent.keyboard("{ArrowRight}");
    await opened("Edit");
  });

  it("closes on Escape and gives focus back to the trigger", async () => {
    renderMenubar();
    trigger("Edit").focus();
    await userEvent.keyboard("{ArrowDown}");
    await focused(() => item("Undo"));
    await userEvent.keyboard("{Escape}");
    await opened();
    await focused(() => trigger("Edit"));
  });

  it("lets Tab leave an open menu (reka-ui#2296) to the next control after the bar", async () => {
    renderMenubar();
    trigger("View").focus();
    await userEvent.keyboard("{Enter}");
    await vi.waitFor(() => expect(document.activeElement?.closest("[data-slot=menubar-content]")).not.toBeNull());
    await userEvent.tab();
    await opened();
    await focused(() => q("#after"));
  });

  it("lets Shift+Tab leave an open submenu to the control before the bar", async () => {
    renderMenubar();
    trigger("File").focus();
    await userEvent.keyboard("{Enter}");
    await focused(() => item("New tab"));
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowRight}");
    await focused(() => item("Email link"));
    await userEvent.tab({ shift: true });
    await opened();
    await gone("[data-slot=menubar-sub-content]");
    await focused(() => q("#before"));
  });

  it("keeps ArrowUp on a closed trigger as Reka has it: nothing opens", async () => {
    renderMenubar();
    trigger("File").focus();
    await userEvent.keyboard("{ArrowUp}");
    await settle();
    expect(openMenus()).toEqual([]);
  });
});

describe("Menubar items", () => {
  it("fires select and closes the whole menubar", async () => {
    const chosen: string[] = [];
    const values: string[] = [];
    renderMenubar({
      item: { onSelect: () => chosen.push("new-tab") },
      root: { "onUpdate:modelValue": (value: string) => values.push(value) },
    });
    await userEvent.click(trigger("File"));
    await opened("File");
    await userEvent.click(item("New tab"));
    await opened();
    expect(chosen).toEqual(["new-tab"]);
    expect(values).toEqual(["file", ""]);
  });

  it("does not fire select on a disabled item", async () => {
    const chosen: string[] = [];
    mount(
      {
        render: () =>
          h(Menubar, { "aria-label": "App" }, () =>
            h(MenubarMenu, () => [
              h(MenubarTrigger, () => "File"),
              h(MenubarContent, () => [
                h(MenubarItem, { disabled: true, onSelect: () => chosen.push("disabled") }, () => "Incognito"),
              ]),
            ]),
          ),
      },
      { attachTo: document.body },
    );
    await userEvent.click(trigger("File"));
    await opened("File");
    const disabled = item("Incognito");
    expect(disabled.hasAttribute("data-disabled")).toBe(true);
    expect(disabled.getAttribute("aria-disabled")).toBe("true");
    expect(getComputedStyle(disabled).pointerEvents).toBe("none");
    // a click that gets past pointer-events, from a script or assistive technology
    disabled.click();
    await settle();
    expect(chosen).toEqual([]);
    expect(openMenus()).toEqual([trigger("File").id]);
  });

  it("binds checkbox items and radio groups with v-model", async () => {
    const state = reactive({ bookmarks: false, profile: "andy" });
    mount(
      defineComponent({
        setup: () => () =>
          h(Menubar, { "aria-label": "App" }, () =>
            viewMenu(state, (key, value) => Object.assign(state, { [key]: value })),
          ),
      }),
      { attachTo: document.body },
    );
    await userEvent.click(trigger("View"));
    await opened("View");
    const checkbox = q("[data-slot=menubar-checkbox-item]")!;
    expect(checkbox.getAttribute("role")).toBe("menuitemcheckbox");
    expect(checkbox.getAttribute("aria-checked")).toBe("false");
    expect(q("[data-slot=menubar-radio-item][data-state=checked]")!.textContent).toContain("Andy");
    expect(q("[data-slot=menubar-radio-group]")!.getAttribute("role")).toBe("group");

    await userEvent.click(checkbox);
    await expect.poll(() => state.bookmarks).toBe(true);
    await gone(".view-menu");

    await userEvent.click(trigger("View"));
    await opened("View");
    expect(q("[data-slot=menubar-checkbox-item]")!.getAttribute("aria-checked")).toBe("true");
    expect(q("[data-slot=menubar-checkbox-item] [data-slot=menubar-item-indicator]")).not.toBeNull();
    await userEvent.click(item("Benoit"));
    await expect.poll(() => state.profile).toBe("benoit");
  });

  it("marks the destructive variant and inset items", async () => {
    mount(
      {
        render: () =>
          h(Menubar, { "aria-label": "App" }, () =>
            h(MenubarMenu, () => [
              h(MenubarTrigger, () => "File"),
              h(MenubarContent, () => [
                h(MenubarItem, { inset: true }, () => "Inset"),
                h(MenubarItem, { variant: "destructive" }, () => "Delete"),
              ]),
            ]),
          ),
      },
      { attachTo: document.body },
    );
    await userEvent.click(trigger("File"));
    await opened("File");
    const [inset, destructive] = all("[data-slot=menubar-item]");
    expect(inset!.dataset.variant).toBe("default");
    expect(inset!.hasAttribute("data-inset")).toBe(true);
    expect(destructive!.dataset.variant).toBe("destructive");
    expect(getComputedStyle(destructive!).color).toBe(probe("text-destructive"));
    expect(getComputedStyle(inset!).color).not.toBe(probe("text-destructive"));
  });
});
