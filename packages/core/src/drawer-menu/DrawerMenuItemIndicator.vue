<script setup lang="ts">
import { Primitive } from "reka-ui";
import { computed } from "vue";

import { type DrawerMenuItemIndicatorProps, checkedState, injectDrawerMenuItemIndicatorContext } from "./context";

const props = withDefaults(defineProps<DrawerMenuItemIndicatorProps>(), { as: "span" });

const { state } = injectDrawerMenuItemIndicatorContext();
const shown = computed(() => props.forceMount || state.value !== false);
</script>

<template>
  <Primitive v-if="shown" :as="props.as" :as-child="props.asChild" :data-state="checkedState(state)">
    <slot />
  </Primitive>
</template>
