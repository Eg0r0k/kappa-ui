import { type VariantProps, cva } from "class-variance-authority";

import { textControlFrameVariant, textControlRadius } from "@/ui/input";

export { default as InputTime } from "./InputTime.vue";
export { default as InputTimeRange } from "./InputTimeRange.vue";

export const inputTimeVariants = cva(
  `
    flex w-full min-w-0 items-center text-body-lg text-foreground
    transition-[color,background-color,border-color,box-shadow] duration-short-3 ease-standard
    md:text-body-md
  `,
  {
    variants: {
      variant: textControlFrameVariant,
      size: {
        xs: `h-(--control-height-xs) px-(--control-padding-xs) ${textControlRadius.xs} icon-size-(--control-icon-xs) md:text-body-sm`,
        sm: `h-(--control-height-sm) px-(--control-padding-sm) ${textControlRadius.sm} icon-size-(--control-icon-sm)`,
        md: `h-(--control-height-md) px-(--control-padding-md) ${textControlRadius.md} icon-size-(--control-icon-md)`,
        lg: `h-(--control-height-lg) px-(--control-padding-lg) ${textControlRadius.lg} icon-size-(--control-icon-lg)`,
        xl: `h-(--control-height-xl) px-(--control-padding-xl) ${textControlRadius.xl} icon-size-(--control-icon-xl) md:text-body-lg`,
      },
    },
    defaultVariants: { variant: "outline", size: "md" },
  },
);

export const inputTimeGroupedVariants = cva(
  `
    flex h-full min-w-0 flex-1 items-center px-(--input-group-padding) text-body-lg text-foreground
    icon-size-(--input-group-icon)
    md:text-body-md
  `,
  {
    variants: {
      size: { xs: "md:text-body-sm", sm: "", md: "", lg: "", xl: "md:text-body-lg" },
    },
    defaultVariants: { size: "md" },
  },
);

export const inputTimeSegment = `
  min-w-[calc(2ch+--spacing(1))] rounded-sm px-0.5 text-end tabular-nums tone-control outline-none
  focus:bg-tone focus:text-tone-foreground
  aria-invalid:tone-invalid
  data-placeholder:text-muted-foreground
  focus:data-placeholder:text-tone-foreground
  data-disabled:cursor-not-allowed data-disabled:text-foreground/(--disabled-opacity)
  data-[reka-time-field-segment=literal]:min-w-0 data-[reka-time-field-segment=literal]:px-0
  data-[reka-time-field-segment=literal]:text-muted-foreground
`;

export type InputTimeVariants = VariantProps<typeof inputTimeVariants>;
