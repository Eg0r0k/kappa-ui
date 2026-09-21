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
  "relative cursor-pointer inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors ease-smooth outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 [--spinner-color:var(--primary-foreground)]",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground [--spinner-color:var(--foreground)]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 [--spinner-color:var(--secondary-foreground)]",
        // There is no --destructive-foreground; shadcn removed it, so the
        // label is plain white. Our --destructive values differ from theirs
        // precisely so that white clears 4.5:1 in both themes without help.
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 [--spinner-color:white]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground [--spinner-color:var(--foreground)]",
        link: "text-primary underline-offset-4 hover:underline [--spinner-color:var(--primary)]",
      },
      // The icon sizes are square and match the heights of the text sizes, so
      // an icon button sits flush with a text button of the same size in a
      // row: 32px, 36px, 40px, 48px.
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-9 px-4 py-2",
        lg: "h-10 px-6",
        // 48px is exactly the touch-target minimum, so xl needs no expansion
        // at all: max(48px, 100%) resolves to 100% on both axes, and the
        // wrapper margins below work out to zero. No compound variant needed.
        xl: "h-12 px-8 text-base",
        "icon-sm": "size-8",
        icon: "size-9",
        "icon-lg": "size-10",
        "icon-xl": "size-12",
      },

      touchTarget: {
        none: "",
        expand: touchTargetArea,
        wrapper: touchTargetArea,
      },
      // pointer-events-none is what actually blocks the mouse. The click
      // handler alone is not enough: at the target element, capture and
      // bubble listeners fire in registration order, and a consumer's own
      // @click is registered before ours, so stopImmediatePropagation cannot
      // be relied on to beat it. Keyboard activation is blocked separately,
      // in Button.vue, by preventing the default on Enter and Space so no
      // click is ever synthesised.
      loading: {
        false: "",
        true: "pointer-events-none",
      },
      // Separate from `loading` so a caller can supply their own indicator
      // through the #spinner slot and get none of the built-in one.
      spinner: {
        none: "",
        builtin: spinner,
      },
      // adjacent: the spinner sits in flex flow, next to the label, and the
      // button grows by its width plus the gap.
      // replace: the spinner is centred on top and the label goes
      // transparent, so the label keeps defining the width and nothing moves.
      loadingMode: {
        adjacent: "",
        replace: "",
      },
    },
    compoundVariants: [
      { size: "sm", touchTarget: "wrapper", class: "my-2" },
      { size: "default", touchTarget: "wrapper", class: "my-1.5" },
      { size: "lg", touchTarget: "wrapper", class: "my-1" },
      // Square sizes reserve on both axes, since neither dimension reaches
      // 48px on its own.
      { size: "icon-sm", touchTarget: "wrapper", class: "mx-2 my-2" },
      { size: "icon", touchTarget: "wrapper", class: "mx-1.5 my-1.5" },
      { size: "icon-lg", touchTarget: "wrapper", class: "mx-1 my-1" },
      // select-none is not polish, it closes a hole. text-transparent only
      // makes the glyphs invisible; the text is still there, and a selection
      // dragged across the button repaints it in the selection colour, so the
      // label everyone assumed was hidden comes back. Excluding it from
      // selection also keeps it out of a page-wide copy.
      // Find-in-page can still locate and highlight it — that one is not
      // reachable from CSS.
      { loading: true, loadingMode: "replace", class: "select-none text-transparent" },
      // Centring applies to the built-in spinner only. A custom one is a real
      // element, so Button.vue positions its wrapper instead.
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
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
