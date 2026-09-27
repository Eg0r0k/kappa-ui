<script setup lang="ts">
import { MenuRadioGroup, type MenuRadioGroupEmits, type MenuRadioGroupProps } from "@kappa-ui/core/menu";
import { useForwardPropsEmits } from "@kappa-ui/core/utils";

const props = defineProps<MenuRadioGroupProps>();
const emits = defineEmits<MenuRadioGroupEmits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <MenuRadioGroup v-bind="forwarded" data-slot="menu-radio-group" class="flex flex-col gap-0.5">
    <slot />
  </MenuRadioGroup>
</template>
