import { mount } from "@vue/test-utils";
import { expect, it, onTestFinished } from "vitest";
import { h } from "vue";

import { Dialog, DialogContent, DialogTitle } from "@/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

const content = (slot: string) => document.querySelector<HTMLElement>(`[data-slot=${slot}]`);

const openSelectInDialog = async () => {
  mount(
    {
      render: () =>
        h(Dialog, { defaultOpen: true }, () =>
          h(DialogContent, () => [
            h(DialogTitle, () => "Invite"),
            h(Select, { defaultOpen: true, defaultValue: "viewer" }, () => [
              h(SelectTrigger, () => h(SelectValue)),
              h(SelectContent, () => ["viewer", "editor"].map((value) => h(SelectItem, { value }, () => value))),
            ]),
          ]),
        ),
    },
    { attachTo: document.body },
  );
  await expect.poll(() => content("select-content")).not.toBeNull();
  return { dialog: getComputedStyle(content("dialog-content")!), list: getComputedStyle(content("select-content")!) };
};

const theme = (dark: boolean, style = "") => {
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.setAttribute("style", style);
  onTestFinished(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.removeAttribute("style");
  });
};

it("lifts a list opened in a dialog a step above it in the dark theme, with an edge", async () => {
  theme(true);
  const { dialog, list } = await openSelectInDialog();

  expect(dialog.backgroundColor).toBe("oklch(0.205 0 0)");
  expect(list.backgroundColor).toBe("oklch(0.24 0 0)");
  expect(list.boxShadow).toContain("oklch(1 0 0 / 0.04) 0px 0px 0px 1px inset");
  expect(dialog.boxShadow).toContain("oklch(1 0 0 / 0.05) 0px 1px 0px 0px inset");
});

it("rings a list in the light theme, where both surfaces are white", async () => {
  theme(false);
  const { dialog, list } = await openSelectInDialog();

  expect([dialog.backgroundColor, list.backgroundColor]).toEqual(["oklch(1 0 0)", "oklch(1 0 0)"]);
  expect(list.boxShadow).toContain("oklch(0 0 0 / 0.06) 0px 0px 0px 1px");
});

it("falls back to the popover colour and the plain shadows in a theme without the surface tokens", async () => {
  theme(true, "--dialog: initial; --dialog-foreground: initial; --shadow-popover: initial; --shadow-dialog: initial");
  const { dialog, list } = await openSelectInDialog();
  const probe = document.createElement("div");
  probe.className = "shadow-shadow-lg";
  document.body.append(probe);

  expect(dialog.backgroundColor).toBe(list.backgroundColor);
  expect(list.boxShadow).toBe(getComputedStyle(probe).boxShadow);
});
