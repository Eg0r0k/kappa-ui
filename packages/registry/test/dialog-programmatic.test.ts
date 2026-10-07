import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type PropType, type VNodeChild, defineComponent, h, ref } from "vue";

import { Dialog, DialogContent, DialogHeader, DialogHost, DialogTitle, createDialogs, openDialog } from "@/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

const settle = () => new Promise((resolve) => setTimeout(resolve, 300));
const overlays = () => [...document.querySelectorAll<HTMLElement>("[data-slot=dialog-overlay]")];
const clear = "rgba(0, 0, 0, 0)";
const background = (element: HTMLElement) => getComputedStyle(element).backgroundColor;
const listbox = () => document.querySelector("[role=listbox]");
const focusInDialog = () => document.querySelector("[role=dialog]")?.contains(document.activeElement) ?? false;

const Sheet = defineComponent({
  props: { title: { type: String, default: "Sheet" }, body: Function as PropType<() => VNodeChild> },
  setup: (props) => () =>
    h(DialogContent, () => [h(DialogHeader, () => h(DialogTitle, () => props.title)), props.body?.()]),
});

const mountHost = (extra?: () => VNodeChild) =>
  mount(defineComponent({ setup: () => () => [extra?.(), h(DialogHost)] }), {
    attachTo: document.body,
    global: { plugins: [createDialogs()] },
  });

describe("programmatic dialogs", () => {
  it("dims the page with one scrim however many dialogs are stacked", async () => {
    mountHost();
    openDialog(Sheet, { title: "First" });
    await expect.poll(() => overlays().length).toBe(1);
    const second = openDialog(Sheet, { title: "Second" });
    await expect.poll(() => overlays().length).toBe(2);
    const [lower, upper] = overlays();
    const scrim = background(upper!);
    expect(scrim).not.toBe(clear);
    await expect.poll(() => background(lower!)).toBe(clear);

    second.dismiss();
    await expect.poll(() => overlays().length).toBe(1);
    await expect.poll(() => background(overlays()[0]!)).toBe(scrim);
  });

  it("dims the page once for nested declarative dialogs too", async () => {
    mount(
      defineComponent({
        setup: () => () =>
          h(Dialog, { open: true }, () =>
            h(DialogContent, () => [
              h(DialogTitle, () => "Outer"),
              h(Dialog, { open: true }, () => h(DialogContent, () => h(DialogTitle, () => "Inner"))),
            ]),
          ),
      }),
      { attachTo: document.body },
    );
    await expect.poll(() => overlays().length).toBe(2);
    const [lower, upper] = overlays();
    expect(background(upper!)).not.toBe(clear);
    await expect.poll(() => background(lower!)).toBe(clear);
  });

  it("lets a Select inside close first on Escape and keeps the dialog on a pick (D9, D10)", async () => {
    mountHost();
    const value = ref<string>();
    const handle = openDialog(Sheet, {
      title: "Role",
      body: () =>
        h(
          Select,
          { modelValue: value.value, "onUpdate:modelValue": (next: unknown) => (value.value = next as string) },
          () => [
            h(SelectTrigger, () => h(SelectValue, { placeholder: "Choose" })),
            h(SelectContent, () => ["viewer", "editor"].map((item) => h(SelectItem, { value: item }, () => item))),
          ],
        ),
    });
    const trigger = () => document.querySelector<HTMLElement>("[data-slot=select-trigger]")!;
    const option = (name: string) =>
      [...document.querySelectorAll<HTMLElement>("[role=option]")].find(
        (element) => element.textContent?.trim() === name,
      )!;
    await expect.poll(() => document.querySelector("[data-slot=select-trigger]")).not.toBeNull();

    await userEvent.click(trigger());
    await expect.poll(listbox).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect.poll(listbox).toBeNull();
    await settle();
    expect(handle.isOpen.value).toBe(true);

    await userEvent.click(trigger());
    await expect.poll(listbox).not.toBeNull();
    await userEvent.click(option("editor"));
    await expect.poll(() => value.value).toBe("editor");
    await expect.poll(listbox).toBeNull();
    await settle();
    expect(handle.isOpen.value).toBe(true);

    await userEvent.keyboard("{Escape}");
    expect(await handle).toEqual({ ok: false, reason: "escape" });
  });

  it("returns focus to the element that opened it, or to the body once that is gone (D14, D15)", async () => {
    const shown = ref(true);
    let handle: { dismiss: () => void } | undefined;
    mountHost(() =>
      shown.value
        ? h("button", { id: "opener", onClick: () => (handle = openDialog(Sheet, { title: "Focus" })) }, "Open")
        : null,
    );
    const opener = document.getElementById("opener")!;

    await userEvent.click(opener);
    await expect.poll(focusInDialog).toBe(true);
    handle!.dismiss();
    await expect.poll(() => document.activeElement).toBe(opener);

    await userEvent.click(opener);
    await expect.poll(focusInDialog).toBe(true);
    shown.value = false;
    handle!.dismiss();
    await expect.poll(() => document.querySelector("[role=dialog]")).toBeNull();
    expect(document.activeElement).toBe(document.body);
  });
});
