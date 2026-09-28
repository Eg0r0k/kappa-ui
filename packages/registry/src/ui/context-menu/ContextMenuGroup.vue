<script setup lang="ts">
import { ContextMenuGroup, type ContextMenuGroupProps } from "reka-ui";

const props = defineProps<ContextMenuGroupProps>();
</script>

<template>
  <ContextMenuGroup v-bind="props" data-slot="context-menu-group" class="flex flex-col gap-0.5">
    <slot />
  </ContextMenuGroup>
</template>
