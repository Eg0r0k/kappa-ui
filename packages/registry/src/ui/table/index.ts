export { default as Table } from "./Table.vue";
export { default as TableBody } from "./TableBody.vue";
export { default as TableCaption } from "./TableCaption.vue";
export { default as TableCell } from "./TableCell.vue";
export { default as TableEmpty } from "./TableEmpty.vue";
export { default as TableFooter } from "./TableFooter.vue";
export { default as TableHead } from "./TableHead.vue";
export { default as TableHeader } from "./TableHeader.vue";
export { default as TableRow } from "./TableRow.vue";

export type TableDensity = "sm" | "md" | "lg";

export type TableOverflow = "x" | "visible";

export type TableLayout = "auto" | "fixed";

export type TableAlign = "start" | "center" | "end";

export type TablePinned = "start" | "end";

export type TableParity = "even" | "odd";

const cellBase = `
  bg-(--table-row-bg) px-3 align-middle whitespace-nowrap
  data-[align=center]:text-center
  data-[align=end]:text-end
  [&:has([role=checkbox])]:pe-0
  [&>[role=checkbox]]:translate-y-[2px]
`;

export const tableStyles = {
  container: "relative w-full data-[overflow=x]:overflow-x-auto data-[overflow=visible]:overflow-visible",
  table:
    "w-full caption-bottom border-separate border-spacing-0 text-body-md data-[layout=fixed]:table-fixed [--table-row-bg:transparent] [--table-row-h:2.75rem] [--table-hover-bg:color-mix(in_oklab,var(--color-foreground)_var(--state-hover),transparent)] [--table-selected-bg:color-mix(in_oklab,var(--color-primary)_var(--state-selected),transparent)] [--table-stripe-bg:color-mix(in_oklab,var(--color-muted)_50%,transparent)] data-[density=sm]:[--table-row-h:2.25rem] data-[density=lg]:[--table-row-h:3.25rem] data-striped:[&_tbody:not([data-parity])>tr:nth-child(even):not([data-parity]):not([data-state=selected]):not(:hover)]:[--table-row-bg:var(--table-stripe-bg)] data-striped:[&_tr[data-parity=even]:not([data-state=selected]):not(:hover)]:[--table-row-bg:var(--table-stripe-bg)] data-striped:[&_tbody[data-parity=even]:not([data-state=selected]):not(:hover)]:[--table-row-bg:var(--table-stripe-bg)]",
  header: "data-sticky:sticky data-sticky:top-(--table-sticky-top,0px) data-sticky:z-2 data-sticky:bg-background",
  body: "",
  pinnedRows: "sticky isolate z-2 bg-background",
  rowGroup:
    "not-data-[state=selected]:hover:[--table-row-bg:var(--table-hover-bg)] data-[state=selected]:[--table-row-bg:var(--table-selected-bg)]",
  footer:
    "font-medium [--table-row-bg:var(--table-stripe-bg)] data-sticky:sticky data-sticky:bottom-(--table-sticky-bottom,0px) data-sticky:z-2 data-sticky:bg-background [&_td]:border-t [&_td]:border-b-0",
  row: "h-(--table-row-h) outline-none [tbody:not([data-state=selected])>&:not([data-state=selected])]:hover:[--table-row-bg:var(--table-hover-bg)] data-[state=selected]:[--table-row-bg:var(--table-selected-bg)] data-clickable:cursor-pointer focus-visible:focus-ring-inset",
  head: `${cellBase} h-(--table-row-h) border-b border-border text-start font-medium text-foreground`,
  cell: `${cellBase} border-b border-border py-2 [tbody:last-of-type>tr:last-child>&]:border-b-0 [tbody:has(+[data-slot=table-pinned-bottom])>tr:last-child>&]:border-b-0 data-truncate:max-w-0 data-truncate:truncate`,
  pinned:
    "sticky z-1 bg-background bg-[linear-gradient(var(--table-row-bg),var(--table-row-bg))] data-[pinned=start]:start-(--pin-start,0px) data-[pinned=end]:end-(--pin-end,0px)",
  pinnedEdge:
    "after:pointer-events-none after:absolute after:inset-y-0 after:w-2 after:from-foreground/10 after:to-transparent after:opacity-0 after:transition-opacity after:duration-short-4 after:ease-standard data-[pinned=start]:after:start-full data-[pinned=start]:after:bg-linear-to-r data-[pinned=start]:rtl:after:bg-linear-to-l data-[pinned=start]:in-data-[overflow-x-start]:after:opacity-100 data-[pinned=end]:after:end-full data-[pinned=end]:after:bg-linear-to-l data-[pinned=end]:rtl:after:bg-linear-to-r data-[pinned=end]:in-data-[overflow-x-end]:after:opacity-100",
  caption: "text-body-sm text-muted-foreground not-data-visible:sr-only data-visible:mt-4",
  empty: "flex items-center justify-center py-10 text-body-md text-muted-foreground",
};
