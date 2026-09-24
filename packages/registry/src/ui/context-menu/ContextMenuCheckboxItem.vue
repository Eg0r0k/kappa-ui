<script setup lang="ts">
import {
  ContextMenuCheckboxItem,
  type ContextMenuCheckboxItemEmits,
  type ContextMenuCheckboxItemProps,
  ContextMenuItemIndicator,
} from "@delta-ui/core/context-menu";
import { useForwardPropsEmits } from "@delta-ui/core/utils";
import { Check } from "@lucide/vue";
import { type HTMLAttributes, computed } from "vue";

import { menuIndicator, menuIndicatorItem } from "@/lib/menu";
import { cn } from "@/lib/utils";

const props = defineProps<ContextMenuCheckboxItemProps & { class?: HTMLAttributes["class"] }>();
const emits = defineEmits<ContextMenuCheckboxItemEmits>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <ContextMenuCheckboxItem v-bind="forwarded" data-slot="context-menu-checkbox-item" :class="cn(menuIndicatorItem, props.class)">
    <span :class="menuIndicator">
      <ContextMenuItemIndicator data-slot="context-menu-item-indicator" class="flex items-center justify-center">
        <slot name="indicator-icon">
          <Check stroke-width="2.5" />
        </slot>
      </ContextMenuItemIndicator>
    </span>
    <slot />
  </ContextMenuCheckboxItem>
</template>
