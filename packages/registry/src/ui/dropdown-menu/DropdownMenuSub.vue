<script setup lang="ts">
import { DropdownMenuSub, type DropdownMenuSubEmits, type DropdownMenuSubProps } from "@kappa-ui/core/dropdown-menu";
import { useForwardPropsEmits } from "@kappa-ui/core/utils";

const props = defineProps<DropdownMenuSubProps>();
const emits = defineEmits<DropdownMenuSubEmits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <DropdownMenuSub v-slot="slotProps" v-bind="forwarded">
    <slot v-bind="slotProps" />
  </DropdownMenuSub>
</template>
