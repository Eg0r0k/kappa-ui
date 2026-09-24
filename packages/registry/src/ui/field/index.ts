import { type VariantProps, cva } from "class-variance-authority";

export { default as Field } from "./Field.vue";
export { default as FieldContent } from "./FieldContent.vue";
export { default as FieldDescription } from "./FieldDescription.vue";
export { default as FieldError } from "./FieldError.vue";
export { default as FieldGroup } from "./FieldGroup.vue";
export { default as FieldLabel } from "./FieldLabel.vue";
export { default as FieldLegend } from "./FieldLegend.vue";
export { default as FieldSet } from "./FieldSet.vue";

export const fieldVariants = cva("group/field flex w-full gap-2", {
  variants: {
    orientation: {
      vertical: "flex-col [&>*]:w-full",
      horizontal:
        "flex-row items-center [&>[data-slot=field-label]]:flex-auto has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>:is([data-slot=checkbox],[data-slot=radio]):not([data-touch-target=wrapper])]:mt-[calc((1.25rem-var(--choice-size))/2)] has-[>[data-slot=field-content]]:[&>[data-slot=switch]:not([data-touch-target=wrapper])]:mt-[calc((1.25rem-var(--switch-h))/2)] has-[>[data-touch-target=wrapper]]:[&>[data-slot=field-content]]:pt-[calc((3rem-1.25rem)/2)]",
      responsive:
        "flex-col [&>*]:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>*]:w-auto @md/field-group:[&>[data-slot=field-label]]:flex-auto",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

export type FieldVariants = VariantProps<typeof fieldVariants>;
