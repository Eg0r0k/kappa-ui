import { type VariantProps, cva } from "class-variance-authority";
import { createContext } from "reka-ui";

export { default as Splitter } from "./Splitter.vue";
export { default as SplitterHandle } from "./SplitterHandle.vue";
export { default as SplitterPanel } from "./SplitterPanel.vue";

export const [injectSplitterResets, provideSplitterResets] = createContext<Map<HTMLElement, () => void>>("Splitter");

export const splitterHandleVariants = cva(
  `
    group/handle relative flex shrink-0 items-center justify-center outline-none transition-colors duration-short-4
    ease-standard
    focus-visible:focus-ring
    motion-reduce:transition-none
  `,
  {
    variants: {
      variant: {
        line: `
          bg-border
          focus-visible:bg-primary
          data-[state=drag]:bg-primary
          data-[state=hover]:bg-primary
          data-[orientation=horizontal]:w-px
          data-[orientation=vertical]:h-px
        `,
        gutter: `
          before:absolute before:rounded-full before:transition-colors before:duration-short-4 before:ease-standard
          focus-visible:before:bg-primary
          data-[state=drag]:before:bg-primary
          data-[state=hover]:before:bg-primary
          data-[orientation=horizontal]:w-2
          data-[orientation=horizontal]:before:inset-x-0.75 data-[orientation=horizontal]:before:inset-y-0
          data-[orientation=vertical]:h-2
          data-[orientation=vertical]:before:inset-x-0 data-[orientation=vertical]:before:inset-y-0.75
        `,
      },
    },
    defaultVariants: { variant: "line" },
  },
);

export const splitterGripClass = `
  z-10 flex h-4 w-3 items-center justify-center rounded-sm border border-border bg-muted text-muted-foreground
  group-data-[orientation=vertical]/handle:rotate-90
  [&_svg]:size-2.5
`;

export type SplitterHandleVariants = VariantProps<typeof splitterHandleVariants>;
