export { default as Editable } from "./Editable.vue";
export { default as EditableArea } from "./EditableArea.vue";
export { default as EditableInput } from "./EditableInput.vue";
export { default as EditablePreview } from "./EditablePreview.vue";

export const editableArea = `
  -mx-1.5 min-w-0 rounded-control-sm px-1.5 transition-colors duration-short-3 ease-standard
  hover:bg-muted
  data-focus:bg-background data-focus:focus-ring
  data-readonly:bg-transparent
  data-disabled:bg-transparent data-disabled:opacity-(--disabled-opacity)
  cursor-text
  data-focus:cursor-auto
  data-readonly:cursor-default
  data-disabled:cursor-not-allowed
  motion-reduce:transition-none
`;

export const editablePreview = "in-data-empty:text-muted-foreground";

export const editableInput = `
  w-full min-w-0 bg-transparent [font:inherit] tracking-[inherit] text-inherit outline-none
  placeholder:text-muted-foreground
  selection:bg-primary selection:text-primary-foreground
`;
