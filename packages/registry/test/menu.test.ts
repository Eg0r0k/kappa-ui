import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { defineComponent, h, ref } from "vue";

import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";

const settle = () => new Promise((resolve) => setTimeout(resolve, 200));
const query = (selector: string) => document.querySelector(selector) as HTMLElement | null;

afterEach(() => {
  document.body.innerHTML = "";
});

describe("DropdownMenu", () => {
  it("fires select on an item and closes", async () => {
    const chosen: string[] = [];
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(DropdownMenu, () => [
            h(DropdownMenuTrigger, () => "Open"),
            h(DropdownMenuContent, () => [
              h(DropdownMenuItem, { onSelect: () => chosen.push("rename") }, () => [
                "Rename",
                h(DropdownMenuShortcut, () => "⌘R"),
              ]),
              h(DropdownMenuItem, { variant: "destructive" }, () => "Delete"),
            ]),
          ]),
      }),
      { attachTo: document.body },
    );

    await userEvent.click(wrapper.get("button").element);
    await settle();
    expect(query("[data-slot=dropdown-menu-item][data-variant=destructive]")).not.toBeNull();
    expect(query("[data-slot=dropdown-menu-shortcut]")?.getAttribute("dir")).toBe("ltr");

    await userEvent.click(query("[data-slot=dropdown-menu-item]")!);
    await settle();
    expect(chosen).toEqual(["rename"]);
    await expect.poll(() => query("[data-slot=dropdown-menu-content]")).toBeNull();
    wrapper.unmount();
  });

  it("binds checkbox items and radio groups with v-model", async () => {
    const panel = ref(false);
    const position = ref("top");
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(DropdownMenu, () => [
            h(DropdownMenuTrigger, () => "Open"),
            h(DropdownMenuContent, () => [
              h(
                DropdownMenuCheckboxItem,
                {
                  modelValue: panel.value,
                  "onUpdate:modelValue": (value: unknown) => (panel.value = value as boolean),
                },
                () => "Panel",
              ),
              h(
                DropdownMenuRadioGroup,
                {
                  modelValue: position.value,
                  "onUpdate:modelValue": (value: unknown) => (position.value = value as string),
                },
                () => [
                  h(DropdownMenuRadioItem, { value: "top" }, () => "Top"),
                  h(DropdownMenuRadioItem, { value: "bottom" }, () => "Bottom"),
                ],
              ),
            ]),
          ]),
      }),
      { attachTo: document.body },
    );

    await userEvent.click(wrapper.get("button").element);
    await settle();
    expect(query("[data-slot=dropdown-menu-radio-item][data-state=checked]")?.textContent).toContain("Top");
    await userEvent.click(query("[data-slot=dropdown-menu-checkbox-item]")!);
    await settle();
    expect(panel.value).toBe(true);

    await userEvent.click(wrapper.get("button").element);
    await settle();
    expect(query("[data-slot=dropdown-menu-checkbox-item]")?.getAttribute("data-state")).toBe("checked");
    await userEvent.click(document.querySelectorAll<HTMLElement>("[data-slot=dropdown-menu-radio-item]")[1]!);
    await settle();
    expect(position.value).toBe("bottom");
    wrapper.unmount();
  });
});

describe("ContextMenu", () => {
  it("opens where the area is right-clicked", async () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(ContextMenu, () => [
            h(ContextMenuTrigger, { style: "display:block;width:200px;height:100px" }, () => "Area"),
            h(ContextMenuContent, () => h(ContextMenuItem, () => "Copy")),
          ]),
      }),
      { attachTo: document.body },
    );
    const area = wrapper.get("[data-slot=context-menu-trigger]").element;

    await userEvent.click(area, { button: "right", position: { x: 150, y: 60 } } as never);
    await settle();
    const content = query("[data-slot=context-menu-content]");
    const areaBox = area.getBoundingClientRect();

    expect(content).not.toBeNull();
    expect(Math.round(content!.getBoundingClientRect().left)).toBeGreaterThanOrEqual(
      Math.round(areaBox.left + 150) - 1,
    );
    wrapper.unmount();
  });
});
