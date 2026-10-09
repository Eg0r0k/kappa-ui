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
        outline: `
          rounded-outset-(--listbox-item-radius)/[calc(var(--spacing)+1px)] border border-border bg-card p-1
          text-card-foreground [--scroll-fade-color:var(--card)]
          aria-invalid:border-destructive
          data-disabled:border-foreground/(--disabled-container-opacity)
        `,
        ghost: "",
      },
      size: {
        xs: `
          text-body-sm [--listbox-item-height:var(--control-height-xs)]
          [--listbox-item-radius:--theme(--radius-item-xs)] [--listbox-item-px:var(--control-padding-xs)]
          [--listbox-item-py:--spacing(1.5)] [--listbox-item-gap:var(--control-gap-xs)]
          [--listbox-icon:var(--control-icon-xs)]
        `,
        sm: `
          text-body-sm [--listbox-item-height:var(--control-height-sm)]
          [--listbox-item-radius:--theme(--radius-item-sm)] [--listbox-item-px:var(--control-padding-sm)]
          [--listbox-item-py:--spacing(2)] [--listbox-item-gap:var(--control-gap-sm)]
          [--listbox-icon:var(--control-icon-sm)]
        `,
        md: `
          text-body-md [--listbox-item-height:var(--control-height-md)]
          [--listbox-item-radius:--theme(--radius-item-md)] [--listbox-item-px:var(--control-padding-md)]
          [--listbox-item-py:--spacing(2)] [--listbox-item-gap:var(--control-gap-md)]
          [--listbox-icon:var(--control-icon-md)]
        `,
        lg: `
          text-body-lg [--listbox-item-height:var(--control-height-lg)]
          [--listbox-item-radius:--theme(--radius-item-lg)] [--listbox-item-px:var(--control-padding-lg)]
          [--listbox-item-py:--spacing(2)] [--listbox-item-gap:var(--control-gap-lg)]
          [--listbox-icon:var(--control-icon-lg)]
        `,
        xl: `
          text-body-lg [--listbox-item-height:var(--control-height-xl)]
          [--listbox-item-radius:--theme(--radius-item-xl)] [--listbox-item-px:var(--control-padding-xl)]
          [--listbox-item-py:--spacing(3)] [--listbox-item-gap:var(--control-gap-xl)]
          [--listbox-icon:var(--control-icon-xl)]
        `,
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "md",
    },
  },
);

export type ListboxVariants = VariantProps<typeof listboxVariants>;
