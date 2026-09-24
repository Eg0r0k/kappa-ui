<script setup lang="ts">
import { DropdownMenuItem, type DropdownMenuItemEmits, type DropdownMenuItemProps, useForwardPropsEmits } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { menuItem } from "@/lib/menu";
import { cn } from "@/lib/utils";

const props = defineProps<
  DropdownMenuItemProps & {
    inset?: boolean;
    variant?: "default" | "destructive";
    class?: HTMLAttributes["class"];
  }
>();
const emits = defineEmits<DropdownMenuItemEmits>();

const delegated = computed(() => {
  const { class: _, inset: __, variant: ___, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <DropdownMenuItem
    v-bind="forwarded"
    data-slot="dropdown-menu-item"
    :data-inset="props.inset || undefined"
    :data-variant="props.variant ?? 'default'"
    :class="cn(menuItem, props.class)"
  >
    <slot />
  </DropdownMenuItem>
</template>
