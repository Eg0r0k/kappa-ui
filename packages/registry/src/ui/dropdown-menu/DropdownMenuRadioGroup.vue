<script setup lang="ts">
import {
  DropdownMenuRadioGroup,
  type DropdownMenuRadioGroupEmits,
  type DropdownMenuRadioGroupProps,
} from "@delta-ui/core/dropdown-menu";
import { useForwardPropsEmits } from "@delta-ui/core/utils";

const props = defineProps<DropdownMenuRadioGroupProps>();
const emits = defineEmits<DropdownMenuRadioGroupEmits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <DropdownMenuRadioGroup v-bind="forwarded" data-slot="dropdown-menu-radio-group" class="flex flex-col gap-0.5">
    <slot />
  </DropdownMenuRadioGroup>
</template>
