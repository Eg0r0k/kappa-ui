import { cva, type VariantProps } from "class-variance-authority";
import { createContext } from "reka-ui";
import type { Ref } from "vue";

export { default as Image } from "./Image.vue";
export { default as ImageError } from "./ImageError.vue";
export { default as ImageLoading } from "./ImageLoading.vue";

export type ImageState = "idle" | "loading" | "loaded" | "error";

// An ImageError inside counts itself here, so the root can hide the broken img
// only when there is a layer to show instead.
export const [injectImageContext, provideImageContext] = createContext<{ errorLayers: Ref<number> }>("Image");

export type ImageSource = {
  srcset: string;
  type?: string;
  media?: string;
  sizes?: string;
  width?: number;
  height?: number;
};

export const imageImgVariants = cva(
  "absolute inset-0 size-full group-data-[state=error]/image:group-data-error-layer/image:invisible",
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

export const imageLayer = `
  invisible absolute inset-0 grid place-items-center bg-muted text-muted-foreground opacity-0
  transition-[opacity,visibility,display] transition-discrete duration-short-4 ease-standard
  starting:opacity-0
  motion-reduce:transition-none
`;
