import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";
import { h } from "vue";

import { Button } from "@/ui/button";
import { Kbd } from "@/ui/kbd";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/ui/tooltip";

const render = (props: Record<string, unknown> = {}) =>
  mount({ render: () => h(Kbd, props, () => "K") }, { attachTo: document.body });

const kbd = () => document.querySelector<HTMLElement>("[data-slot=kbd]")!;

it("keeps its size at md by default", () => {
  render();
  expect(kbd().dataset.size).toBe("md");
  expect(kbd().getBoundingClientRect().height).toBe(20);
});

it.each([
  ["xs", 16],
  ["sm", 18],
  ["md", 20],
  ["lg", 24],
  ["xl", 28],
] as const)("at size %s is %ipx tall, and at least as wide", (size, height) => {
  render({ size });
  const box = kbd().getBoundingClientRect();
  expect(kbd().dataset.size).toBe(size);
  expect(box.height).toBe(height);
  expect(box.width).toBeGreaterThanOrEqual(height);
});

it("takes the button's colour inside a button, a tooltip trigger's included", () => {
  mount(
    {
      render: () =>
        h(TooltipProvider, () => [
          h(Kbd, { id: "bare" }, () => "S"),
          h(Button, () => ["Save ", h(Kbd, { id: "in-button" }, () => "S")]),
          h(Tooltip, () => [
            h(TooltipTrigger, { asChild: true }, () =>
              h(Button, () => ["Save ", h(Kbd, { id: "in-trigger" }, () => "S")]),
            ),
            h(TooltipContent, () => "Save"),
          ]),
        ]),
    },
    { attachTo: document.body },
  );
  const background = (id: string) => getComputedStyle(document.getElementById(id)!).backgroundColor;
  expect(background("in-button")).not.toBe(background("bare"));
  expect(background("in-trigger")).toBe(background("in-button"));
});
