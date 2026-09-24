<script setup lang="ts">
import { useForwardPropsEmits } from "reka-ui";
import {
  MenuSub,
  type MenuSubEmits,
  type MenuSubProps,
} from "reka-ui/internal";

const props = defineProps<MenuSubProps>();
const emits = defineEmits<MenuSubEmits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <MenuSub v-slot="slotProps" v-bind="forwarded">
    <slot v-bind="slotProps" />
  </MenuSub>
</template>
