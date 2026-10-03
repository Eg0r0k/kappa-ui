<script setup lang="ts">
import { ToolbarSeparator, type ToolbarSeparatorProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<ToolbarSeparatorProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <ToolbarSeparator
    v-bind="delegated"
    data-slot="toolbar-separator"
    :class="
      cn(
        `
          shrink-0 bg-border
          data-[orientation=horizontal]:mx-1 data-[orientation=horizontal]:w-px
          data-[orientation=horizontal]:self-stretch
          data-[orientation=vertical]:my-1 data-[orientation=vertical]:h-px data-[orientation=vertical]:w-full
        `,
        props.class,
      )
    "
  />
</template>
