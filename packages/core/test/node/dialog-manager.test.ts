import { beforeEach, describe, expect, it, vi } from "vitest";
import { type PropType, createApp, defineComponent, h } from "vue";

import { type DialogStore, closeAllDialogs, createDialogs, defineDialog, openDialog } from "../../src/dialog/manager";

const Card = defineComponent({
  props: { title: String, note: String, tags: Array as PropType<string[]> },
  setup: () => () => h("div"),
});

const setup = ({ host = true } = {}) => {
  const store = createDialogs() as DialogStore;
  createApp({}).use(store);
  if (host) store.register(Symbol("host"));
  return store;
};

const top = (store: DialogStore) => store.entries[store.entries.length - 1]!;

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("openDialog", () => {
  it("resolves close with its value, then leaves the stack after the exit (L1)", async () => {
    const store = setup();
    const handle = openDialog<number>(Card, { title: "Rename" });
    const entry = top(store);
    expect(entry.props).toEqual({ title: "Rename" });
    expect(store.stack.value).toHaveLength(1);
    expect(handle.isOpen.value).toBe(true);
    store.mountContent(entry);

    handle.close(42);
    expect(await handle).toEqual({ ok: true, value: 42 });
    expect(handle.isOpen.value).toBe(false);
    expect(store.entries).toHaveLength(1);

    store.afterLeave(entry);
    expect(store.entries).toHaveLength(0);
  });

  it("resolves dismiss as programmatic (L2)", async () => {
    setup();
    const handle = openDialog(Card);
    handle.dismiss();
    expect(await handle).toEqual({ ok: false, reason: "programmatic" });
  });

  it("keeps the first outcome and ignores later ones (L3, L4, L5, L11)", async () => {
    const store = setup();
    const closedTwice = openDialog<number>(Card);
    closedTwice.close(1);
    closedTwice.close(2);
    closedTwice.dismiss();
    const dismissedFirst = openDialog<number>(Card);
    dismissedFirst.dismiss();
    dismissedFirst.close(1);
    const closedInside = openDialog<number>(Card);
    store.close(top(store), 3);
    closedInside.dismiss();

    expect(await Promise.all([closedTwice, dismissedFirst, closedInside])).toEqual([
      { ok: true, value: 1 },
      { ok: false, reason: "programmatic" },
      { ok: true, value: 3 },
    ]);
  });

  it.each([0, false, null, undefined, ""])("resolves close(%s) as a value (L13)", async (value) => {
    setup();
    const handle = openDialog<unknown>(Card);
    handle.close(value);
    expect(await handle).toEqual({ ok: true, value });
  });

  it("drops a dialog closed before it rendered any content (L7)", async () => {
    const store = setup();
    const handle = openDialog(Card);
    handle.close();
    expect(store.entries).toHaveLength(0);
    expect(await handle).toEqual({ ok: true, value: undefined });
  });

  it("drops a closed dialog when its content unmounts before the exit ends", () => {
    const store = setup();
    const handle = openDialog(Card);
    const entry = top(store);
    store.mountContent(entry);
    handle.dismiss();
    store.unmountContent(entry);
    expect(store.entries).toHaveLength(0);
  });

  it("resolves no-host at once and warns when no host is mounted (C5, C6)", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const store = setup({ host: false });
    const handle = openDialog(Card);
    expect(await handle).toEqual({ ok: false, reason: "no-host" });
    expect(handle.isOpen.value).toBe(false);
    handle.close();
    handle.dismiss();
    handle.patch({ title: "Ignored" });
    expect(store.entries).toHaveLength(0);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("DialogHost"));
  });

  it("closes on Reka's request with the recorded reason, or as the close button (D1, D12)", async () => {
    const store = setup();
    const escaped = openDialog(Card);
    top(store).reason = "escape";
    store.requestClose(top(store));
    const clicked = openDialog(Card);
    store.requestClose(top(store));

    expect(await escaped).toEqual({ ok: false, reason: "escape" });
    expect(await clicked).toEqual({ ok: false, reason: "close-button" });
  });

  it("ignores Reka's request while loading but not a close from code, and clears loading (F4, F5, F6)", async () => {
    const store = setup();
    const handle = openDialog(Card);
    const entry = top(store);
    entry.loading = true;
    store.requestClose(entry);
    expect(handle.isOpen.value).toBe(true);

    handle.dismiss();
    expect(await handle).toEqual({ ok: false, reason: "programmatic" });
    expect(entry.loading).toBe(false);
  });

  it("patches props shallowly and replaces arrays (P4, P5)", () => {
    const store = setup();
    const handle = openDialog(Card, { title: "A", tags: ["a", "b", "c"] });
    handle.patch({ tags: ["x"] });
    handle.patch({ note: "n" });
    expect(top(store).props).toEqual({ title: "A", tags: ["x"], note: "n" });
  });

  it("warns and changes nothing when patching a closed dialog (P10)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const store = setup();
    const handle = openDialog(Card, { title: "A" });
    const entry = top(store);
    store.mountContent(entry);
    handle.dismiss();
    handle.patch({ title: "B" });
    expect(entry.props).toEqual({ title: "A" });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("patch()"));
  });
});

describe("closeAllDialogs", () => {
  it("settles every open dialog with close-all, including one closing all again from its result (L8, S6, S7)", async () => {
    setup();
    const first = openDialog(Card);
    const again = first.then(() => closeAllDialogs());
    const second = openDialog(Card);
    closeAllDialogs();

    expect(await Promise.all([first, second])).toEqual([
      { ok: false, reason: "close-all" },
      { ok: false, reason: "close-all" },
    ]);
    await again;
  });
});

describe("defineDialog", () => {
  it("opens with its default props and the props given (P1, P2)", () => {
    const store = setup();
    const card = defineDialog(Card, { props: { title: "Default" } });
    card.open({ note: "given" });
    expect(top(store).props).toEqual({ title: "Default", note: "given" });

    card.dismiss();
    card.open();
    expect(top(store).props).toEqual({ title: "Default" });
  });

  it("returns the open handle instead of opening a second instance (S8)", () => {
    const store = setup();
    const card = defineDialog(Card);
    const first = card.open({ title: "A" });
    const second = card.open({ title: "B" });
    expect(second).toBe(first);
    expect(store.entries).toHaveLength(1);
    expect(top(store).props).toEqual({ title: "A" });
  });

  it("starts a reopen from the defaults, dropping earlier props and patches (P3)", () => {
    const store = setup();
    const card = defineDialog(Card, { props: { title: "Default" } });
    const handle = card.open({ note: "first" });
    handle.patch({ tags: ["a"] });
    store.mountContent(top(store));
    handle.close();
    card.open();
    expect(top(store).props).toEqual({ title: "Default" });
  });

  it("reuses an instance that is still leaving, with a promise of its own (A3)", async () => {
    const store = setup();
    const card = defineDialog(Card);
    const first = card.open<number>();
    const entry = top(store);
    store.mountContent(entry);
    first.close(1);

    const second = card.open<number>();
    expect(second).not.toBe(first);
    expect(top(store)).toBe(entry);
    expect(store.entries).toHaveLength(1);
    store.afterLeave(entry);
    expect(store.entries).toHaveLength(1);

    first.dismiss();
    expect(first.isOpen.value).toBe(false);
    expect(second.isOpen.value).toBe(true);
    second.close(2);
    expect(await Promise.all([first, second])).toEqual([
      { ok: true, value: 1 },
      { ok: true, value: 2 },
    ]);
  });

  it("keeps a keepMounted instance after its exit and resolves each open on its own (A4, A5)", async () => {
    const store = setup();
    const card = defineDialog(Card, { keepMounted: true });
    const first = card.open<string>();
    const entry = top(store);
    first.close("a");
    store.afterLeave(entry);
    expect(store.entries).toHaveLength(1);

    const second = card.open<string>();
    expect(top(store)).toBe(entry);
    second.close("b");
    closeAllDialogs();

    expect(await Promise.all([first, second])).toEqual([
      { ok: true, value: "a" },
      { ok: true, value: "b" },
    ]);
    expect(store.entries).toHaveLength(1);
  });

  it("reports isOpen and dismisses its open instance", async () => {
    setup();
    const card = defineDialog(Card);
    expect(card.isOpen.value).toBe(false);
    const handle = card.open();
    expect(card.isOpen.value).toBe(true);
    card.dismiss();
    expect(await handle).toEqual({ ok: false, reason: "programmatic" });
    expect(card.isOpen.value).toBe(false);
  });
});

describe("hosts", () => {
  it("renders in the first host only, warns about a second, and hands over (C7)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const store = setup({ host: false });
    const first = Symbol("first");
    const second = Symbol("second");
    store.register(first);
    store.register(second);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("second DialogHost"));
    expect([store.renders(first), store.renders(second)]).toEqual([true, false]);

    store.unregister(first);
    expect(store.renders(second)).toBe(true);
  });

  it("settles every dialog with unmount and empties the stack when the rendering host goes (L9)", async () => {
    const store = setup({ host: false });
    const host = Symbol("host");
    store.register(host);
    const open = openDialog(Card);
    const kept = defineDialog(Card, { keepMounted: true });
    kept.open();
    kept.dismiss();

    store.unregister(host);
    expect(await open).toEqual({ ok: false, reason: "unmount" });
    expect(open.isOpen.value).toBe(false);
    expect(store.entries).toHaveLength(0);
  });

  it("settles with error and drops a dialog that failed before rendering content (H1)", async () => {
    const store = setup();
    const handle = openDialog(Card);
    store.fail(top(store));
    expect(await handle).toEqual({ ok: false, reason: "error" });
    expect(store.entries).toHaveLength(0);
  });

  it("keeps a dialog whose content still renders after an error (F2)", () => {
    const store = setup();
    const handle = openDialog(Card);
    store.mountContent(top(store));
    store.fail(top(store));
    expect(handle.isOpen.value).toBe(true);
  });
});
