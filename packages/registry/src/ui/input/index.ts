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
  outline: `rounded-(--frame-radius) border border-input ${focusRing} disabled:border-foreground/(--disabled-container-opacity)`,
  soft: `rounded-(--frame-radius) border border-transparent bg-muted ${focusRing}`,
  filled:
    "rounded-t-(--frame-radius) border-b border-input bg-muted focus-visible:border-primary focus-visible:shadow-[inset_0_-1px_0_var(--color-primary)] data-[state=open]:border-primary data-[state=open]:shadow-[inset_0_-1px_0_var(--color-primary)] disabled:border-foreground/(--disabled-container-opacity) aria-invalid:border-destructive aria-invalid:focus-visible:shadow-[inset_0_-1px_0_var(--color-destructive)] user-invalid:border-destructive user-invalid:focus-visible:shadow-[inset_0_-1px_0_var(--color-destructive)]",
  ghost: `rounded-(--frame-radius) border border-transparent hover:bg-muted focus-visible:bg-muted data-[state=open]:bg-muted ${focusRing} disabled:bg-transparent`,
  subtle: `rounded-(--frame-radius) border border-input bg-muted ${focusRing} disabled:border-foreground/(--disabled-container-opacity)`,
};

const frameFocusRing = `
  has-[:where(input,textarea,[role=spinbutton]):not([data-slot=input-group-addon]_*):focus-visible]:border-primary
  has-[:where(input,textarea,[role=spinbutton]):not([data-slot=input-group-addon]_*):focus-visible]:inset-ring
  has-[:where(input,textarea,[role=spinbutton]):not([data-slot=input-group-addon]_*):focus-visible]:inset-ring-primary
  has-[:where(input,textarea,[role=spinbutton]):not([data-slot=input-group-addon]_*)[aria-invalid=true]]:border-destructive
  has-[:where(input,textarea,[role=spinbutton]):not([data-slot=input-group-addon]_*)[aria-invalid=true]:focus-visible]:inset-ring-destructive
  has-[:where(input,textarea,[role=spinbutton]):not([data-slot=input-group-addon]_*):user-invalid]:border-destructive
  has-[:where(input,textarea,[role=spinbutton]):not([data-slot=input-group-addon]_*):user-invalid:focus-visible]:inset-ring-destructive
`;

const frameDisabledBorder = `
  has-[:where(input,textarea,[role=spinbutton]):not([data-slot=input-group-addon]_*):disabled]:border-foreground/(--disabled-container-opacity)
`;

export const textControlFrameVariant = {
  outline: `rounded-(--frame-radius) border border-input ${frameFocusRing} ${frameDisabledBorder}`,
  soft: `rounded-(--frame-radius) border border-transparent bg-muted ${frameFocusRing}`,
  filled:
    "rounded-t-(--frame-radius) border-b border-input bg-muted has-[:where(input,textarea,[role=spinbutton]):not([data-slot=input-group-addon]_*):focus-visible]:border-primary has-[:where(input,textarea,[role=spinbutton]):not([data-slot=input-group-addon]_*):focus-visible]:shadow-[inset_0_-1px_0_var(--color-primary)] has-[:where(input,textarea,[role=spinbutton]):not([data-slot=input-group-addon]_*)[aria-invalid=true]]:border-destructive has-[:where(input,textarea,[role=spinbutton]):not([data-slot=input-group-addon]_*)[aria-invalid=true]:focus-visible]:shadow-[inset_0_-1px_0_var(--color-destructive)] has-[:where(input,textarea,[role=spinbutton]):not([data-slot=input-group-addon]_*):user-invalid]:border-destructive has-[:where(input,textarea,[role=spinbutton]):not([data-slot=input-group-addon]_*):user-invalid:focus-visible]:shadow-[inset_0_-1px_0_var(--color-destructive)] has-[:where(input,textarea,[role=spinbutton]):not([data-slot=input-group-addon]_*):disabled]:border-foreground/(--disabled-container-opacity)",
  ghost: `rounded-(--frame-radius) border border-transparent hover:bg-muted has-[:where(input,textarea,[role=spinbutton]):not([data-slot=input-group-addon]_*):focus-visible]:bg-muted ${frameFocusRing} has-[:where(input,textarea,[role=spinbutton]):not([data-slot=input-group-addon]_*):disabled]:bg-transparent`,
  subtle: `rounded-(--frame-radius) border border-input bg-muted ${frameFocusRing} ${frameDisabledBorder}`,
};

export const textControlSize = {
  xs: "px-(--control-padding-xs) md:text-body-sm",
  sm: "px-(--control-padding-sm)",
  md: "px-(--control-padding-md)",
  lg: "px-(--control-padding-lg)",
  xl: "px-(--control-padding-xl) md:text-body-lg",
};

export const textControlRadius = {
  xs: "[--frame-radius:--theme(--radius-control-xs)]",
  sm: "[--frame-radius:--theme(--radius-control-sm)]",
  md: "[--frame-radius:--theme(--radius-control-md)]",
  lg: "[--frame-radius:--theme(--radius-control-lg)]",
  xl: "[--frame-radius:--theme(--radius-control-xl)]",
};

export type TextControlVariant = keyof typeof textControlVariant;
export type TextControlSize = keyof typeof textControlSize;

export const inputVariants = cva(
  `${textControlBase} file:me-3 file:inline-flex file:h-full file:border-0 file:bg-transparent file:text-label-lg file:text-foreground`,
  {
    variants: {
      variant: textControlVariant,
      size: {
        xs: `h-(--control-height-xs) ${textControlSize.xs} ${textControlRadius.xs}`,
        sm: `h-(--control-height-sm) ${textControlSize.sm} ${textControlRadius.sm}`,
        md: `h-(--control-height-md) ${textControlSize.md} ${textControlRadius.md}`,
        lg: `h-(--control-height-lg) ${textControlSize.lg} ${textControlRadius.lg}`,
        xl: `h-(--control-height-xl) ${textControlSize.xl} ${textControlRadius.xl}`,
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "md",
    },
  },
);

export type InputVariants = VariantProps<typeof inputVariants>;
