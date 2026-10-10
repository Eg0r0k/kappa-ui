<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { type TimelineColor, timelineIndicator } from ".";

const props = withDefaults(
  defineProps<PrimitiveProps & { color?: TimelineColor | (string & {}); class?: HTMLAttributes["class"] }>(),
  { as: "div" },
);
</script>

<template>
  <Primitive
    :as="props.as"
    :as-child="props.asChild"
    data-slot="timeline-indicator"
    :data-color="props.color"
    :class="cn(timelineIndicator, props.class)"
  >
    <slot />
  </Primitive>
</template>
