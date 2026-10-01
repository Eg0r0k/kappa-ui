import { type VariantProps, cva } from "class-variance-authority";
import { type Color, createContext } from "reka-ui";
import type { ComputedRef, Ref } from "vue";

export { default as ColorPicker } from "./ColorPicker.vue";
export { default as ColorPickerArea } from "./ColorPickerArea.vue";
export { default as ColorPickerField } from "./ColorPickerField.vue";
export { default as ColorPickerPreview } from "./ColorPickerPreview.vue";
export { default as ColorPickerSlider } from "./ColorPickerSlider.vue";
export { default as ColorPickerSwatch } from "./ColorPickerSwatch.vue";
export { default as ColorPickerSwatches } from "./ColorPickerSwatches.vue";

export type ColorPickerFormat = "hex" | "rgb" | "hsl" | "hsb";
export type ColorPickerSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ColorPickerContext {
  color: Ref<Color>;
  hex: ComputedRef<string>;
  setColor: (color: Color) => void;
  size: Ref<ColorPickerSize>;
  disabled: ComputedRef<boolean>;
  invalid: ComputedRef<boolean | "true" | "false" | undefined>;
  describedBy: ComputedRef<string | undefined>;
}

export const [injectColorPickerContext, provideColorPickerContext] = createContext<ColorPickerContext>("ColorPicker");

export const colorPickerVariants = cva("group/color-picker flex flex-col gap-(--color-picker-gap)", {
  variants: {
    size: {
      xs: "[--color-picker-area:--spacing(24)] [--color-picker-control:--spacing(7)] [--color-picker-gap:--spacing(2)] [--color-picker-radius:--theme(--radius-md)] [--color-picker-swatch:--spacing(5)] [--slider-bar:0.5rem] [--slider-thumb:0.75rem]",
      sm: "[--color-picker-area:--spacing(32)] [--color-picker-control:--spacing(8)] [--color-picker-gap:--spacing(2)] [--color-picker-radius:--theme(--radius-lg)] [--color-picker-swatch:--spacing(6)] [--slider-bar:0.625rem] [--slider-thumb:0.875rem]",
      md: "[--color-picker-area:--spacing(40)] [--color-picker-control:--spacing(9)] [--color-picker-gap:--spacing(3)] [--color-picker-radius:--theme(--radius-lg)] [--color-picker-swatch:--spacing(7)] [--slider-bar:0.75rem] [--slider-thumb:1rem]",
      lg: "[--color-picker-area:--spacing(48)] [--color-picker-control:--spacing(10)] [--color-picker-gap:--spacing(3)] [--color-picker-radius:--theme(--radius-lg)] [--color-picker-swatch:--spacing(8)] [--slider-bar:0.875rem] [--slider-thumb:1.25rem]",
      xl: "[--color-picker-area:--spacing(56)] [--color-picker-control:--spacing(12)] [--color-picker-gap:--spacing(4)] [--color-picker-radius:--theme(--radius-xl)] [--color-picker-swatch:--spacing(9)] [--slider-bar:1rem] [--slider-thumb:1.5rem]",
    },
  },
  defaultVariants: { size: "md" },
});

export type ColorPickerVariants = VariantProps<typeof colorPickerVariants>;

export const colorPickerChecker =
  "bg-[repeating-conic-gradient(var(--color-border)_0_25%,transparent_0_50%)] bg-size-[0.75rem_0.75rem]";

export const colorPickerThumb =
  "block size-(--slider-thumb) rounded-full shadow-shadow-sm ring-2 ring-background outline-none focus-visible:focus-ring data-disabled:shadow-none";

export const colorPickerArea = "relative h-(--color-picker-area) w-full data-disabled:opacity-(--disabled-opacity)";

export const colorPickerAreaCanvas = "absolute inset-0 rounded-(--color-picker-radius)";

export const colorPickerSlider =
  "relative flex h-(--slider-h) w-(--slider-w) touch-none items-center select-none slider-axis [--slider-size:var(--slider-thumb)] [--slider-track:var(--slider-bar)] data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:flex-col data-disabled:opacity-(--disabled-opacity)";

export const colorPickerSliderTrack = "relative h-(--track-h) w-(--track-w) grow rounded-full";

export const colorPickerSliderChecker = `absolute inset-0 m-auto h-(--track-h) w-(--track-w) rounded-full ${colorPickerChecker}`;

export const colorPickerSliderThumb = "block size-(--slider-size) rounded-full outline-none focus-visible:focus-ring";

export const colorPickerSliderHandle =
  "pointer-events-none block size-(--slider-thumb) rounded-full shadow-shadow-sm ring-2 ring-background group-data-disabled/thumb:shadow-none";

export const colorPickerPreview = `relative size-(--color-picker-control) shrink-0 overflow-hidden rounded-(--color-picker-radius) ${colorPickerChecker}`;

export const colorPickerPreviewColor = "absolute inset-0 bg-(--reka-color-swatch-color) inset-ring inset-ring-border";

export const colorPickerSwatches = "flex flex-wrap gap-2 outline-none data-disabled:opacity-(--disabled-opacity)";

export const colorPickerSwatch = `relative size-(--color-picker-swatch) shrink-0 cursor-pointer rounded-md outline-none focus-visible:focus-ring data-disabled:cursor-not-allowed data-disabled:opacity-(--disabled-opacity) ${colorPickerChecker}`;

export const colorPickerSwatchColor =
  "peer absolute inset-0 rounded-[inherit] bg-(--reka-color-swatch-color) inset-ring inset-ring-border";

export const colorPickerSwatchIndicator =
  "absolute inset-0 flex items-center justify-center text-white peer-data-[color-contrast=dark]:text-black [&_svg]:size-[55%]";
