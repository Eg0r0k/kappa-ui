<script setup lang="ts">
import { Separator, type SeparatorProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { injectTimelineContext, timelineSeparatorVariants } from ".";

const props = defineProps<SeparatorProps & { class?: HTMLAttributes["class"] }>();
const context = injectTimelineContext();

const delegated = computed(() => {
  const { class: _, orientation: __, decorative: ___, ...rest } = props;
  return rest;
});
</script>

<template>
  <Separator
    v-bind="delegated"
    decorative
    :orientation="context.orientation.value"
    data-slot="timeline-separator"
    :class="cn(timelineSeparatorVariants({ orientation: context.orientation.value }), props.class)"
  />
</template>
