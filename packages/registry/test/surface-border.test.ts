import { mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import { h } from "vue";

import { Card } from "@/ui/card";
import { Menu, MenuItem } from "@/ui/menu";

afterEach(() => {
  document.body.innerHTML = "";
});

const borderColor = () => {
  const probe = document.createElement("div");
  probe.style.cssText = "border: 1px solid var(--border)";
  document.body.append(probe);
  return getComputedStyle(probe).borderTopColor;
};

it("draws cards with the surface border, --border by default", () => {
  const card = mount(Card, { attachTo: document.body, slots: { default: () => "Card" } }).element as HTMLElement;

  expect(getComputedStyle(card).boxShadow).toContain(`${borderColor()} 0px 0px 0px 1px`);
});

it("hides a card's edge with --surface-border: transparent, and the box never had a border to lose", () => {
  const card = mount(Card, {
    attachTo: document.body,
    attrs: { style: "--surface-border: transparent" },
    slots: { default: () => "Card" },
  }).element as HTMLElement;
  const style = getComputedStyle(card);

  expect(style.boxShadow).toContain("rgba(0, 0, 0, 0) 0px 0px 0px 1px");
  expect(style.borderTopWidth).toBe("0px");
});

it("draws menus with the surface border", async () => {
  document.documentElement.style.setProperty("--surface-border", "transparent");
  mount(
    {
      render: () => h("button", ["Open", h(Menu, { modelValue: true }, () => h(MenuItem, () => "Item"))]),
    },
    { attachTo: document.body },
  );

  await vi.waitFor(() => {
    const content = document.querySelector<HTMLElement>("[data-slot=menu]")!;
    expect(getComputedStyle(content).borderTopColor).toBe("rgba(0, 0, 0, 0)");
  });
  document.documentElement.style.removeProperty("--surface-border");
});
