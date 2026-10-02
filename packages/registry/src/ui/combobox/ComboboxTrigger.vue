<script setup lang="ts">
import { ChevronDown } from "@lucide/vue";
import { ComboboxTrigger, type ComboboxTriggerProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { comboboxTrigger } from ".";

const props = defineProps<ComboboxTriggerProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return props.asChild ? { ...rest, tabindex: 0 } : rest;
});
</script>

<template>
  <ComboboxTrigger
    v-bind="delegated"
    data-slot="combobox-trigger"
    :class="cn(!props.asChild && comboboxTrigger, props.class)"
  >
    <slot>
      <ChevronDown
        class="transition-[rotate] duration-short-4 ease-standard group-data-[state=open]/combobox-trigger:rotate-180 motion-reduce:transition-none"
      />
    </slot>
  </ComboboxTrigger>
</template>
