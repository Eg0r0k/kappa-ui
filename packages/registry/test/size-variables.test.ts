import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";
import { h } from "vue";

import { Checkbox } from "@/ui/checkbox";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/ui/drawer";
import { DrawerMenu, DrawerMenuItem } from "@/ui/drawer-menu";
import { Radio, RadioGroup } from "@/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Switch } from "@/ui/switch";

const openSelect = (trigger: Record<string, unknown> = {}) =>
  mount(
    {
      render: () =>
        h(Select, { open: true }, () => [
          h(SelectTrigger, { "aria-label": "Role", ...trigger }, () => h(SelectValue)),
          h(SelectContent, () => h(SelectItem, { value: "a" }, () => "A")),
        ]),
    },
    { attachTo: document.body },
  );

const item = async () => {
  await expect.poll(() => document.querySelector("[data-slot=select-item]")).not.toBeNull();
  return getComputedStyle(document.querySelector("[data-slot=select-item]")!);
};

it("lets an unlayered rule keyed on slot and size retune one size of list", async () => {
  const rule = document.createElement("style");
  rule.textContent = "[data-slot='select-content'][data-size='md'] { --menu-item-height: 50px; }";
  document.head.append(rule);
  try {
    const md = openSelect();
    expect((await item()).minHeight).toBe("50px");
    md.unmount();
    document.body.innerHTML = "";

    openSelect({ size: "lg" });
    expect((await item()).minHeight).toBe("40px");
  } finally {
    rule.remove();
  }
});

it("lets an unlayered rule keyed on the slot alone retune every size of checkbox", () => {
  const rule = document.createElement("style");
  rule.textContent = "[data-slot='checkbox'] { --choice-size: 22px; }";
  document.head.append(rule);
  try {
    mount(
      {
        render: () => [
          h(Checkbox, { "aria-label": "A", size: "xs" }),
          h(Checkbox, { "aria-label": "B" }),
          h(Checkbox, { "aria-label": "C", size: "xl" }),
        ],
      },
      { attachTo: document.body },
    );
    const widths = [...document.querySelectorAll("[data-slot=checkbox]")].map(
      (box) => box.getBoundingClientRect().width,
    );

    expect(widths).toEqual([22, 22, 22]);
  } finally {
    rule.remove();
  }
});

it("lets an unlayered rule keyed on slot and size retune one size of checkbox, radio and switch", () => {
  const rule = document.createElement("style");
  rule.textContent = `
    [data-slot='checkbox'][data-size='md'], [data-slot='radio'][data-size='md'] { --choice-size: 22px; }
    [data-slot='switch'][data-size='md'] { --switch-h: 40px; }
  `;
  document.head.append(rule);
  try {
    mount(
      {
        render: () => [
          h(Checkbox, { "aria-label": "A" }),
          h(Checkbox, { "aria-label": "B", size: "lg" }),
          h(RadioGroup, { "aria-label": "C" }, () => [
            h(Radio, { value: "a", "aria-label": "A" }),
            h(Radio, { value: "b", "aria-label": "B", size: "lg" }),
          ]),
          h(Switch, { "aria-label": "D" }),
          h(Switch, { "aria-label": "E", size: "lg" }),
        ],
      },
      { attachTo: document.body },
    );
    const heights = (slot: string) =>
      [...document.querySelectorAll(`[data-slot=${slot}]`)].map((part) => part.getBoundingClientRect().height);

    expect(heights("checkbox")).toEqual([22, 20]);
    expect(heights("radio")).toEqual([22, 20]);
    expect(heights("switch")).toEqual([40, 28]);
  } finally {
    rule.remove();
  }
});

it("lets a class on DrawerMenu override the gap it derives from its padding", async () => {
  mount(
    {
      render: () =>
        h(Drawer, { open: true }, () =>
          h(DrawerContent, () => [
            h(DrawerHeader, () => h(DrawerTitle, () => "File")),
            h(DrawerMenu, { class: "[--menu-item-gap:--spacing(3)]" }, () => h(DrawerMenuItem, () => "Open")),
          ]),
        ),
    },
    { attachTo: document.body },
  );
  await expect.poll(() => document.querySelector("[data-slot=drawer-menu-item]")).not.toBeNull();
  const style = getComputedStyle(document.querySelector("[data-slot=drawer-menu-item]")!);

  expect([style.columnGap, style.paddingInlineStart]).toEqual(["12px", "16px"]);
});

it("lets a class on Checkbox and Switch override --choice-size and --switch-h", () => {
  mount(
    {
      render: () => [
        h(Checkbox, { "aria-label": "A", class: "[--choice-size:1.375rem]" }),
        h(Switch, { "aria-label": "B", class: "[--switch-h:2.5rem]" }),
      ],
    },
    { attachTo: document.body },
  );
  const box = (slot: string) => document.querySelector(`[data-slot=${slot}]`)!.getBoundingClientRect();

  expect([box("checkbox").width, box("checkbox").height]).toEqual([22, 22]);
  expect([box("switch").width, box("switch").height]).toEqual([65, 40]);
});
