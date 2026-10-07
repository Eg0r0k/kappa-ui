import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNode, defineComponent, h, nextTick, ref } from "vue";

import { Menu, MenuItem, MenuSub, MenuSubContent, MenuSubTrigger } from "@/ui/menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

const settle = () => new Promise((resolve) => setTimeout(resolve, 250));

const clickAt = async (element: Element, button: "left" | "right" = "left") => {
  const rect = element.getBoundingClientRect();
  await userEvent.click(document.body, {
    position: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
    button,
    force: true,
  } as never);
  await settle();
};

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
    const wrapper = host(overlay.render);

    await overlay.open();
    expect(document.querySelector(`[data-slot=${overlay.content}]`)).not.toBeNull();
    expect(document.querySelector(`[data-slot=${overlay.scrim}]`)).not.toBeNull();

    await clickAt(byTest("auto"));
    expect(clicks).toEqual([]);
    await expect.poll(() => document.querySelector(`[data-slot=${overlay.content}]`)).toBeNull();
    await expect.poll(() => document.querySelector(`[data-slot=${overlay.scrim}]`)).toBeNull();

    await clickAt(byTest("auto"));
    expect(clicks).toEqual(["auto"]);
    wrapper.unmount();
  });
});

describe("modal scrim", () => {
  it("is left out of a non-modal popover, which lets outside clicks through", async () => {
    const wrapper = host(() =>
      h(Popover, () => [h(PopoverTrigger, { "data-test": "trigger" }, () => "Open"), h(PopoverContent, () => "Body")]),
    );

    await clickAt(byTest("trigger"));
    expect(document.querySelector("[data-slot=popover-content]")).not.toBeNull();
    expect(document.querySelector("[data-slot=popover-scrim]")).toBeNull();

    await clickAt(byTest("auto"));
    expect(clicks).toEqual(["auto"]);
    wrapper.unmount();
  });

  it("is left out of a menu with modal off", async () => {
    const wrapper = host(() =>
      h("button", { "data-test": "trigger" }, ["Open", h(Menu, { modal: false }, () => h(MenuItem, () => "Item"))]),
    );

    await clickAt(byTest("trigger"));
    expect(document.querySelector("[data-slot=menu]")).not.toBeNull();
    expect(document.querySelector("[data-slot=menu-scrim]")).toBeNull();
    wrapper.unmount();
  });

  it("does not linger after a select closes by choosing an option", async () => {
    const wrapper = host(overlays.select.render);

    await overlays.select.open();
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => document.querySelector("[data-slot=select-content]")).toBeNull();
    await expect.poll(() => document.querySelector("[data-slot=select-scrim]")).toBeNull();
    expect(byTest("trigger").textContent).toContain("b");
    wrapper.unmount();
  });

  it("stays single for a menu with an open submenu and closes both on an outside click", async () => {
    const wrapper = host(() =>
      h("button", { "data-test": "trigger" }, [
        "Open",
        h(Menu, () =>
          h(MenuSub, { defaultOpen: true }, () => [
            h(MenuSubTrigger, () => "More"),
            h(MenuSubContent, () => h(MenuItem, () => "Nested")),
          ]),
        ),
      ]),
    );

    await clickAt(byTest("trigger"));
    expect(document.querySelectorAll("[data-slot=menu-scrim]")).toHaveLength(1);

    await clickAt(byTest("auto"));
    expect(clicks).toEqual([]);
    await expect.poll(() => document.querySelector("[data-slot=menu]")).toBeNull();
    await expect.poll(() => document.querySelector("[data-slot=menu-sub-content]")).toBeNull();
    wrapper.unmount();
  });

  it("follows a controlled open state", async () => {
    const open = ref(false);
    const wrapper = host(() =>
      h(Popover, { modal: true, open: open.value, "onUpdate:open": (value: boolean) => (open.value = value) }, () => [
        h(PopoverTrigger, () => "Open"),
        h(PopoverContent, () => "Body"),
      ]),
    );

    open.value = true;
    await nextTick();
    await settle();
    expect(document.querySelector("[data-slot=popover-scrim]")).not.toBeNull();

    open.value = false;
    await nextTick();
    await expect.poll(() => document.querySelector("[data-slot=popover-scrim]")).toBeNull();
    wrapper.unmount();
  });
});
