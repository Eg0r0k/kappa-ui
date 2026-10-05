<script setup lang="ts">
import { Check } from "@lucide/vue";
import {
  ComboboxItem,
  type ComboboxItemEmits,
  ComboboxItemIndicator,
  type ComboboxItemProps,
  useForwardPropsEmits,
} from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { menuItem } from "@/ui/menu";

const props = defineProps<ComboboxItemProps & { class?: HTMLAttributes["class"] }>();
const emits = defineEmits<ComboboxItemEmits>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <ComboboxItem
    v-bind="forwarded"
    data-slot="combobox-item"
    :class="
      cn(
        menuItem,
        `
          w-full pe-[calc(var(--menu-item-px)+var(--menu-icon)+var(--menu-item-gap))]
          data-[state=checked]:bg-primary/(--state-selected)
        `,
        props.class,
      )
    "
  >
    <slot />
    <span
      class="pointer-events-none absolute end-(--menu-item-px) flex size-(--menu-icon) items-center justify-center text-primary group-data-disabled/menu-item:text-foreground/(--disabled-opacity)"
    >
      <ComboboxItemIndicator data-slot="combobox-item-indicator" class="flex items-center justify-center">
        <slot name="indicator-icon">
          <Check stroke-width="2.5" />
        </slot>
      </ComboboxItemIndicator>
    </span>
  </ComboboxItem>
</template>
