import { mount } from "@vue/test-utils";
import { AlertDialogCancel } from "reka-ui";
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { defineComponent, h } from "vue";

import {
  AlertDialogContent,
  DialogHost,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  createDialogs,
  openDialog,
  useDialogContext,
} from "../../src/dialog";

const settle = () => new Promise((resolve) => setTimeout(resolve, 50));

const Alert = defineComponent({
  props: { busy: Boolean, titled: { type: Boolean, default: true } },
  setup: (props) => {
    const { close, loading } = useDialogContext();
    if (props.busy) loading.value = true;
    return () =>
      h(DialogPortal, () => [
        h(DialogOverlay, { "data-test": "overlay", style: { position: "fixed", inset: "0" } }),
        h(AlertDialogContent, { style: { position: "fixed", top: "40%", left: "40%" } }, () => [
          props.titled ? h(DialogTitle, () => "Delete?") : null,
          h("button", { "data-test": "ok", onClick: () => close() }, "Delete"),
          h(AlertDialogCancel, { "data-test": "cancel" }, () => "Cancel"),
        ]),
      ]);
  },
});

const mountHost = () => {
  const dialogs = createDialogs();
  mount(defineComponent({ setup: () => () => h(DialogHost) }), {
    attachTo: document.body,
    global: { plugins: [dialogs] },
  });
  return dialogs;
};

const cancel = () => document.querySelector<HTMLElement>("[data-test=cancel]")!;
const alertDialog = () => document.querySelector<HTMLElement>("[role=alertdialog]");
const focusedOnCancel = () => expect.poll(() => document.activeElement?.getAttribute("data-test")).toBe("cancel");
const pressOutside = async () => {
  await userEvent.click(document.querySelector<HTMLElement>("[data-test=overlay]")!, {
    position: { x: 5, y: 5 },
  } as never);
  await settle();
};

describe("AlertDialogContent", () => {
  it("opens as an alertdialog with focus on Cancel and ignores outside presses", async () => {
    mountHost();
    const handle = openDialog(Alert);
    await focusedOnCancel();

    expect(alertDialog()).not.toBeNull();
    await pressOutside();
    expect(handle.isOpen.value).toBe(true);

    await userEvent.click(cancel());
    expect(await handle).toEqual({ ok: false, reason: "close-button" });
  });

  it("reports Escape and resolves the value from code", async () => {
    const dialogs = mountHost();
    const escaped = openDialog(Alert);
    await focusedOnCancel();
    await userEvent.keyboard("{Escape}");
    expect(await escaped).toEqual({ ok: false, reason: "escape" });

    const confirmed = openDialog(Alert);
    await focusedOnCancel();
    await userEvent.click(document.querySelector<HTMLElement>("[data-test=ok]")!);
    expect(await confirmed).toEqual({ ok: true, value: undefined });
    await expect.poll(() => dialogs.stack.value).toHaveLength(0);
  });

  it("holds the dialog open while loading, against Escape and Cancel", async () => {
    mountHost();
    const handle = openDialog(Alert, { busy: true });
    await expect.poll(alertDialog).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await userEvent.click(cancel());
    await settle();
    expect(handle.isOpen.value).toBe(true);

    handle.dismiss();
    expect(await handle).toEqual({ ok: false, reason: "programmatic" });
  });

  it("names itself with a hidden title when it renders none", async () => {
    mountHost();
    openDialog(Alert, { titled: false });
    await expect.poll(alertDialog).not.toBeNull();
    const dialog = alertDialog()!;
    const title = document.getElementById(dialog.getAttribute("aria-labelledby")!);

    expect(dialog.contains(title)).toBe(true);
    expect(title?.textContent).toBe("");
  });
});
