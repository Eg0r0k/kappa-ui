<script setup lang="ts">
import { ContextMenuSub, type ContextMenuSubEmits, type ContextMenuSubProps } from "@delta-ui/core/context-menu";
import { useForwardPropsEmits } from "@delta-ui/core/utils";

const props = defineProps<ContextMenuSubProps>();
const emits = defineEmits<ContextMenuSubEmits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <ContextMenuSub v-slot="slotProps" v-bind="forwarded">
    <slot v-bind="slotProps" />
  </ContextMenuSub>
</template>
