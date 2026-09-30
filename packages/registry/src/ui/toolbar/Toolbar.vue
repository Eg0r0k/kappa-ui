<script setup lang="ts">
import { ToolbarRoot, type ToolbarRootProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { type ToolbarVariants, toolbarVariants } from ".";

const props = withDefaults(
  defineProps<
    ToolbarRootProps & {
      variant?: NonNullable<ToolbarVariants["variant"]>;
      class?: HTMLAttributes["class"];
    }
  >(),
  { orientation: "horizontal", loop: true, variant: "outline" },
);

const delegated = computed(() => {
  const { class: _, variant: __, ...rest } = props;
  return rest;
});
</script>

<template>
  <ToolbarRoot
    v-bind="delegated"
    data-slot="toolbar"
    :data-variant="props.variant"
    :class="cn(toolbarVariants({ variant: props.variant }), props.class)"
  >
    <slot />
  </ToolbarRoot>
</template>
