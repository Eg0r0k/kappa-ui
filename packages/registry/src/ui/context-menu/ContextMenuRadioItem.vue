<script setup lang="ts">
import {
  ContextMenuItemIndicator,
  ContextMenuRadioItem,
  type ContextMenuRadioItemEmits,
  type ContextMenuRadioItemProps,
} from "@kappa-ui/core/context-menu";
import { useForwardPropsEmits } from "@kappa-ui/core/utils";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { contextMenuIndicator, contextMenuIndicatorItem, contextMenuRadioDot } from ".";

const props = defineProps<ContextMenuRadioItemProps & { class?: HTMLAttributes["class"] }>();
const emits = defineEmits<ContextMenuRadioItemEmits>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <ContextMenuRadioItem
    v-bind="forwarded"
    data-slot="context-menu-radio-item"
    :class="cn(contextMenuIndicatorItem, props.class)"
  >
    <span :class="contextMenuIndicator">
      <ContextMenuItemIndicator data-slot="context-menu-item-indicator" class="flex items-center justify-center">
        <slot name="indicator-icon">
          <span :class="contextMenuRadioDot" />
        </slot>
      </ContextMenuItemIndicator>
    </span>
    <slot />
  </ContextMenuRadioItem>
</template>
