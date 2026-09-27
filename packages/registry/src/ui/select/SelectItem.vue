<script setup lang="ts">
import { SelectItem, type SelectItemEmits, SelectItemIndicator, type SelectItemProps } from "@kappa-ui/core/select";
import { useForwardPropsEmits } from "@kappa-ui/core/utils";
import { Check } from "@lucide/vue";
import { type HTMLAttributes, computed } from "vue";

import { menuItem } from "@/lib/menu";
import { cn } from "@/lib/utils";
import SelectItemText from "./SelectItemText.vue";

const props = defineProps<SelectItemProps & { class?: HTMLAttributes["class"] }>();
const emits = defineEmits<SelectItemEmits>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <SelectItem
    v-bind="forwarded"
    data-slot="select-item"
    :class="
      cn(
        menuItem,
        'w-full pe-[calc(var(--menu-item-px)*2+var(--menu-icon))] data-[state=checked]:bg-primary/(--state-selected)',
        props.class,
      )
    "
  >
    <span
      class="pointer-events-none absolute end-(--menu-item-px) flex size-(--menu-icon) items-center justify-center text-primary group-data-disabled/menu-item:text-foreground/(--disabled-opacity)"
    >
      <SelectItemIndicator data-slot="select-item-indicator" class="flex items-center justify-center">
        <slot name="indicator-icon">
          <Check stroke-width="2.5" />
        </slot>
      </SelectItemIndicator>
    </span>
    <SelectItemText>
      <slot />
    </SelectItemText>
  </SelectItem>
</template>
