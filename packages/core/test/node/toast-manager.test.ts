import { describe, expect, it, vi } from "vitest";
import { createApp } from "vue";

import { createToaster, useToast } from "../../src/toast/manager";

type Content = { title?: string; color?: string };

const setup = (options?: Parameters<typeof createToaster<Content>>[0]) => createToaster<Content>(options);

const flush = () => new Promise((resolve) => setTimeout(resolve));

describe("createToaster", () => {
  it("adds records with generated ids and keeps given ones", () => {
    const toaster = setup();
    const first = toaster.add({ title: "One" });
    const second = toaster.add({ title: "Two" });
    const own = toaster.add({ id: "saved", title: "Saved" });
    expect([first, second, own]).toEqual(["toast-1", "toast-2", "saved"]);
    expect(toaster.toasts.value.map((toast) => [toast.id, toast.title, toast.open])).toEqual([
      ["toast-1", "One", true],
      ["toast-2", "Two", true],
      ["saved", "Saved", true],
    ]);
  });

  it("updates a record when added with an existing id", () => {
    const toaster = setup();
    toaster.add({ id: "upload", title: "Uploading", color: "neutral" });
    expect(toaster.add({ id: "upload", title: "Uploaded" })).toBe("upload");
    expect(toaster.toasts.value).toHaveLength(1);
    expect(toaster.toasts.value[0]).toMatchObject({ id: "upload", title: "Uploaded", color: "neutral", open: true });
  });

  it("merges an update and ignores unknown ids", () => {
    const toaster = setup();
    const id = toaster.add({ title: "Saving", loading: true });
    toaster.update(id, { title: "Saved", loading: false });
    toaster.update("missing", { title: "Nope" });
    expect(toaster.toasts.value).toEqual([{ id, title: "Saved", loading: false, open: true }]);
  });

  it("drops at once when no toaster shows the group", () => {
    const toaster = setup();
    const onClose = vi.fn();
    const id = toaster.add({ title: "Hi", onClose });
    toaster.remove(id);
    expect(toaster.toasts.value).toEqual([]);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("only closes a shown record, and drops it once it is gone", () => {
    const toaster = setup();
    const onClose = vi.fn();
    toaster.register();
    const id = toaster.add({ title: "Hi", onClose });
    toaster.remove(id);
    expect(toaster.toasts.value[0]).toMatchObject({ id, open: false });
    expect(onClose).not.toHaveBeenCalled();
    toaster.drop(id);
    expect(toaster.toasts.value).toEqual([]);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("never drops an open record", () => {
    const toaster = setup();
    toaster.register();
    const id = toaster.add({ title: "Hi" });
    toaster.drop(id);
    expect(toaster.toasts.value).toHaveLength(1);
  });

  it("keeps a record added again while it was closing", () => {
    const toaster = setup();
    const onClose = vi.fn();
    toaster.register();
    const id = toaster.add({ id: "copy", title: "Copied", onClose });
    toaster.remove(id);
    toaster.add({ id: "copy", title: "Copied again" });
    toaster.drop(id);
    expect(toaster.toasts.value).toEqual([{ id: "copy", title: "Copied again", onClose, open: true }]);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("tracks hosts per group", () => {
    const toaster = setup();
    const unregister = toaster.register("uploads");
    const shown = toaster.add({ title: "Shown", group: "uploads" });
    const hidden = toaster.add({ title: "Hidden" });
    toaster.remove(shown);
    toaster.remove(hidden);
    expect(toaster.toasts.value.map((toast) => [toast.id, toast.open])).toEqual([[shown, false]]);
    unregister();
    expect(toaster.toasts.value).toEqual([]);
  });

  it("keeps open records of a group whose toaster goes away", () => {
    const toaster = setup();
    const unregister = toaster.register();
    const id = toaster.add({ title: "Waiting" });
    unregister();
    expect(toaster.toasts.value.map((toast) => toast.id)).toEqual([id]);
  });

  it("clears one group or all of them", () => {
    const toaster = setup();
    toaster.register();
    toaster.register("uploads");
    toaster.add({ id: "a" });
    toaster.add({ id: "b", group: "uploads" });
    toaster.clear("uploads");
    expect(toaster.toasts.value.map((toast) => [toast.id, toast.open])).toEqual([
      ["a", true],
      ["b", false],
    ]);
    toaster.clear();
    expect(toaster.toasts.value.map((toast) => toast.open)).toEqual([false, false]);
  });

  it("turns a resolved promise into its success toast", async () => {
    const toaster = setup({ promise: { success: { color: "success" }, error: { color: "destructive" } } });
    const id = toaster.promise(Promise.resolve("report.pdf"), {
      loading: { title: "Uploading" },
      success: (name) => ({ title: `Uploaded ${name}` }),
    });
    expect(toaster.toasts.value[0]).toMatchObject({ id, title: "Uploading", loading: true });
    await flush();
    expect(toaster.toasts.value[0]).toMatchObject({ id, title: "Uploaded report.pdf", color: "success", loading: false });
  });

  it("turns a rejected promise into its error toast", async () => {
    const toaster = setup({ promise: { success: { color: "success" }, error: { color: "destructive" } } });
    const id = toaster.promise(Promise.reject(new Error("offline")), {
      loading: { title: "Uploading" },
      error: { title: "Upload failed", color: "warning" },
    });
    await flush();
    expect(toaster.toasts.value[0]).toMatchObject({ id, title: "Upload failed", color: "warning", loading: false });
  });

  it("leaves a promise toast closed if it was closed meanwhile", async () => {
    const toaster = setup();
    toaster.register();
    const id = toaster.promise(Promise.resolve(1), { loading: { title: "Working" }, success: { title: "Done" } });
    toaster.remove(id);
    await flush();
    expect(toaster.toasts.value[0]).toMatchObject({ id, title: "Working", open: false });
  });

  it("removes a promise toast whose outcome has no toast", async () => {
    const toaster = setup();
    toaster.promise(Promise.reject(new Error("x")), { loading: { title: "Working" }, success: { title: "Done" } });
    await flush();
    expect(toaster.toasts.value).toEqual([]);
  });

  it("is installed on an app and found by useToast", () => {
    const toaster = setup();
    const app = createApp({});
    app.use(toaster);
    expect(app.runWithContext(() => useToast())).toBe(toaster);
  });

  it("says what is missing when nothing is installed", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(() => createApp({}).runWithContext(() => useToast())).toThrow(/createToaster/);
    warn.mockRestore();
  });
});
