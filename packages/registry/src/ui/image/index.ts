import { cva, type VariantProps } from "class-variance-authority";

export { default as Image } from "./Image.vue";
export { default as ImageError } from "./ImageError.vue";
export { default as ImageLoading } from "./ImageLoading.vue";

export type ImageState = "idle" | "loading" | "loaded" | "error";

export type ImageSource = {
  srcset: string;
  type?: string;
  media?: string;
  sizes?: string;
  width?: number;
  height?: number;
};

export const imageImgVariants = cva(
  "absolute inset-0 size-full group-data-[state=error]/image:group-has-[>[data-slot=image-error]]/image:invisible",
  {
    variants: {
      fit: {
        cover: "object-cover",
        contain: "object-contain",
        fill: "object-fill",
        none: "object-none",
        "scale-down": "object-scale-down",
      },
    },
    defaultVariants: { fit: "cover" },
  },
);

export type ImageFit = NonNullable<VariantProps<typeof imageImgVariants>["fit"]>;

export const imageLayer =
  "invisible absolute inset-0 grid place-items-center bg-muted text-muted-foreground opacity-0 transition-[opacity,visibility] duration-short-4 ease-standard motion-reduce:transition-none";
