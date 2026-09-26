<script setup lang="ts">
import {
  DropdownMenuCheckboxItem,
  type DropdownMenuCheckboxItemEmits,
  type DropdownMenuCheckboxItemProps,
  DropdownMenuItemIndicator,
} from "@delta-ui/core/dropdown-menu";
import { useForwardPropsEmits } from "@delta-ui/core/utils";
import { Check } from "@lucide/vue";
import { type HTMLAttributes, computed } from "vue";

import { menuIndicator, menuIndicatorItem } from "@/lib/menu";
import { cn } from "@/lib/utils";

const props = defineProps<DropdownMenuCheckboxItemProps & { class?: HTMLAttributes["class"] }>();
const emits = defineEmits<DropdownMenuCheckboxItemEmits>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <DropdownMenuCheckboxItem
    v-bind="forwarded"
    data-slot="dropdown-menu-checkbox-item"
    :class="cn(menuIndicatorItem, props.class)"
  >
    <span :class="menuIndicator">
      <DropdownMenuItemIndicator data-slot="dropdown-menu-item-indicator" class="flex items-center justify-center">
        <slot name="indicator-icon">
          <Check stroke-width="2.5" />
        </slot>
      </DropdownMenuItemIndicator>
    </span>
    <slot />
  </DropdownMenuCheckboxItem>
</template>
