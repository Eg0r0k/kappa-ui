<script setup lang="ts">
import { DrawerRoot, type DrawerRootEmits, type DrawerRootProps } from "@kappa-ui/core/drawer";
import { useForwardPropsEmits } from "reka-ui";

const props = defineProps<DrawerRootProps>();
const emits = defineEmits<DrawerRootEmits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <DrawerRoot v-slot="slotProps" v-bind="forwarded">
    <slot v-bind="slotProps" />
  </DrawerRoot>
</template>
