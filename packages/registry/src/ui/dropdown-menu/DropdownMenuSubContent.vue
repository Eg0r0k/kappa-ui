<script setup lang="ts">
import {
  DropdownMenuPortal,
  DropdownMenuSubContent,
  type DropdownMenuSubContentEmits,
  type DropdownMenuSubContentProps,
} from "@kappa-ui/core/dropdown-menu";
import { injectOverlayPortalTarget } from "@kappa-ui/core/overlay";
import { useForwardPropsEmits } from "@kappa-ui/core/utils";
import { type HTMLAttributes, computed, toRef } from "vue";

import { cn } from "@/lib/utils";
import { overlaySurface } from "@/ui/popover";
import { type DropdownMenuSize, injectDropdownMenuSize, dropdownMenuSizeVariants, provideDropdownMenuSize } from ".";

defineOptions({ inheritAttrs: false });

const props = defineProps<DropdownMenuSubContentProps & { size?: DropdownMenuSize; class?: HTMLAttributes["class"] }>();
const emits = defineEmits<DropdownMenuSubContentEmits>();

const delegated = computed(() => {
  const { class: _, size: __, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
const portalTarget = injectOverlayPortalTarget(null);

const parentSize = injectDropdownMenuSize(null);
const size = toRef(() => props.size ?? parentSize?.value ?? "md");
provideDropdownMenuSize(size);
</script>

<template>
  <DropdownMenuPortal :to="portalTarget ?? undefined">
    <DropdownMenuSubContent
      v-bind="{ ...$attrs, ...forwarded }"
      data-slot="dropdown-menu-sub-content"
      :data-size="size"
      :class="
        cn(
          overlaySurface,
          'max-h-(--reka-dropdown-menu-content-available-height) flex min-w-32 flex-col gap-0.5 overflow-x-hidden overflow-y-auto origin-(--reka-dropdown-menu-content-transform-origin)',
          dropdownMenuSizeVariants({ size }),
          props.class,
        )
      "
    >
      <slot />
    </DropdownMenuSubContent>
  </DropdownMenuPortal>
</template>
