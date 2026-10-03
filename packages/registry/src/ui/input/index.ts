import { type VariantProps, cva } from "class-variance-authority";

export { default as Input } from "./Input.vue";

export const textControlBase = `
  w-full min-w-0 bg-transparent text-body-lg text-foreground outline-none
  transition-[color,background-color,border-color,box-shadow] duration-short-3 ease-standard
  selection:bg-primary selection:text-primary-foreground
  placeholder:text-muted-foreground
  disabled:cursor-not-allowed disabled:text-foreground/(--disabled-opacity)
  disabled:placeholder:text-foreground/(--disabled-opacity)
  md:text-body-md
`;

const focusRing = `
  focus-visible:border-primary focus-visible:inset-ring focus-visible:inset-ring-primary
  data-[state=open]:border-primary data-[state=open]:inset-ring data-[state=open]:inset-ring-primary
  aria-invalid:border-destructive
  aria-invalid:focus-visible:inset-ring-destructive
  user-invalid:border-destructive
  user-invalid:focus-visible:inset-ring-destructive
`;

export const textControlVariant = {
  outline: `rounded-(--control-radius) border border-input ${focusRing} disabled:border-foreground/(--disabled-container-opacity)`,
  soft: `rounded-(--control-radius) border border-transparent bg-muted ${focusRing}`,
  filled:
    "rounded-t-(--control-radius) border-b border-input bg-muted focus-visible:border-primary focus-visible:shadow-[inset_0_-1px_0_var(--color-primary)] data-[state=open]:border-primary data-[state=open]:shadow-[inset_0_-1px_0_var(--color-primary)] disabled:border-foreground/(--disabled-container-opacity) aria-invalid:border-destructive aria-invalid:focus-visible:shadow-[inset_0_-1px_0_var(--color-destructive)] user-invalid:border-destructive user-invalid:focus-visible:shadow-[inset_0_-1px_0_var(--color-destructive)]",
  ghost: `rounded-(--control-radius) border border-transparent hover:bg-muted focus-visible:bg-muted data-[state=open]:bg-muted ${focusRing} disabled:bg-transparent`,
  subtle: `rounded-(--control-radius) border border-input bg-muted ${focusRing} disabled:border-foreground/(--disabled-container-opacity)`,
};

const frameFocusRing = `
  has-[>:is(input,textarea):focus-visible]:border-primary has-[>:is(input,textarea):focus-visible]:inset-ring
  has-[>:is(input,textarea):focus-visible]:inset-ring-primary
  has-[>:is(input,textarea)[aria-invalid=true]]:border-destructive
  has-[>:is(input,textarea)[aria-invalid=true]:focus-visible]:inset-ring-destructive
  has-[>:is(input,textarea):user-invalid]:border-destructive
  has-[>:is(input,textarea):user-invalid:focus-visible]:inset-ring-destructive
`;

const frameDisabledBorder = "has-[>:is(input,textarea):disabled]:border-foreground/(--disabled-container-opacity)";

export const textControlFrameVariant = {
  outline: `rounded-(--control-radius) border border-input ${frameFocusRing} ${frameDisabledBorder}`,
  soft: `rounded-(--control-radius) border border-transparent bg-muted ${frameFocusRing}`,
  filled:
    "rounded-t-(--control-radius) border-b border-input bg-muted has-[>:is(input,textarea):focus-visible]:border-primary has-[>:is(input,textarea):focus-visible]:shadow-[inset_0_-1px_0_var(--color-primary)] has-[>:is(input,textarea)[aria-invalid=true]]:border-destructive has-[>:is(input,textarea)[aria-invalid=true]:focus-visible]:shadow-[inset_0_-1px_0_var(--color-destructive)] has-[>:is(input,textarea):user-invalid]:border-destructive has-[>:is(input,textarea):user-invalid:focus-visible]:shadow-[inset_0_-1px_0_var(--color-destructive)] has-[>:is(input,textarea):disabled]:border-foreground/(--disabled-container-opacity)",
  ghost: `rounded-(--control-radius) border border-transparent hover:bg-muted has-[>:is(input,textarea):focus-visible]:bg-muted ${frameFocusRing} has-[>:is(input,textarea):disabled]:bg-transparent`,
  subtle: `rounded-(--control-radius) border border-input bg-muted ${frameFocusRing} ${frameDisabledBorder}`,
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

export type InputVariants = VariantProps<typeof inputVariants>;
