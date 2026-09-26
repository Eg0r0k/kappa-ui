import { type VariantProps, cva } from "class-variance-authority";

export { default as Listbox } from "./Listbox.vue";
export { default as ListboxContent } from "./ListboxContent.vue";
export { default as ListboxDescription } from "./ListboxDescription.vue";
export { default as ListboxGroup } from "./ListboxGroup.vue";
export { default as ListboxGroupLabel } from "./ListboxGroupLabel.vue";
export { default as ListboxIcon } from "./ListboxIcon.vue";
export { default as ListboxItem } from "./ListboxItem.vue";
export { default as ListboxSeparator } from "./ListboxSeparator.vue";
export { default as ListboxTitle } from "./ListboxTitle.vue";

export const listboxVariants = cva(
  "group/listbox flex flex-col gap-0.5 outline-none data-[orientation=horizontal]:flex-row",
  {
    variants: {
      variant: {
        outline:
          "rounded-xl border border-border bg-card p-1 text-card-foreground aria-invalid:border-destructive data-disabled:border-foreground/(--disabled-container-opacity)",
        ghost: "",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  },
);

export type ListboxVariants = VariantProps<typeof listboxVariants>;
