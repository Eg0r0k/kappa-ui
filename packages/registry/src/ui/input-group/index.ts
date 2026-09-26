import { createContext } from "@delta-ui/core/utils";
import { type VariantProps, cva } from "class-variance-authority";
import type { ComputedRef } from "vue";

export { default as InputGroup } from "./InputGroup.vue";
export { default as InputGroupAddon } from "./InputGroupAddon.vue";
export { default as InputGroupButton } from "./InputGroupButton.vue";
export { default as InputGroupInput } from "./InputGroupInput.vue";
export { default as InputGroupText } from "./InputGroupText.vue";
export { default as InputGroupTextarea } from "./InputGroupTextarea.vue";

const focusRing =
  "has-[[data-slot=input-group-control]:focus-visible]:border-primary has-[[data-slot=input-group-control]:focus-visible]:inset-ring has-[[data-slot=input-group-control]:focus-visible]:inset-ring-primary has-[[data-slot=input-group-control][aria-invalid=true]]:border-destructive has-[[data-slot=input-group-control][aria-invalid=true]:focus-visible]:inset-ring-destructive has-[[data-slot=input-group-control]:user-invalid]:border-destructive has-[[data-slot=input-group-control]:user-invalid:focus-visible]:inset-ring-destructive";

const disabledBorder =
  "has-[[data-slot=input-group-control]:disabled]:border-foreground/(--disabled-container-opacity)";

export const inputGroupVariants = cva(
  "group/input-group relative flex w-full min-w-0 items-center transition-[color,background-color,border-color,box-shadow] duration-short-3 ease-standard has-[>textarea]:h-auto has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=inline-start]]:*:data-[slot=input-group-control]:ps-2 has-[>[data-align=inline-end]]:*:data-[slot=input-group-control]:pe-2",
  {
    variants: {
      variant: {
        outline: `rounded-(--input-group-radius) border border-input ${focusRing} ${disabledBorder}`,
        soft: `rounded-(--input-group-radius) border border-transparent bg-muted ${focusRing}`,
        filled:
          "rounded-t-(--input-group-radius) border-b border-input bg-muted has-[[data-slot=input-group-control]:focus-visible]:border-primary has-[[data-slot=input-group-control]:focus-visible]:shadow-[inset_0_-1px_0_var(--color-primary)] has-[[data-slot=input-group-control][aria-invalid=true]]:border-destructive has-[[data-slot=input-group-control][aria-invalid=true]:focus-visible]:shadow-[inset_0_-1px_0_var(--color-destructive)] has-[[data-slot=input-group-control]:user-invalid]:border-destructive has-[[data-slot=input-group-control]:disabled]:border-foreground/(--disabled-container-opacity)",
        ghost: `rounded-(--input-group-radius) border border-transparent hover:bg-muted has-[[data-slot=input-group-control]:focus-visible]:bg-muted ${focusRing} has-[[data-slot=input-group-control]:disabled]:bg-transparent`,
        subtle: `rounded-(--input-group-radius) border border-input bg-muted ${focusRing} ${disabledBorder}`,
      },
      size: {
        xs: "h-7 [--input-group-radius:--theme(--radius-md)] [--input-group-height:--spacing(7)] [--input-group-padding:--spacing(2)] [--input-group-icon:--spacing(3.5)]",
        sm: "h-8 [--input-group-radius:--theme(--radius-lg)] [--input-group-height:--spacing(8)] [--input-group-padding:--spacing(2.5)] [--input-group-icon:--spacing(4)]",
        md: "h-9 [--input-group-radius:--theme(--radius-lg)] [--input-group-height:--spacing(9)] [--input-group-padding:--spacing(3)] [--input-group-icon:--spacing(4)]",
        lg: "h-10 [--input-group-radius:--theme(--radius-lg)] [--input-group-height:--spacing(10)] [--input-group-padding:--spacing(3)] [--input-group-icon:--spacing(5)]",
        xl: "h-12 [--input-group-radius:--theme(--radius-xl)] [--input-group-height:--spacing(12)] [--input-group-padding:--spacing(4)] [--input-group-icon:--spacing(5)]",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "md",
    },
  },
);

export const inputGroupAddonVariants = cva(
  "flex cursor-text items-center gap-2 text-body-md text-muted-foreground select-none [&>svg]:pointer-events-none [&>svg:not([class*='size-'])]:size-(--input-group-icon) group-has-[[data-slot=input-group-control]:disabled]/input-group:opacity-(--disabled-opacity)",
  {
    variants: {
      align: {
        "inline-start": "order-first ps-(--input-group-padding)",
        "inline-end": "order-last pe-(--input-group-padding)",
        "block-start":
          "order-first w-full justify-start p-2 *:data-[slot=input-group-button]:[--input-group-button-inset:calc(var(--spacing)*2+1px)] *:data-[slot=input-group-text]:px-1",
        "block-end":
          "order-last w-full justify-start p-2 *:data-[slot=input-group-button]:[--input-group-button-inset:calc(var(--spacing)*2+1px)] *:data-[slot=input-group-text]:px-1",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  },
);

export const inputGroupButtonVariants = cva(
  "rounded-[max(0px,calc(var(--input-group-radius)-var(--input-group-button-inset)))] shadow-none [--input-group-button-inset:calc((var(--input-group-height)-var(--input-group-button-height))/2)] in-data-[align=inline-start]:first:-ms-[calc(var(--input-group-padding)-var(--input-group-button-inset)+1px)] in-data-[align=inline-end]:last:-me-[calc(var(--input-group-padding)-var(--input-group-button-inset)+1px)]",
  {
    variants: {
      size: {
        xs: "h-6 gap-1 px-2 text-label-sm [--input-group-button-height:--spacing(6)] [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 px-2.5 text-label-md [--input-group-button-height:--spacing(8)]",
        "icon-xs": "size-6 p-0 [--input-group-button-height:--spacing(6)] [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8 p-0 [--input-group-button-height:--spacing(8)]",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  },
);

export const inputGroupControlText = {
  xs: "md:text-body-sm",
  sm: "",
  md: "",
  lg: "",
  xl: "md:text-body-lg",
} as const;

export type InputGroupVariants = VariantProps<typeof inputGroupVariants>;
export type InputGroupAddonVariants = VariantProps<typeof inputGroupAddonVariants>;
export type InputGroupButtonVariants = VariantProps<typeof inputGroupButtonVariants>;

export type InputGroupVariant = NonNullable<InputGroupVariants["variant"]>;
export type InputGroupSize = NonNullable<InputGroupVariants["size"]>;

export const [injectInputGroupContext, provideInputGroupContext] = createContext<{
  variant: ComputedRef<InputGroupVariant>;
  size: ComputedRef<InputGroupSize>;
}>("InputGroup");
