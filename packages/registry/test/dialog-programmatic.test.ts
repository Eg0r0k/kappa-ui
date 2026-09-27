import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { type PropType, type VNodeChild, defineComponent, h, ref } from "vue";

import { Dialog, DialogContent, DialogHeader, DialogHost, DialogTitle, createDialogs, openDialog } from "@/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

const settle = () => new Promise((resolve) => setTimeout(resolve, 300));
const overlays = () => [...document.querySelectorAll<HTMLElement>("[data-slot=dialog-overlay]")];
const clear = "rgba(0, 0, 0, 0)";
const background = (element: HTMLElement) => getComputedStyle(element).backgroundColor;

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

afterEach(() => {
  document.body.innerHTML = "";
  document.body.removeAttribute("style");
});

enableAutoUnmount(afterEach);

describe("programmatic dialogs", () => {
  it("dims the page with one scrim however many dialogs are stacked", async () => {
    mountHost();
    const first = openDialog(Sheet, { title: "First" });
    await settle();
    const second = openDialog(Sheet, { title: "Second" });
    await settle();
    const [lower, upper] = overlays();
    expect(background(lower!)).toBe(clear);
    expect(background(upper!)).not.toBe(clear);

    second.dismiss();
    await settle();
    expect(overlays()).toHaveLength(1);
    expect(background(overlays()[0]!)).not.toBe(clear);
    first.dismiss();
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
    await settle();
    const [lower, upper] = overlays();
    expect(background(lower!)).toBe(clear);
    expect(background(upper!)).not.toBe(clear);
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
    await settle();
    const trigger = () => document.querySelector<HTMLElement>("[data-slot=select-trigger]")!;

    await userEvent.click(trigger());
    await settle();
    expect(document.querySelector("[role=listbox]")).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await settle();
    expect(document.querySelector("[role=listbox]")).toBeNull();
    expect(handle.isOpen.value).toBe(true);

    await userEvent.click(trigger());
    await settle();
    await userEvent.click(document.querySelector<HTMLElement>("[role=option]:nth-child(2)")!);
    await settle();
    expect(value.value).toBe("editor");
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
    await settle();
    expect(document.activeElement).not.toBe(opener);
    handle!.dismiss();
    await settle();
    expect(document.activeElement).toBe(opener);

    await userEvent.click(opener);
    await settle();
    shown.value = false;
    handle!.dismiss();
    await settle();
    expect(document.activeElement).toBe(document.body);
  });
});
