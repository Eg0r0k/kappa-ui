<script setup lang="ts">
import { PinInputInput, type PinInputInputProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { injectPinInputStyle, pinInputSlotVariants } from ".";

const props = defineProps<PinInputInputProps & { class?: HTMLAttributes["class"] }>();

const style = injectPinInputStyle();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <PinInputInput
    v-bind="delegated"
    data-slot="pin-input-slot"
    :aria-invalid="style.invalid"
    :class="cn(pinInputSlotVariants({ variant: style.variant, size: style.size }), props.class)"
  />
</template>
