import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { defineComponent, h, ref } from "vue";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/ui/alert-dialog";
import { useConfirm } from "@/ui/confirm";
import { DialogHost, createDialogs } from "@/ui/dialog";

const settle = () => new Promise((resolve) => setTimeout(resolve, 300));
const content = () => document.querySelector<HTMLElement>("[data-slot=alert-dialog-content][data-state=open]");
const action = () => content()?.querySelector<HTMLButtonElement>("[data-slot=alert-dialog-action]") ?? null;
const cancel = () => content()?.querySelector<HTMLButtonElement>("[data-slot=alert-dialog-cancel]") ?? null;
const gone = () => expect.poll(() => document.querySelectorAll("[data-slot=alert-dialog-content]").length).toBe(0);

const mountHost = () => {
  const errors: unknown[] = [];
  mount(defineComponent({ setup: () => () => h(DialogHost) }), {
    attachTo: document.body,
    global: {
      plugins: [createDialogs()],
      config: { errorHandler: (error) => errors.push(error) },
    },
  });
  return { ...useConfirm(), errors };
};

describe("AlertDialog", () => {
  it("opens from its trigger, focuses Cancel, ignores outside presses and closes from either button", async () => {
    const open = ref(false);
    mount(
      defineComponent({
        setup: () => () =>
          h(AlertDialog, { open: open.value, "onUpdate:open": (value: boolean) => (open.value = value) }, () => [
            h(AlertDialogTrigger, () => "Delete"),
            h(AlertDialogContent, () => [
              h(AlertDialogHeader, () => [
                h(AlertDialogTitle, () => "Delete the file?"),
                h(AlertDialogDescription, () => "It cannot be restored."),
              ]),
              h(AlertDialogFooter, () => [
                h(AlertDialogCancel, () => "Cancel"),
                h(AlertDialogAction, { color: "destructive" }, () => "Delete"),
              ]),
            ]),
          ]),
      }),
      { attachTo: document.body },
    );

    await userEvent.click(document.querySelector<HTMLElement>("[data-slot=alert-dialog-trigger]")!);
    await vi.waitFor(() => expect(document.activeElement).toBe(cancel()));
    expect(content()!.getAttribute("role")).toBe("alertdialog");
    expect(cancel()!.dataset.variant).toBe("outline");
    expect(action()!.dataset.color).toBe("destructive");

    await userEvent.click(document.querySelector<HTMLElement>("[data-slot=dialog-overlay]")!, {
      position: { x: 5, y: 5 },
    } as never);
    await settle();
    expect(open.value).toBe(true);

    await userEvent.click(action()!);
    expect(open.value).toBe(false);
  });

  it("narrows to sm, centres the header and splits the footer", async () => {
    mount(
      defineComponent({
        setup: () => () =>
          h(AlertDialog, { defaultOpen: true }, () =>
            h(AlertDialogContent, { size: "sm" }, () => [
              h(AlertDialogHeader, () => h(AlertDialogTitle, () => "Sign out?")),
              h(AlertDialogFooter, () => [h(AlertDialogCancel, () => "Stay"), h(AlertDialogAction, () => "Sign out")]),
            ]),
          ),
      }),
      { attachTo: document.body },
    );
    await expect.poll(content).not.toBeNull();

    expect(content()!.dataset.size).toBe("sm");
    expect(content()!.offsetWidth).toBe(320);
    expect(getComputedStyle(document.querySelector("[data-slot=alert-dialog-header]")!).textAlign).toBe("center");
    expect(cancel()!.offsetWidth).toBe(action()!.offsetWidth);
  });

  it("is md, as wide as a dialog, by default", async () => {
    mount(
      defineComponent({
        setup: () => () =>
          h(AlertDialog, { defaultOpen: true }, () =>
            h(AlertDialogContent, () => [
              h(AlertDialogHeader, () => h(AlertDialogTitle, () => "Sign out?")),
              h(AlertDialogFooter, () => [h(AlertDialogCancel, () => "Stay"), h(AlertDialogAction, () => "Sign out")]),
            ]),
          ),
      }),
      { attachTo: document.body },
    );
    await expect.poll(content).not.toBeNull();

    expect(content()!.dataset.size).toBe("md");
    expect(getComputedStyle(content()!).maxWidth).toBe("512px");
    expect([action()!.dataset.size, cancel()!.dataset.size]).toEqual(["md", "md"]);
  });
});

describe("useConfirm", () => {
  it("resolves confirm with ok on the action, close-button on Cancel and escape on Escape", async () => {
    const { confirm } = mountHost();

    const accepted = confirm({ title: "Leave the page?" });
    await expect.poll(() => action()?.textContent?.trim()).toBe("Confirm");
    await userEvent.click(action()!);
    expect(await accepted).toEqual({ ok: true, value: undefined });
    await gone();

    const cancelled = confirm({ title: "Leave the page?", cancel: "Stay" });
    await expect.poll(() => cancel()?.textContent?.trim()).toBe("Stay");
    await userEvent.click(cancel()!);
    expect(await cancelled).toEqual({ ok: false, reason: "close-button" });
    await gone();

    const escaped = confirm({ title: "Leave the page?" });
    await expect.poll(content).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    expect(await escaped).toEqual({ ok: false, reason: "escape" });
  });

  it("waits for onConfirm, holding the dialog while it runs and keeping it open when it fails", async () => {
    const { confirm, errors } = mountHost();
    let finish: () => void = () => {};
    const onConfirm = vi
      .fn()
      .mockRejectedValueOnce(new Error("Network down"))
      .mockImplementationOnce(() => new Promise<void>((resolve) => (finish = resolve)));
    const handle = confirm({ title: "Delete project?", action: "Delete", color: "destructive", onConfirm });
    await expect.poll(action).not.toBeNull();

    await userEvent.click(action()!);
    await vi.waitFor(() => expect(errors).toEqual([new Error("Network down")]));
    await expect.poll(() => action()?.disabled).toBe(false);
    expect(handle.isOpen.value).toBe(true);

    await userEvent.click(action()!);
    await expect.poll(() => action()?.disabled).toBe(true);
    expect(cancel()!.disabled).toBe(true);
    expect(action()!.querySelector("[data-slot=spinner]")).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await settle();
    expect(handle.isOpen.value).toBe(true);

    finish();
    expect(await handle).toEqual({ ok: true, value: undefined });
    expect(onConfirm).toHaveBeenCalledTimes(2);
  });

  it("shows an alert with one button that focuses on open", async () => {
    const { alert } = mountHost();
    const handle = alert({ title: "Saved", description: "Your changes are live." });
    await vi.waitFor(() => expect(document.activeElement).toBe(action()));

    expect(document.querySelector("[data-slot=alert-dialog-cancel]")).toBeNull();
    await userEvent.keyboard("{Enter}");
    expect(await handle).toEqual({ ok: true, value: undefined });
  });

  it("prompts for a value, validates it and submits on Enter", async () => {
    const { prompt } = mountHost();
    const handle = prompt({
      title: "Rename",
      label: "Name",
      defaultValue: "Aurora",
      validate: (value) => (value.trim() ? undefined : "Enter a name."),
    });
    const input = () => content()?.querySelector<HTMLInputElement>("input") ?? null;
    await vi.waitFor(() => expect(document.activeElement).toBe(input()));

    expect(input()!.value).toBe("Aurora");
    await userEvent.clear(input()!);
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => document.querySelector("[data-slot=field-error]")?.textContent).toBe("Enter a name.");
    expect(handle.isOpen.value).toBe(true);
    expect(input()!.getAttribute("aria-invalid")).toBe("true");

    await userEvent.type(input()!, "Borealis");
    expect(document.querySelector("[data-slot=field-error]")).toBeNull();
    await userEvent.keyboard("{Enter}");
    expect(await handle).toEqual({ ok: true, value: "Borealis" });
  });

  it("labels the prompt's input with the title when it has no label", async () => {
    const { prompt } = mountHost();
    const handle = prompt({ title: "New folder" });
    await expect.poll(() => content()?.querySelector("input")).not.toBeNull();

    expect(content()!.querySelector("input")!.labels?.[0]?.textContent).toBe("New folder");
    await userEvent.click(cancel()!);
    expect(await handle).toEqual({ ok: false, reason: "close-button" });
  });
});
