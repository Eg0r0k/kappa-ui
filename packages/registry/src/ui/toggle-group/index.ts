import { createContext } from "reka-ui";
import type { ComputedRef } from "vue";

import type { ButtonColor, ButtonVariants } from "@/ui/button";
import type { ToggleVariants } from "@/ui/toggle";

export { default as ToggleGroup } from "./ToggleGroup.vue";
export { default as ToggleGroupItem } from "./ToggleGroupItem.vue";

export type ToggleGroupStyle = {
  variant?: ButtonVariants["variant"];
  activeVariant?: ToggleVariants["activeVariant"];
  color?: ButtonColor | (string & {});
  activeColor?: ButtonColor | (string & {});
  size?: ButtonVariants["size"];
};

export const [injectToggleGroupStyle, provideToggleGroupStyle] =
  createContext<ComputedRef<ToggleGroupStyle>>("ToggleGroup");
