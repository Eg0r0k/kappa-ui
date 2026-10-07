import { type VariantProps, cva } from "class-variance-authority";
import { createContext } from "reka-ui";
import type { ComputedRef, Ref } from "vue";

import { type TextControlSize, textControlBase, textControlFrameVariant, textControlRadius } from "@/ui/input";

export { default as Combobox } from "./Combobox.vue";
export { default as ComboboxAnchor } from "./ComboboxAnchor.vue";
export { default as ComboboxCancel } from "./ComboboxCancel.vue";
export { default as ComboboxEmpty } from "./ComboboxEmpty.vue";
export { default as ComboboxGroup } from "./ComboboxGroup.vue";
export { default as ComboboxInput } from "./ComboboxInput.vue";
export { default as ComboboxItem } from "./ComboboxItem.vue";
export { default as ComboboxLabel } from "./ComboboxLabel.vue";
export { default as ComboboxList } from "./ComboboxList.vue";
export { default as ComboboxSeparator } from "./ComboboxSeparator.vue";
export { default as ComboboxTrigger } from "./ComboboxTrigger.vue";
export { default as ComboboxViewport } from "./ComboboxViewport.vue";

export type ComboboxSize = TextControlSize;

export const [injectComboboxSize, provideComboboxSize] = createContext<Ref<ComboboxSize | undefined>>("Combobox");

export const [injectComboboxAnchorContext, provideComboboxAnchorContext] =
  createContext<ComputedRef<{ size: ComboboxSize }>>("ComboboxAnchor");

export const [injectComboboxListContext, provideComboboxListContext] =
  createContext<ComputedRef<{ size: ComboboxSize }>>("ComboboxList");

export const comboboxAnchorVariants = cva(
  `
    group/combobox-anchor flex w-full min-w-0 items-center transition-[color,background-color,border-color,box-shadow]
    duration-short-3 ease-standard
  `,
  {
    variants: {
      variant: textControlFrameVariant,
      size: {
        xs: `h-(--control-height-xs) ${textControlRadius.xs} [--control-padding:var(--control-padding-xs)]`,
        sm: `h-(--control-height-sm) ${textControlRadius.sm} [--control-padding:var(--control-padding-sm)]`,
        md: `h-(--control-height-md) ${textControlRadius.md} [--control-padding:var(--control-padding-md)]`,
        lg: `h-(--control-height-lg) ${textControlRadius.lg} [--control-padding:var(--control-padding-lg)]`,
        xl: `h-(--control-height-xl) ${textControlRadius.xl} [--control-padding:var(--control-padding-xl)]`,
      },
    },
    defaultVariants: { variant: "outline", size: "md" },
  },
);

export const comboboxInputVariants = cva(
  `${textControlBase}
    peer/combobox-input h-full flex-1 rounded-none px-(--control-padding)
    not-last:pe-1
    in-data-[slot=combobox-list]:h-[calc(var(--menu-item-height)+var(--menu-pad)*2)]
    in-data-[slot=combobox-list]:flex-none in-data-[slot=combobox-list]:border-b
    in-data-[slot=combobox-list]:border-border
    in-data-[slot=combobox-list]:px-[calc(var(--menu-pad)+var(--menu-item-px))]
  `,
  {
    variants: {
      size: { xs: "md:text-body-sm", sm: "", md: "", lg: "", xl: "md:text-body-lg" },
    },
    defaultVariants: { size: "md" },
  },
);

export const comboboxTrigger = `
  group/combobox-trigger flex h-full shrink-0 cursor-default items-center ps-1 pe-(--control-padding)
  text-muted-foreground outline-none
  disabled:text-foreground/(--disabled-opacity)
  [&_svg]:pointer-events-none
  icon-size-4
`;

export const comboboxCancel = `
  state-layer relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full p-0.5
  text-muted-foreground outline-none
  peer-placeholder-shown/combobox-input:hidden
  group-has-[>input:disabled]/combobox-anchor:hidden
  last:me-[calc(var(--control-padding)-var(--spacing)*0.5)]
  [&_svg]:pointer-events-none
  icon-size-3.5
`;

export type ComboboxAnchorVariants = VariantProps<typeof comboboxAnchorVariants>;
