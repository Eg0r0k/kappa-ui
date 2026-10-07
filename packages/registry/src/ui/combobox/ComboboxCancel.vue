<script setup lang="ts">
import { X } from "@lucide/vue";
import { ComboboxCancel, type ComboboxCancelProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import vRipple from "@/lib/ripple";
import { cn } from "@/lib/utils";
import { comboboxCancel } from ".";

const props = defineProps<ComboboxCancelProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <ComboboxCancel
    v-ripple
    v-bind="delegated"
    data-slot="combobox-cancel"
    aria-label="Clear"
    :class="cn(comboboxCancel, props.class)"
  >
    <slot>
      <X />
    </slot>
  </ComboboxCancel>
</template>
