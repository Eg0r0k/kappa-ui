import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNode, defineComponent, h, nextTick, ref } from "vue";

import { Menu, MenuItem, MenuSub, MenuSubContent, MenuSubTrigger } from "@/ui/menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

const clickAt = async (element: Element, button: "left" | "right" = "left") => {
  const rect = element.getBoundingClientRect();
  await userEvent.click(document.body, {
    position: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
    button,
    force: true,
  } as never);
};
const shown = (slot: string) => expect.poll(() => document.querySelector(`[data-slot=${slot}]`)).not.toBeNull();

const clicks: string[] = [];

const puncture = () =>
  h(
    "div",
    { style: "position:fixed;right:16px;bottom:16px;width:120px;height:48px;pointer-events:none" },
    h(
      "button",
      { "data-test": "auto", style: "pointer-events:auto;width:120px;height:48px", onClick: () => clicks.push("auto") },
      "auto",
    ),
  );

const host = (overlay: () => VNode) =>
  mount(defineComponent({ setup: () => () => h("div", [overlay(), puncture()]) }), { attachTo: document.body });

const byTest = (name: string) => document.querySelector(`[data-test=${name}]`) as HTMLElement;

const overlays: Record<string, { open: () => Promise<void>; render: () => VNode; content: string; scrim: string }> = {
  select: {
    render: () =>
      h(Select, { defaultValue: "a" }, () => [
        h(SelectTrigger, { "data-test": "trigger", class: "w-40" }, () => h(SelectValue)),
        h(SelectContent, () => ["a", "b"].map((value) => h(SelectItem, { value }, () => value))),
      ]),
    open: () => clickAt(byTest("trigger")),
    content: "select-content",
    scrim: "select-scrim",
  },
  menu: {
    render: () => h("button", { "data-test": "trigger" }, ["Open", h(Menu, () => h(MenuItem, () => "Item"))]),
    open: () => clickAt(byTest("trigger")),
    content: "menu",
    scrim: "menu-scrim",
  },
  "context menu": {
    render: () =>
      h("div", { "data-test": "trigger", style: "width:200px;height:80px" }, [
        "Area",
        h(Menu, { contextMenu: true }, () => h(MenuItem, () => "Item")),
      ]),
    open: () => clickAt(byTest("trigger"), "right"),
    content: "menu",
    scrim: "menu-scrim",
  },
  "modal popover": {
    render: () =>
      h(Popover, { modal: true }, () => [
        h(PopoverTrigger, { "data-test": "trigger" }, () => "Open"),
        h(PopoverContent, () => "Body"),
      ]),
    open: () => clickAt(byTest("trigger")),
    content: "popover-content",
    scrim: "popover-scrim",
  },
};

afterEach(() => {
  clicks.length = 0;
});

describe.each(Object.entries(overlays))("%s", (_, overlay) => {
  it("takes the first outside click with a scrim, so it only closes the overlay", async () => {
    host(overlay.render);

    await overlay.open();
    await shown(overlay.content);
    expect(document.querySelector(`[data-slot=${overlay.scrim}]`)).not.toBeNull();

    await clickAt(byTest("auto"));
    expect(clicks).toEqual([]);
    await expect.poll(() => document.querySelector(`[data-slot=${overlay.content}]`)).toBeNull();
    await expect.poll(() => document.querySelector(`[data-slot=${overlay.scrim}]`)).toBeNull();

    await clickAt(byTest("auto"));
    expect(clicks).toEqual(["auto"]);
  });
});

describe("modal scrim", () => {
  it("is left out of a non-modal popover, which lets outside clicks through", async () => {
    host(() =>
      h(Popover, () => [h(PopoverTrigger, { "data-test": "trigger" }, () => "Open"), h(PopoverContent, () => "Body")]),
    );

    await clickAt(byTest("trigger"));
    await shown("popover-content");
    expect(document.querySelector("[data-slot=popover-scrim]")).toBeNull();

    await clickAt(byTest("auto"));
    expect(clicks).toEqual(["auto"]);
  });

  it("is left out of a menu with modal off", async () => {
    host(() =>
      h("button", { "data-test": "trigger" }, ["Open", h(Menu, { modal: false }, () => h(MenuItem, () => "Item"))]),
    );

    await clickAt(byTest("trigger"));
    await shown("menu");
    expect(document.querySelector("[data-slot=menu-scrim]")).toBeNull();
  });

  it("does not linger after a select closes by choosing an option", async () => {
    host(overlays.select.render);

    await overlays.select.open();
    await shown("select-content");
    await vi.waitFor(() =>
      expect(document.querySelector("[data-slot=select-content]")?.contains(document.activeElement)).toBe(true),
    );
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => document.querySelector("[data-slot=select-content]")).toBeNull();
    await expect.poll(() => document.querySelector("[data-slot=select-scrim]")).toBeNull();
    expect(byTest("trigger").textContent).toContain("b");
  });

  it("stays single for a menu with an open submenu and closes both on an outside click", async () => {
    host(() =>
      h("button", { "data-test": "trigger" }, [
        "Open",
        h(Menu, () =>
          h(MenuSub, () => [h(MenuSubTrigger, () => "More"), h(MenuSubContent, () => h(MenuItem, () => "Nested"))]),
        ),
      ]),
    );

    await clickAt(byTest("trigger"));
    await shown("menu");
    await userEvent.hover(document.querySelector<HTMLElement>("[data-slot=menu-sub-trigger]")!);
    await shown("menu-sub-content");
    expect(document.querySelectorAll("[data-slot=menu-scrim]")).toHaveLength(1);

    await clickAt(byTest("auto"));
    expect(clicks).toEqual([]);
    await expect.poll(() => document.querySelector("[data-slot=menu]")).toBeNull();
    await expect.poll(() => document.querySelector("[data-slot=menu-sub-content]")).toBeNull();
  });

  it("follows a controlled open state", async () => {
    const open = ref(false);
    host(() =>
      h(Popover, { modal: true, open: open.value, "onUpdate:open": (value: boolean) => (open.value = value) }, () => [
        h(PopoverTrigger, () => "Open"),
        h(PopoverContent, () => "Body"),
      ]),
    );

    open.value = true;
    await shown("popover-scrim");

    open.value = false;
    await nextTick();
    await expect.poll(() => document.querySelector("[data-slot=popover-scrim]")).toBeNull();
  });
});
