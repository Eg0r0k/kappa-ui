<script setup lang="ts">
import {
  ContextMenuRadioItem,
  type ContextMenuRadioItemEmits,
  type ContextMenuRadioItemProps,
  ContextMenuItemIndicator,
  useForwardPropsEmits,
} from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { menuIndicator, menuIndicatorItem, menuRadioDot } from "@/lib/menu";
import { cn } from "@/lib/utils";

const props = defineProps<ContextMenuRadioItemProps & { class?: HTMLAttributes["class"] }>();
const emits = defineEmits<ContextMenuRadioItemEmits>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <ContextMenuRadioItem v-bind="forwarded" data-slot="context-menu-radio-item" :class="cn(menuIndicatorItem, props.class)">
    <span :class="menuIndicator">
      <ContextMenuItemIndicator data-slot="context-menu-item-indicator" class="flex items-center justify-center">
        <slot name="indicator-icon">
          <span :class="menuRadioDot" />
        </slot>
      </ContextMenuItemIndicator>
    </span>
    <slot />
  </ContextMenuRadioItem>
</template>
