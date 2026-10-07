import { mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import { type Component, defineComponent, h, nextTick, ref } from "vue";

import { createDataTableColumnHelper, DataTable } from "@/ui/data-table";

type Item = { id: string; name: string };

const make = (count: number, offset = 0): Item[] =>
  Array.from({ length: count }, (_, index) => ({ id: `r${index + offset}`, name: `Row ${index + offset}` }));

const AnyTable = DataTable as unknown as Component;
const helper = createDataTableColumnHelper<Item>();
const columns = [helper.accessor("name", { header: "Name" })];

afterEach(() => {
  vi.restoreAllMocks();
});

type Load = (context: { direction: "top" | "bottom"; index: number }) => Promise<void | "stop">;

const render = (props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) => {
  const data = ref<Item[]>((props.data as Item[] | undefined) ?? make(3));
  const extra = ref<Record<string, unknown>>({});
  const calls: number[] = [];
  const errors: unknown[] = [];
  const pending: Array<{ resolve: (result?: "stop") => void; reject: (error: unknown) => void }> = [];
  const onLoadMore: Load = ({ index }) => {
    calls.push(index);
    return new Promise((resolve, reject) => pending.push({ resolve, reject }));
  };
  const wrapper = mount(
    defineComponent({
      render: () =>
        h(
          AnyTable,
          {
            columns,
            getRowId: (row: Item) => row.id,
            height: 200,
            onLoadMore,
            ...props,
            ...extra.value,
            data: data.value,
          },
          slots,
        ),
    }),
    { attachTo: document.body, global: { config: { errorHandler: (error) => errors.push(error) } } },
  );
  const settle = () => new Promise((resolve) => setTimeout(resolve, 150));
  const viewport = () => document.querySelector<HTMLElement>("[data-slot=scroll-area-viewport]")!;
  const groups = () => [...document.querySelectorAll<HTMLElement>("[data-slot=table-row-group]")];
  const loading = () => document.querySelector<HTMLElement>("[data-slot=table-loading-more]");
  const end = () => document.querySelector<HTMLElement>("[data-slot=table-end-of-data]");
  const finish = async (result?: "stop") => {
    pending.shift()!.resolve(result);
    await nextTick();
    await settle();
  };
  return { wrapper, data, extra, calls, errors, pending, settle, viewport, groups, loading, end, finish };
};

it("fills a short first page, shows the loading row below the last row and stops on 'stop'", async () => {
  const t = render({}, { endOfData: () => h("p", { "data-test": "end" }, "That's all") });
  await vi.waitFor(() => expect(t.calls).toEqual([1]));
  const loading = t.loading()!;
  expect(loading.dataset.direction).toBe("bottom");
  expect(loading.getAttribute("aria-hidden")).toBe("true");
  expect(loading.querySelector("[data-slot=spinner]")).not.toBeNull();
  expect(loading.compareDocumentPosition(t.groups().at(-1)!) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
  expect(t.end()).toBeNull();
  t.data.value = make(6);
  await t.finish();
  expect(t.calls).toEqual([1, 2]);
  t.data.value = make(9);
  await t.finish("stop");
  expect(t.calls).toEqual([1, 2]);
  expect(t.loading()).toBeNull();
  expect(t.end()!.textContent).toContain("That's all");
  t.viewport().scrollTop = 1000;
  await t.settle();
  expect(t.calls).toEqual([1, 2]);
});

it("waits while hasMore is false and loads once it turns true", async () => {
  const t = render({ hasMore: false });
  await t.settle();
  expect(t.calls).toEqual([]);
  t.extra.value = { hasMore: true };
  await vi.waitFor(() => expect(t.calls).toEqual([1]));
  t.data.value = make(12);
  await t.finish();
  expect(t.calls).toEqual([1]);
  t.extra.value = { hasMore: { bottom: false } };
  await nextTick();
  t.viewport().scrollTop = 1000;
  await t.settle();
  expect(t.calls).toEqual([1]);
});

it("restarts the index when a manual filter changes", async () => {
  const t = render({ manual: { filtering: true } });
  await vi.waitFor(() => expect(t.calls).toEqual([1]));
  t.data.value = make(6);
  await t.finish();
  expect(t.calls).toEqual([1, 2]);
  t.data.value = make(30);
  await t.finish();
  await t.settle();
  expect(t.calls).toEqual([1, 2]);
  t.data.value = make(3);
  t.extra.value = { globalFilter: "x" };
  await vi.waitFor(() => expect(t.calls).toEqual([1, 2, 1]));
});

it("leaves a rejected load retryable and reports the error", async () => {
  const t = render();
  await vi.waitFor(() => expect(t.calls).toEqual([1]));
  t.pending.shift()!.reject(new Error("offline"));
  await t.settle();
  expect(t.errors).toHaveLength(1);
  expect(t.loading()).toBeNull();
  t.viewport().dispatchEvent(new Event("scroll"));
  await vi.waitFor(() => expect(t.calls).toEqual([1, 1]));
});

it("warns when manual pagination and onLoadMore are both set", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  render({ manual: { pagination: true }, rowCount: 100, paginate: true });
  await nextTick();
  expect(warn).toHaveBeenCalledWith(expect.stringContaining("onLoadMore"));
});
