<script setup lang="ts">
import {
  MenuGroup,
  type MenuGroupProps,
} from "reka-ui/internal";

const props = defineProps<MenuGroupProps>();
</script>

<template>
  <MenuGroup v-bind="props" data-slot="menu-group" class="flex flex-col gap-0.5">
    <slot />
  </MenuGroup>
</template>
