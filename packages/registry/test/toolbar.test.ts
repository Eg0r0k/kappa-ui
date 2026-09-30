import { mount } from "@vue/test-utils";
import { afterEach, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type VNode, h, nextTick } from "vue";

import {
  Toolbar,
  ToolbarButton,
  ToolbarLink,
  ToolbarSeparator,
  ToolbarToggleGroup,
  ToolbarToggleItem,
} from "@/ui/toolbar";

afterEach(() => {
  document.body.innerHTML = "";
});

const render = (root: Record<string, unknown> = {}, children?: () => VNode[]) =>
  mount(
    {
      render: () =>
        h(
          Toolbar,
          root,
          children ??
            (() => [
              h(ToolbarToggleGroup, { type: "multiple", "aria-label": "Style" }, () => [
                h(ToolbarToggleItem, { value: "bold" }, () => "B"),
                h(ToolbarToggleItem, { value: "italic" }, () => "I"),
              ]),
              h(ToolbarSeparator),
              h(ToolbarButton, () => "Share"),
              h(ToolbarLink, { href: "#history" }, () => "Edited"),
            ]),
        ),
    },
    { attachTo: document.body },
  );

const q = (selector: string) => document.querySelector<HTMLElement>(selector)!;
const all = (selector: string) => [...document.querySelectorAll<HTMLElement>(selector)];
const focusables = () => all("[data-slot=toolbar] button, [data-slot=toolbar] a");

it("is a bordered toolbar with roving focus over its buttons and links", async () => {
  render();
  await nextTick();
  const toolbar = q("[data-slot=toolbar]");
  expect(toolbar.getAttribute("role")).toBe("toolbar");
  expect(toolbar.getAttribute("aria-orientation")).toBe("horizontal");
  expect(toolbar.dataset.variant).toBe("outline");
  expect(getComputedStyle(toolbar).borderTopWidth).toBe("1px");
  expect(toolbar.tabIndex).toBe(0);
  expect(focusables().map((element) => element.tabIndex)).toEqual([-1, -1, -1, -1]);

  focusables()[0]!.focus();
  await nextTick();
  expect(focusables().map((element) => element.tabIndex)).toEqual([0, -1, -1, -1]);
  await userEvent.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(focusables()[1]);
  await userEvent.keyboard("{End}");
  expect(document.activeElement).toBe(focusables()[3]);
  await userEvent.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(focusables()[0]);
});

it("draws the ghost variant without a frame", () => {
  render({ variant: "ghost" });
  const toolbar = q("[data-slot=toolbar]");
  expect(toolbar.dataset.variant).toBe("ghost");
  expect(getComputedStyle(toolbar).borderTopWidth).toBe("0px");
});

it("renders buttons and links as kappa buttons", () => {
  render();
  const button = q("[data-slot=toolbar-button]");
  expect(button.tagName).toBe("BUTTON");
  expect(button.dataset.variant).toBe("ghost");
  expect(button.dataset.size).toBe("sm");
  const link = q("[data-slot=toolbar-link]");
  expect(link.tagName).toBe("A");
  expect(link.getAttribute("href")).toBe("#history");
  expect(link.dataset.variant).toBe("link");
});

it("toggles items in the toggle group with the toggle look", async () => {
  render();
  const [bold, italic] = all("[data-slot=toolbar-toggle-item]");
  expect(bold!.dataset.state).toBe("off");
  expect(bold!.className).toContain("data-[state=on]:bg-tone-soft");
  await userEvent.click(bold!);
  await userEvent.click(italic!);
  expect(bold!.dataset.state).toBe("on");
  expect(italic!.dataset.state).toBe("on");
  expect(q("[data-slot=toolbar-toggle-group]").getAttribute("role")).toBe("group");
});

it("draws the separator across the other axis of the toolbar", () => {
  render();
  let separator = q("[data-slot=toolbar-separator]").getBoundingClientRect();
  expect(separator.width).toBe(1);
  expect(separator.height).toBeGreaterThan(20);
  document.body.innerHTML = "";

  render({ orientation: "vertical" });
  expect(q("[data-slot=toolbar]").getAttribute("aria-orientation")).toBe("vertical");
  separator = q("[data-slot=toolbar-separator]").getBoundingClientRect();
  expect(separator.height).toBe(1);
  expect(separator.width).toBeGreaterThan(20);
});

it("moves focus with the up and down arrows when vertical", async () => {
  render({ orientation: "vertical" });
  focusables()[0]!.focus();
  await userEvent.keyboard("{ArrowDown}");
  expect(document.activeElement).toBe(focusables()[1]);
});
