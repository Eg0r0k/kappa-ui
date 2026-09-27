<script setup lang="ts">
import { PopoverRoot, type PopoverRootEmits, type PopoverRootProps } from "@kappa-ui/core/popover";
import { useForwardPropsEmits } from "@kappa-ui/core/utils";

const props = defineProps<PopoverRootProps>();
const emits = defineEmits<PopoverRootEmits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <PopoverRoot v-slot="slotProps" v-bind="forwarded">
    <slot v-bind="slotProps" />
  </PopoverRoot>
</template>
