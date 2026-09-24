<script setup lang="ts">
import {
  ContextMenuItem,
  type ContextMenuItemEmits,
  type ContextMenuItemProps,
} from "@delta-ui/core/context-menu";
import { useForwardPropsEmits } from "@delta-ui/core/utils";
import { type HTMLAttributes, computed } from "vue";

import { menuItem } from "@/lib/menu";
import { cn } from "@/lib/utils";

const props = defineProps<
  ContextMenuItemProps & {
    inset?: boolean;
    variant?: "default" | "destructive";
    class?: HTMLAttributes["class"];
  }
>();
const emits = defineEmits<ContextMenuItemEmits>();

const delegated = computed(() => {
  const { class: _, inset: __, variant: ___, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <ContextMenuItem
    v-bind="forwarded"
    data-slot="context-menu-item"
    :data-inset="props.inset || undefined"
    :data-variant="props.variant ?? 'default'"
    :class="cn(menuItem, props.class)"
  >
    <slot />
  </ContextMenuItem>
</template>
