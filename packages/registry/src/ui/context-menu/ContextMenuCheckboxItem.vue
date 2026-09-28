<script setup lang="ts">
import { Check } from "@lucide/vue";
import {
  ContextMenuCheckboxItem,
  type ContextMenuCheckboxItemEmits,
  type ContextMenuCheckboxItemProps,
  ContextMenuItemIndicator,
  useForwardPropsEmits,
} from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { contextMenuIndicator, contextMenuIndicatorItem } from ".";

const props = defineProps<ContextMenuCheckboxItemProps & { class?: HTMLAttributes["class"] }>();
const emits = defineEmits<ContextMenuCheckboxItemEmits>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <ContextMenuCheckboxItem
    v-bind="forwarded"
    data-slot="context-menu-checkbox-item"
    :class="cn(contextMenuIndicatorItem, props.class)"
  >
    <span :class="contextMenuIndicator">
      <ContextMenuItemIndicator data-slot="context-menu-item-indicator" class="flex items-center justify-center">
        <slot name="indicator-icon">
          <Check stroke-width="2.5" />
        </slot>
      </ContextMenuItemIndicator>
    </span>
    <slot />
  </ContextMenuCheckboxItem>
</template>
