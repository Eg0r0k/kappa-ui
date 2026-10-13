import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { h } from "vue";

import { Button } from "@/ui/button";
import { Switch } from "@/ui/switch";

const ring = (element: Element) => {
  const style = getComputedStyle(element);
  return [style.outlineStyle, style.outlineWidth, style.outlineOffset];
};

it("draws the focus ring as a 3px outline outside, leaving the box shadow alone", async () => {
  mount({ render: () => h(Button, { class: "shadow-sm" }, () => "Save") }, { attachTo: document.body });
  const button = document.querySelector("button")!;
  const shadow = getComputedStyle(button).boxShadow;
  expect(ring(button)[0]).toBe("none");
  await userEvent.tab();
  expect(document.activeElement).toBe(button);
  expect(ring(button)).toEqual(["solid", "3px", "0px"]);
  expect(getComputedStyle(button).boxShadow).toBe(shadow);
});

it("draws it inside for an inward ring", async () => {
  mount({ render: () => h(Button, { focusRing: "inward" }, () => "Save") }, { attachTo: document.body });
  await userEvent.tab();
  expect(ring(document.querySelector("button")!)).toEqual(["solid", "3px", "-3px"]);
});

it("rings other controls the same way", async () => {
  mount({ render: () => h(Switch) }, { attachTo: document.body });
  await userEvent.tab();
  expect(ring(document.querySelector("[data-slot=switch]")!)).toEqual(["solid", "3px", "0px"]);
});

it("takes the ring colour of a .dark island, not the page's", async () => {
  mount(
    {
      render: () =>
        h("div", [
          h(Button, { id: "light" }, () => "Light"),
          h("div", { class: "dark" }, [
            h(Button, { id: "dark" }, () => "Dark"),
            h("span", { id: "reference", style: "color: color-mix(in oklab, var(--ring) 50%, transparent)" }),
          ]),
        ]),
    },
    { attachTo: document.body },
  );
  const settled = (element: HTMLElement) => {
    for (const animation of element.getAnimations()) animation.finish();
    return getComputedStyle(element).outlineColor;
  };
  await userEvent.tab();
  const lightRing = settled(document.getElementById("light")!);
  await userEvent.tab();
  const darkRing = settled(document.getElementById("dark")!);
  const reference = getComputedStyle(document.getElementById("reference")!).color;
  expect(reference).not.toBe(lightRing);
  expect(darkRing).toBe(reference);
});
