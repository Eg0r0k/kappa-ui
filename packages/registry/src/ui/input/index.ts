import { type VariantProps, cva } from "class-variance-authority";

export { default as Input } from "./Input.vue";

export const textControlBase =
  "w-full min-w-0 bg-transparent text-body-lg text-foreground outline-none transition-[color,background-color,border-color,box-shadow] duration-short-3 ease-standard selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:text-foreground/(--disabled-opacity) disabled:placeholder:text-foreground/(--disabled-opacity) md:text-body-md";

const focusRing =
  "focus-visible:border-primary focus-visible:inset-ring focus-visible:inset-ring-primary data-[state=open]:border-primary data-[state=open]:inset-ring data-[state=open]:inset-ring-primary aria-invalid:border-destructive aria-invalid:focus-visible:inset-ring-destructive user-invalid:border-destructive user-invalid:focus-visible:inset-ring-destructive";

export const textControlVariant = {
  outline: `rounded-(--control-radius) border border-input ${focusRing} disabled:border-foreground/(--disabled-container-opacity)`,
  soft: `rounded-(--control-radius) border border-transparent bg-muted ${focusRing}`,
  filled:
    "rounded-t-(--control-radius) border-b border-input bg-muted focus-visible:border-primary focus-visible:shadow-[inset_0_-1px_0_var(--color-primary)] data-[state=open]:border-primary data-[state=open]:shadow-[inset_0_-1px_0_var(--color-primary)] disabled:border-foreground/(--disabled-container-opacity) aria-invalid:border-destructive aria-invalid:focus-visible:shadow-[inset_0_-1px_0_var(--color-destructive)] user-invalid:border-destructive user-invalid:focus-visible:shadow-[inset_0_-1px_0_var(--color-destructive)]",
  ghost: `rounded-(--control-radius) border border-transparent hover:bg-muted focus-visible:bg-muted data-[state=open]:bg-muted ${focusRing} disabled:bg-transparent`,
  subtle: `rounded-(--control-radius) border border-input bg-muted ${focusRing} disabled:border-foreground/(--disabled-container-opacity)`,
};

export const textControlSize = {
  xs: "px-2 md:text-body-sm",
  sm: "px-2.5",
  md: "px-3",
  lg: "px-3",
  xl: "px-4 md:text-body-lg",
};

export const textControlRadius = {
  xs: "[--control-radius:--theme(--radius-md)]",
  sm: "[--control-radius:--theme(--radius-lg)]",
  md: "[--control-radius:--theme(--radius-lg)]",
  lg: "[--control-radius:--theme(--radius-lg)]",
  xl: "[--control-radius:--theme(--radius-xl)]",
};

export type TextControlVariant = keyof typeof textControlVariant;
export type TextControlSize = keyof typeof textControlSize;

const insideLabel: ("soft" | "filled" | "ghost" | "subtle")[] = ["soft", "filled", "ghost", "subtle"];

const sizes = { xs: "", sm: "", md: "", lg: "", xl: "" };

export const inputVariants = cva(
  `${textControlBase} file:me-3 file:inline-flex file:h-full file:border-0 file:bg-transparent file:text-label-lg file:text-foreground`,
  {
    variants: {
      variant: textControlVariant,
      size: {
        xs: `h-7 ${textControlSize.xs} ${textControlRadius.xs}`,
        sm: `h-8 ${textControlSize.sm} ${textControlRadius.sm}`,
        md: `h-9 ${textControlSize.md} ${textControlRadius.md}`,
        lg: `h-10 ${textControlSize.lg} ${textControlRadius.lg}`,
        xl: `h-12 ${textControlSize.xl} ${textControlRadius.xl}`,
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "md",
    },
  },
);

export const floatingControlVariants = cva("group/input relative", {
  variants: {
    variant: { outline: "", soft: "", filled: "", ghost: "", subtle: "" },
    size: sizes,
  },
  compoundVariants: [
    { variant: "outline", size: "xs", class: `h-7 ${textControlRadius.xs}` },
    { variant: "outline", size: "sm", class: `h-8 ${textControlRadius.sm}` },
    { variant: "outline", size: "md", class: `h-9 ${textControlRadius.md}` },
    { variant: "outline", size: "lg", class: `h-10 ${textControlRadius.lg}` },
    { variant: "outline", size: "xl", class: `h-12 ${textControlRadius.xl}` },
    { variant: insideLabel, size: "xs", class: "h-10 [--control-radius:--theme(--radius-lg)]" },
    { variant: insideLabel, size: "sm", class: "h-11 [--control-radius:--theme(--radius-lg)]" },
    { variant: insideLabel, size: "md", class: "h-12 [--control-radius:--theme(--radius-xl)]" },
    { variant: insideLabel, size: "lg", class: "h-13 [--control-radius:--theme(--radius-xl)]" },
    { variant: insideLabel, size: "xl", class: "h-14 [--control-radius:--theme(--radius-xl)]" },
  ],
  defaultVariants: {
    variant: "outline",
    size: "md",
  },
});

export const floatingInputVariants = cva(
  `${textControlBase} peer h-full placeholder:text-transparent focus:placeholder:text-muted-foreground`,
  {
    variants: {
      variant: { ...textControlVariant, outline: "rounded-(--control-radius)" },
      size: textControlSize,
    },
    compoundVariants: [
      { variant: insideLabel, size: "xs", class: "pt-4.5" },
      { variant: insideLabel, size: "sm", class: "pt-5" },
      { variant: insideLabel, size: "md", class: "pt-5.5" },
      { variant: insideLabel, size: "lg", class: "pt-6" },
      { variant: insideLabel, size: "xl", class: "pt-6.5" },
    ],
    defaultVariants: {
      variant: "outline",
      size: "md",
    },
  },
);

const floatInside =
  "peer-focus:translate-y-0 peer-focus:text-body-sm peer-not-placeholder-shown:translate-y-0 peer-not-placeholder-shown:text-body-sm peer-autofill:translate-y-0 peer-autofill:text-body-sm group-data-float/input:translate-y-0 group-data-float/input:text-body-sm";

export const floatingLabelVariants = cva(
  "pointer-events-none absolute top-1/2 -translate-y-1/2 truncate text-body-lg text-muted-foreground md:text-body-md transition-[top,translate,font-size,line-height,color] duration-short-4 ease-standard motion-reduce:transition-none peer-focus:text-primary peer-user-invalid:text-destructive peer-user-invalid:peer-focus:text-destructive peer-disabled:text-foreground/(--disabled-opacity) peer-aria-invalid:text-destructive peer-aria-invalid:peer-focus:text-destructive",
  {
    variants: {
      variant: {
        outline:
          "peer-focus:top-0 peer-focus:text-body-sm peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-body-sm peer-autofill:top-0 peer-autofill:text-body-sm group-data-float/input:top-0 group-data-float/input:text-body-sm",
        soft: floatInside,
        filled: floatInside,
        ghost: floatInside,
        subtle: floatInside,
      },
      size: {
        xs: "start-2 max-w-[calc(100%-1rem)] md:text-body-sm",
        sm: "start-2.5 max-w-[calc(100%-1.25rem)]",
        md: "start-3 max-w-[calc(100%-1.5rem)]",
        lg: "start-3 max-w-[calc(100%-1.5rem)]",
        xl: "start-4 max-w-[calc(100%-2rem)] md:text-body-lg",
      },
    },
    compoundVariants: [
      {
        variant: insideLabel,
        size: "xs",
        class:
          "peer-focus:top-0.5 peer-not-placeholder-shown:top-0.5 peer-autofill:top-0.5 group-data-float/input:top-0.5",
      },
      {
        variant: insideLabel,
        size: "sm",
        class: "peer-focus:top-1 peer-not-placeholder-shown:top-1 peer-autofill:top-1 group-data-float/input:top-1",
      },
      {
        variant: insideLabel,
        size: "md",
        class:
          "peer-focus:top-1.5 peer-not-placeholder-shown:top-1.5 peer-autofill:top-1.5 group-data-float/input:top-1.5",
      },
      {
        variant: insideLabel,
        size: ["lg", "xl"],
        class: "peer-focus:top-2 peer-not-placeholder-shown:top-2 peer-autofill:top-2 group-data-float/input:top-2",
      },
    ],
    defaultVariants: {
      variant: "outline",
      size: "md",
    },
  },
);

export const floatingOutlineVariants = cva(
  "pointer-events-none absolute inset-x-0 -top-[5px] bottom-0 m-0 min-w-0 rounded-(--control-radius) border border-input transition-[border-color] duration-short-3 ease-standard peer-focus-visible:border-2 peer-focus-visible:border-primary peer-user-invalid:border-destructive peer-user-invalid:peer-focus-visible:border-destructive peer-disabled:border-foreground/(--disabled-container-opacity) peer-aria-invalid:border-destructive peer-aria-invalid:peer-focus-visible:border-destructive",
  {
    variants: {
      size: { xs: "px-1", sm: "px-1.5", md: "px-2", lg: "px-2", xl: "px-3" },
    },
    defaultVariants: { size: "md" },
  },
);

export const floatingLegendVariants = cva(
  "invisible float-none h-2.5 max-w-0 overflow-hidden p-0 text-body-sm whitespace-nowrap transition-[max-width] duration-short-2 ease-standard motion-reduce:transition-none group-data-float/input:max-w-full group-data-float/input:px-1 group-has-[input:focus]/input:max-w-full group-has-[input:focus]/input:px-1 group-has-[input:not(:placeholder-shown)]/input:max-w-full group-has-[input:not(:placeholder-shown)]/input:px-1 group-has-[input:autofill]/input:max-w-full group-has-[input:autofill]/input:px-1",
);

export type InputVariants = VariantProps<typeof inputVariants>;
