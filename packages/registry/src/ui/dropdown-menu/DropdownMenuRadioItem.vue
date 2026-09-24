<script setup lang="ts">
import {
  DropdownMenuItemIndicator,
  DropdownMenuRadioItem,
  type DropdownMenuRadioItemEmits,
  type DropdownMenuRadioItemProps,
} from "@delta-ui/core/dropdown-menu";
import { useForwardPropsEmits } from "@delta-ui/core/utils";
import { type HTMLAttributes, computed } from "vue";

import { menuIndicator, menuIndicatorItem, menuRadioDot } from "@/lib/menu";
import { cn } from "@/lib/utils";

const props = defineProps<DropdownMenuRadioItemProps & { class?: HTMLAttributes["class"] }>();
const emits = defineEmits<DropdownMenuRadioItemEmits>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <DropdownMenuRadioItem v-bind="forwarded" data-slot="dropdown-menu-radio-item" :class="cn(menuIndicatorItem, props.class)">
    <span :class="menuIndicator">
      <DropdownMenuItemIndicator data-slot="dropdown-menu-item-indicator" class="flex items-center justify-center">
        <slot name="indicator-icon">
          <span :class="menuRadioDot" />
        </slot>
      </DropdownMenuItemIndicator>
    </span>
    <slot />
  </DropdownMenuRadioItem>
</template>
