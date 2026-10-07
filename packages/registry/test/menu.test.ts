import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { defineComponent, h, ref } from "vue";

import { Menu, MenuCheckboxItem, MenuItem, MenuRadioGroup, MenuRadioItem, MenuShortcut } from "@/ui/menu";

const query = (selector: string) => document.querySelector(selector) as HTMLElement | null;
const opened = () => expect.poll(() => query("[data-slot=menu]")?.dataset.state).toBe("open");
const closed = () => expect.poll(() => query("[data-slot=menu]")).toBeNull();

describe("Menu items", () => {
  it("fires select on an item and closes", async () => {
    const chosen: string[] = [];
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h("button", [
            "Open",
            h(Menu, () => [
              h(MenuItem, { onSelect: () => chosen.push("rename") }, () => ["Rename", h(MenuShortcut, () => "⌘R")]),
              h(MenuItem, { variant: "destructive" }, () => "Delete"),
            ]),
          ]),
      }),
      { attachTo: document.body },
    );

    await userEvent.click(wrapper.get("button").element);
    await opened();
    expect(query("[data-slot=menu-item][data-variant=destructive]")).not.toBeNull();
    expect(query("[data-slot=menu-shortcut]")?.getAttribute("dir")).toBe("ltr");

    await userEvent.click(query("[data-slot=menu-item]")!);
    await closed();
    expect(chosen).toEqual(["rename"]);
  });

  it("binds checkbox items and radio groups with v-model", async () => {
    const panel = ref(false);
    const position = ref("top");
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h("button", [
            "Open",
            h(Menu, () => [
              h(
                MenuCheckboxItem,
                {
                  modelValue: panel.value,
                  "onUpdate:modelValue": (value: unknown) => (panel.value = value as boolean),
                },
                () => "Panel",
              ),
              h(
                MenuRadioGroup,
                {
                  modelValue: position.value,
                  "onUpdate:modelValue": (value: unknown) => (position.value = value as string),
                },
                () => [
                  h(MenuRadioItem, { value: "top" }, () => "Top"),
                  h(MenuRadioItem, { value: "bottom" }, () => "Bottom"),
                ],
              ),
            ]),
          ]),
      }),
      { attachTo: document.body },
    );

    await userEvent.click(wrapper.get("button").element);
    await opened();
    expect(query("[data-slot=menu-radio-item][data-state=checked]")?.textContent).toContain("Top");
    await userEvent.click(query("[data-slot=menu-checkbox-item]")!);
    await expect.poll(() => panel.value).toBe(true);
    await closed();

    await userEvent.click(wrapper.get("button").element);
    await opened();
    expect(query("[data-slot=menu-checkbox-item]")?.getAttribute("data-state")).toBe("checked");
    await userEvent.click(document.querySelectorAll<HTMLElement>("[data-slot=menu-radio-item]")[1]!);
    await expect.poll(() => position.value).toBe("bottom");
  });
});
