import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { h } from "vue";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/ui/hover-card";

const render = (props: Record<string, unknown> = {}) =>
  mount(
    {
      render: () =>
        h(HoverCard, { openDelay: 0, closeDelay: 0, ...props }, () => [
          h(HoverCardTrigger, { href: "#" }, () => "@kappa"),
          h(HoverCardContent, { class: "w-80" }, () => "Profile"),
        ]),
    },
    { attachTo: document.body },
  );

const content = () => document.querySelector<HTMLElement>("[data-slot=hover-card-content]");

it("opens on hover and closes on leave", async () => {
  render();
  const trigger = document.querySelector<HTMLElement>("[data-slot=hover-card-trigger]")!;
  expect(trigger.tagName).toBe("A");
  expect(content()).toBeNull();
  await userEvent.hover(trigger);
  await expect.poll(() => content()?.textContent).toBe("Profile");
  await userEvent.unhover(trigger);
  await expect.poll(() => content()).toBeNull();
});

it("draws the popover surface and merges the class", async () => {
  render({ defaultOpen: true });
  await expect.poll(() => content()).not.toBeNull();
  const panel = content()!;
  expect(panel.className).toContain("bg-popover");
  expect(panel.className).toContain("shadow-shadow-lg");
  expect(panel.className).toContain("w-80");
  expect(panel.className).not.toContain("w-64");
  expect(panel.dataset.state).toBe("open");
});
