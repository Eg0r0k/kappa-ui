<script setup lang="ts">
import { NavigationMenuItem, type NavigationMenuItemProps } from "reka-ui";
import { type HTMLAttributes, computed, useId } from "vue";

import { cn } from "@/lib/utils";
import { encodeValue } from ".";

const props = defineProps<NavigationMenuItemProps & { class?: HTMLAttributes["class"] }>();

const fallbackValue = useId();

const delegated = computed(() => {
  const { class: _, value, ...rest } = props;
  return { ...rest, value: encodeValue(value || fallbackValue) };
});
</script>

<template>
  <!-- Static by default: the indicator measures the trigger's offsetLeft from the list, which a positioned item would break. -->
  <NavigationMenuItem
    v-bind="delegated"
    data-slot="navigation-menu-item"
    :class="cn('flex items-center group-data-[viewport=false]/navigation-menu:relative', props.class)"
  >
    <slot />
  </NavigationMenuItem>
</template>
