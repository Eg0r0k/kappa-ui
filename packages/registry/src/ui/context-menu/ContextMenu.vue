<script setup lang="ts">
import { ContextMenuRoot, type ContextMenuRootEmits, type ContextMenuRootProps } from "@kappa-ui/core/context-menu";
import { useForwardPropsEmits } from "@kappa-ui/core/utils";

const props = defineProps<ContextMenuRootProps>();
const emits = defineEmits<ContextMenuRootEmits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <ContextMenuRoot v-slot="slotProps" v-bind="forwarded">
    <slot v-bind="slotProps" />
  </ContextMenuRoot>
</template>
