import { createContext } from "@kappa-ui/core/utils";
import type { ComputedRef } from "vue";

import type { ButtonVariants } from "@/ui/button";

export { default as Pagination } from "./Pagination.vue";
export { default as PaginationContent } from "./PaginationContent.vue";
export { default as PaginationEllipsis } from "./PaginationEllipsis.vue";
export { default as PaginationItem } from "./PaginationItem.vue";
export { default as PaginationLink } from "./PaginationLink.vue";
export { default as PaginationNext } from "./PaginationNext.vue";
export { default as PaginationPrevious } from "./PaginationPrevious.vue";

export type PaginationSize = "xs" | "sm" | "md" | "lg" | "xl";
export type PaginationVariant = NonNullable<ButtonVariants["variant"]>;
export type PaginationColor = NonNullable<ButtonVariants["color"]>;

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
  xs: "min-w-7 px-1.5",
  sm: "min-w-8 px-2",
  md: "min-w-9 px-2",
  lg: "min-w-10 px-2.5",
  xl: "min-w-12 px-3",
};

export const paginationEllipsisSize: Record<PaginationSize, string> = {
  xs: "size-7 [&_svg]:size-3.5",
  sm: "size-8 [&_svg]:size-4",
  md: "size-9 [&_svg]:size-4",
  lg: "size-10 [&_svg]:size-4",
  xl: "size-12 [&_svg]:size-4",
};
