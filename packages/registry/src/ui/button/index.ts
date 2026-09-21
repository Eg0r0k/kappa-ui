import { type VariantProps, cva } from "class-variance-authority";

export { default as Button } from "./Button.vue";

const touchTargetArea =
  "after:absolute after:top-1/2 after:left-1/2 after:h-[max(48px,100%)] after:w-[max(48px,100%)] after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']";

// The spinner is a ::before pseudo element, for the same reason the touch
// target is ::after: reka-ui's Slot clones exactly one child, so a real
// element would break <Button as-child>. Being a pseudo element also keeps it
// out of the accessibility tree, which is what we want — aria-busy carries
// the meaning, not a stray decorative node.
//
// It cannot use border-current: `replace` mode sets the text transparent, and
// currentColor would take the spinner with it. Each variant declares its own
// --spinner-color instead, pointing at a raw token rather than a --color-*
// one, since @theme inline does not emit those as variables.
const spinner =
  "before:size-4 before:shrink-0 before:animate-spin before:rounded-full before:border-2 before:border-(--spinner-color) before:border-t-transparent before:content-['']";

export const buttonVariants = cva(
  // The svg rules make an icon behave without the caller doing anything: no
  // pointer target of its own, no shrinking when the label is long, and a
  // default size that a caller's own size-* class still overrides.
  "relative cursor-pointer inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors ease-smooth outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 [--spinner-color:var(--primary-foreground)]",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground [--spinner-color:var(--foreground)]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 [--spinner-color:var(--secondary-foreground)]",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 [--spinner-color:white]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground [--spinner-color:var(--foreground)]",
        link: "text-primary underline-offset-4 hover:underline [--spinner-color:var(--primary)]",
      },
      // has-[>svg] tightens the horizontal padding when the content is an
      // icon rather than a label, declaratively — no slot inspection, no
      // reflected attribute. An icon needs less breathing room than text at
      // the same height, and the icon-* sizes have no horizontal padding to
      // adjust in the first place.
      size: {
        sm: "h-8 gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        lg: "h-10 px-6 has-[>svg]:px-4",
        xl: "h-12 px-8 text-base has-[>svg]:px-6",
        "icon-sm": "size-8",
        icon: "size-9",
        "icon-lg": "size-10",
        "icon-xl": "size-12",
      },
      // Material's focus ring has the same two modes. `inward` exists for an
      // element whose container clips it — an outward ring would be drawn
      // outside the clip and simply never seen, leaving keyboard users with
      // no focus indicator at all.
      focusRing: {
        outward: "focus-visible:ring-[3px] focus-visible:ring-ring/50",
        inward:
          "focus-visible:inset-ring-[3px] focus-visible:inset-ring-ring/50",
      },

      touchTarget: {
        none: "",
        expand: touchTargetArea,
        wrapper: touchTargetArea,
      },
      loading: {
        false: "",
        true: "pointer-events-none",
      },
      spinner: {
        none: "",
        builtin: spinner,
      },
      loadingMode: {
        adjacent: "",
        replace: "",
      },
    },
    compoundVariants: [
      { size: "sm", touchTarget: "wrapper", class: "my-2" },
      { size: "default", touchTarget: "wrapper", class: "my-1.5" },
      { size: "lg", touchTarget: "wrapper", class: "my-1" },
      { size: "icon-sm", touchTarget: "wrapper", class: "mx-2 my-2" },
      { size: "icon", touchTarget: "wrapper", class: "mx-1.5 my-1.5" },
      { size: "icon-lg", touchTarget: "wrapper", class: "mx-1 my-1" },
      {
        loading: true,
        loadingMode: "replace",
        class: "select-none text-transparent",
      },
      {
        spinner: "builtin",
        loadingMode: "replace",
        class:
          "before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      touchTarget: "none",
      loading: false,
      loadingMode: "adjacent",
      spinner: "none",
      focusRing: "outward",
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
