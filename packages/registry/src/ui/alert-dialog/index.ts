import { type VariantProps, cva } from "class-variance-authority";

import { dialogSurface } from "@/ui/dialog";

export { default as AlertDialog } from "./AlertDialog.vue";
export { default as AlertDialogAction } from "./AlertDialogAction.vue";
export { default as AlertDialogCancel } from "./AlertDialogCancel.vue";
export { default as AlertDialogContent } from "./AlertDialogContent.vue";
export { default as AlertDialogDescription } from "./AlertDialogDescription.vue";
export { default as AlertDialogFooter } from "./AlertDialogFooter.vue";
export { default as AlertDialogHeader } from "./AlertDialogHeader.vue";
export { default as AlertDialogMedia } from "./AlertDialogMedia.vue";
export { default as AlertDialogTitle } from "./AlertDialogTitle.vue";
export { default as AlertDialogTrigger } from "./AlertDialogTrigger.vue";

export const alertDialogContentVariants = cva(
  `${dialogSurface}
    group/alert-dialog fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] -translate-x-1/2
    -translate-y-1/2
  `,
  {
    variants: {
      size: { sm: "max-w-xs text-center text-balance", md: "max-w-lg" },
    },
    defaultVariants: { size: "md" },
  },
);

export type AlertDialogSize = NonNullable<VariantProps<typeof alertDialogContentVariants>["size"]>;
