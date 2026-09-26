import { type VariantProps, cva } from "class-variance-authority";

const touchTargetArea =
  "after:absolute after:top-1/2 after:left-1/2 after:size-[max(3rem,100%)] after:-translate-x-1/2 after:-translate-y-1/2";

export const choiceControl =
  "relative inline-flex size-(--choice-size) shrink-0 items-center justify-center border-2 border-input outline-none before:pointer-events-none before:absolute before:top-1/2 before:left-1/2 before:size-[calc(var(--choice-size)*20/9)] before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-foreground before:scale-75 before:opacity-0 before:transition-[opacity,scale] before:duration-short-4 before:ease-standard data-hovered:before:scale-100 data-hovered:not-active:before:opacity-(--state-hover) active:before:scale-100 active:before:opacity-(--state-pressed) motion-reduce:before:scale-100 data-[state=checked]:before:bg-primary aria-invalid:before:bg-destructive in-aria-invalid:before:bg-destructive not-data-[touch-target=wrapper]:has-[+[data-slot=field-label],+[data-slot=field-content],+[data-slot=label]]:me-[calc(var(--choice-size)*11/18-0.25rem)] focus-visible:focus-ring disabled:cursor-not-allowed disabled:before:hidden forced-colors:before:hidden";

export const choiceControlVariants = {
  size: {
    xs: "[--choice-size:0.875rem]",
    sm: "[--choice-size:1rem]",
    md: "[--choice-size:1.125rem]",
    lg: "[--choice-size:1.25rem]",
    xl: "[--choice-size:1.5rem]",
  },
  touchTarget: {
    none: "",
    expand: touchTargetArea,
    wrapper: `${touchTargetArea} m-[max(0px,calc((3rem-var(--choice-size))/2))]`,
  },
};

const row =
  "[&>[data-slot=field]]:relative [&>[data-slot=field]]:before:pointer-events-none [&>[data-slot=field]]:before:absolute [&>[data-slot=field]]:before:inset-0 [&>[data-slot=field]]:before:rounded-[inherit] [&>[data-slot=field]]:before:bg-foreground [&>[data-slot=field]]:before:opacity-0 [&>[data-slot=field]]:before:transition-opacity [&>[data-slot=field]]:before:duration-short-4 [&>[data-slot=field]]:before:ease-standard [&>[data-slot=field]:hover]:before:opacity-(--state-hover) [&>[data-slot=field]:active]:before:opacity-(--state-pressed) [&>[data-slot=field][data-disabled]]:before:hidden [&>[data-slot=field]:has([data-state=checked])]:bg-primary/(--state-selected) [&_[data-slot=field-label]]:cursor-pointer [&_[data-slot=field-label]]:after:absolute [&_[data-slot=field-label]]:after:inset-0 [&_:is([data-slot=checkbox],[data-slot=radio])]:before:hidden";

export const choiceGroupVariants = cva("flex", {
  variants: {
    variant: {
      default: "",
      card: `${row} gap-3 [&>[data-slot=field]]:rounded-lg [&>[data-slot=field]]:border [&>[data-slot=field]]:border-border [&>[data-slot=field]]:p-4 [&>[data-slot=field]:has([data-state=checked])]:border-primary [&>[data-slot=field]:has(:focus-visible)]:focus-ring [&>[data-slot=field][data-invalid]]:border-destructive`,
      list: `${row} overflow-hidden rounded-lg border border-border [&>[data-slot=field]]:px-4 [&>[data-slot=field]]:py-3`,
      table: `${row} overflow-hidden rounded-lg border border-border [&_[data-slot=field-description]]:text-body-sm`,
    },
    orientation: {
      vertical: "flex-col",
      horizontal: "flex-row",
    },
  },
  compoundVariants: [
    { variant: "default", orientation: "vertical", class: "gap-3" },
    { variant: "default", orientation: "horizontal", class: "flex-wrap gap-x-6 gap-y-3" },
    { variant: "card", orientation: "horizontal", class: "grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]" },
    { variant: ["list", "table"], orientation: "vertical", class: "divide-y" },
    { variant: ["list", "table"], orientation: "horizontal", class: "divide-x [&>[data-slot=field]]:flex-1" },
    {
      variant: "table",
      orientation: "vertical",
      class:
        "[&>[data-slot=field]]:grid [&>[data-slot=field]]:grid-cols-[auto_minmax(0,1fr)_minmax(0,2fr)] [&>[data-slot=field]]:items-center [&>[data-slot=field]]:gap-x-4 [&>[data-slot=field]]:px-4 [&>[data-slot=field]]:py-2.5 [&_[data-slot=field-content]]:contents",
    },
    {
      variant: "table",
      orientation: "horizontal",
      class:
        "[&>[data-slot=field]]:flex-col [&>[data-slot=field]]:items-start [&>[data-slot=field]]:gap-3 [&>[data-slot=field]]:p-4",
    },
  ],
  defaultVariants: {
    variant: "default",
    orientation: "vertical",
  },
});

export type ChoiceGroupVariants = VariantProps<typeof choiceGroupVariants>;
