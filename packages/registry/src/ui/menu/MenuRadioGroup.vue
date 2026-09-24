<script setup lang="ts">
import { useForwardPropsEmits } from "reka-ui";
import {
  MenuRadioGroup,
  type MenuRadioGroupEmits,
  type MenuRadioGroupProps,
} from "reka-ui/internal";

const props = defineProps<MenuRadioGroupProps>();
const emits = defineEmits<MenuRadioGroupEmits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <MenuRadioGroup v-bind="forwarded" data-slot="menu-radio-group" class="flex flex-col gap-0.5">
    <slot />
  </MenuRadioGroup>
</template>
