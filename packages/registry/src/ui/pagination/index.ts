import { createContext } from "reka-ui";
import type { ComputedRef } from "vue";

import type { ButtonColor, ButtonVariants } from "@/ui/button";

export { default as Pagination } from "./Pagination.vue";
export { default as PaginationContent } from "./PaginationContent.vue";
export { default as PaginationEllipsis } from "./PaginationEllipsis.vue";
export { default as PaginationItem } from "./PaginationItem.vue";
export { default as PaginationLink } from "./PaginationLink.vue";
export { default as PaginationNext } from "./PaginationNext.vue";
export { default as PaginationPrevious } from "./PaginationPrevious.vue";

export type PaginationSize = "xs" | "sm" | "md" | "lg" | "xl";
export type PaginationVariant = NonNullable<ButtonVariants["variant"]>;
export type PaginationColor = ButtonColor | (string & {});

export type PaginationLook = {
  variant: PaginationVariant;
  activeVariant: PaginationVariant;
  color: PaginationColor;
  activeColor: PaginationColor;
  size: PaginationSize;
};

export const [injectPaginationLook, providePaginationLook] = createContext<ComputedRef<PaginationLook>>("Pagination");

export const paginationButtonSize = { xs: "xs", sm: "sm", md: "default", lg: "lg", xl: "xl" } as const;

export const paginationPageSize: Record<PaginationSize, string> = {
  xs: "min-w-(--control-height-xs) px-1.5",
  sm: "min-w-(--control-height-sm) px-2",
  md: "min-w-(--control-height-md) px-2",
  lg: "min-w-(--control-height-lg) px-2.5",
  xl: "min-w-(--control-height-xl) px-3",
};

export const paginationEllipsisSize: Record<PaginationSize, string> = {
  xs: "size-(--control-height-xs) [&_svg]:size-(--control-icon-xs)",
  sm: "size-(--control-height-sm) [&_svg]:size-(--control-icon-sm)",
  md: "size-(--control-height-md) [&_svg]:size-(--control-icon-md)",
  lg: "size-(--control-height-lg) [&_svg]:size-(--control-icon-lg)",
  xl: "size-(--control-height-xl) [&_svg]:size-(--control-icon-xl)",
};
