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
        xs: `h-7 px-2 ${textControlRadius.xs} icon-size-3.5 md:text-body-sm`,
        sm: `h-8 px-2.5 ${textControlRadius.sm} icon-size-4`,
        md: `h-9 px-3 ${textControlRadius.md} icon-size-4`,
        lg: `h-10 px-3 ${textControlRadius.lg} icon-size-5`,
        xl: `h-12 px-4 ${textControlRadius.xl} icon-size-5 md:text-body-lg`,
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
  min-w-[calc(2ch+--spacing(1))] rounded-sm px-0.5 text-center tabular-nums tone-control outline-none
  focus:bg-tone focus:text-tone-foreground
  aria-invalid:tone-invalid
  data-placeholder:text-muted-foreground
  focus:data-placeholder:text-tone-foreground
  data-disabled:cursor-not-allowed data-disabled:text-foreground/(--disabled-opacity)
  data-[reka-time-field-segment=literal]:min-w-0 data-[reka-time-field-segment=literal]:px-0
  data-[reka-time-field-segment=literal]:text-muted-foreground
`;

export type InputTimeVariants = VariantProps<typeof inputTimeVariants>;
