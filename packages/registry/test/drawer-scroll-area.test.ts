import { mount } from "@vue/test-utils";
import { expect, it, vi } from "vitest";
import { h } from "vue";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/ui/drawer";
import { ScrollArea } from "@/ui/scroll-area";

import { pointer, wait } from "./pointer";

const area: Record<string, unknown> = { class: "min-h-0 flex-1" };

it("scrolls instead of moving the drawer when a mouse drags the scroll thumb", async () => {
  mount(
    {
      render: () =>
        h(Drawer, { open: true }, () =>
          h(DrawerContent, { class: "h-[60dvh]" }, () => [
            h(DrawerHeader, () => h(DrawerTitle, () => "Terms")),
            h(ScrollArea, area, { default: () => h("div", { style: "height: 2000px" }) }),
          ]),
        ),
    },
    { attachTo: document.body },
  );
  await wait(500);
  const panel = document.querySelector<HTMLElement>("[data-slot=drawer-content]")!;
  const viewport = document.querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")!;
  const thumb = document.querySelector<HTMLElement>("[data-slot=scroll-area-thumb][data-axis=vertical]")!;
  await vi.waitFor(() => expect(parseFloat(thumb.style.height)).toBeGreaterThan(0));
  expect(thumb.hasAttribute("data-no-drag")).toBe(true);
  const box = thumb.getBoundingClientRect();
  const x = box.x + box.width / 2;
  pointer("pointerdown", thumb, x, box.y + 5, "mouse");
  for (const distance of [15, 30, 45, 60]) {
    await wait(30);
    pointer("pointermove", thumb, x, box.y + 5 + distance, "mouse");
  }
  expect(viewport.scrollTop).toBeGreaterThan(0);
  expect(panel.style.getPropertyValue("--drawer-swipe-movement")).toBe("0px");
  pointer("pointerup", thumb, x, box.y + 65, "mouse");
});
