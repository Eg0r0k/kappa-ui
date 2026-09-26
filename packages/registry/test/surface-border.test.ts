import { mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import { h } from "vue";

import { Card } from "@/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";

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

  expect(getComputedStyle(card).borderTopColor).toBe(borderColor());
});

it("hides a card's border with --surface-border: transparent and keeps its width", () => {
  const card = mount(Card, {
    attachTo: document.body,
    attrs: { style: "--surface-border: transparent" },
    slots: { default: () => "Card" },
  }).element as HTMLElement;
  const style = getComputedStyle(card);

  expect(style.borderTopColor).toBe("rgba(0, 0, 0, 0)");
  expect(style.borderTopWidth).toBe("1px");
});

it("draws menus with the surface border", async () => {
  document.documentElement.style.setProperty("--surface-border", "transparent");
  mount(
    {
      render: () =>
        h(DropdownMenu, { defaultOpen: true }, () => [
          h(DropdownMenuTrigger, () => "Open"),
          h(DropdownMenuContent, () => h(DropdownMenuItem, () => "Item")),
        ]),
    },
    { attachTo: document.body },
  );

  await vi.waitFor(() => {
    const content = document.querySelector<HTMLElement>("[data-slot=dropdown-menu-content]")!;
    expect(getComputedStyle(content).borderTopColor).toBe("rgba(0, 0, 0, 0)");
  });
  document.documentElement.style.removeProperty("--surface-border");
});
