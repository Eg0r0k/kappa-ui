<script setup lang="ts">
import {
  ContextMenuRadioGroup,
  type ContextMenuRadioGroupEmits,
  type ContextMenuRadioGroupProps,
} from "@delta-ui/core/context-menu";
import { useForwardPropsEmits } from "@delta-ui/core/utils";

const props = defineProps<ContextMenuRadioGroupProps>();
const emits = defineEmits<ContextMenuRadioGroupEmits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <ContextMenuRadioGroup v-bind="forwarded" data-slot="context-menu-radio-group" class="flex flex-col gap-0.5">
    <slot />
  </ContextMenuRadioGroup>
</template>
