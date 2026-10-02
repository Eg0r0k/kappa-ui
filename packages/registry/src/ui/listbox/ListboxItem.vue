<script setup lang="ts">
import { Check } from "@lucide/vue";
import {
  ListboxItem,
  type ListboxItemEmits,
  ListboxItemIndicator,
  type ListboxItemProps,
  useForwardPropsEmits,
} from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<ListboxItemProps & { class?: HTMLAttributes["class"] }>();
const emits = defineEmits<ListboxItemEmits>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <ListboxItem
    v-bind="forwarded"
    data-slot="listbox-item"
    :class="
      cn(
        'group/listbox-item relative flex min-h-9 cursor-default items-center gap-3 rounded-lg px-3 py-2 text-body-md outline-none select-none before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-foreground before:opacity-0 before:transition-opacity before:duration-short-4 before:ease-standard hover:before:opacity-(--state-hover) active:before:opacity-(--state-pressed) focus-visible:focus-ring data-[state=checked]:bg-primary/(--state-selected) data-disabled:pointer-events-none data-disabled:text-foreground/(--disabled-opacity) data-disabled:data-[state=checked]:bg-foreground/(--disabled-container-opacity) group-data-disabled/listbox:text-foreground/(--disabled-opacity) group-data-disabled/listbox:data-[state=checked]:bg-foreground/(--disabled-container-opacity) forced-colors:before:hidden [&_svg]:pointer-events-none [&_svg]:shrink-0 icon-size-4',
        props.class,
      )
    "
  >
    <slot />
    <ListboxItemIndicator
      data-slot="listbox-item-indicator"
      class="ms-auto flex shrink-0 items-center text-primary group-data-disabled/listbox-item:text-foreground/(--disabled-opacity) group-data-disabled/listbox:text-foreground/(--disabled-opacity)"
    >
      <slot name="indicator-icon">
        <Check stroke-width="2.5" />
      </slot>
    </ListboxItemIndicator>
  </ListboxItem>
</template>
