<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { injectTimelineContext, timelineContentVariants } from ".";

const props = withDefaults(defineProps<PrimitiveProps & { class?: HTMLAttributes["class"] }>(), { as: "div" });
const context = injectTimelineContext();
</script>

<template>
  <Primitive
    :as="props.as"
    :as-child="props.asChild"
    data-slot="timeline-content"
    :data-orientation="context.orientation.value"
    :class="cn(timelineContentVariants({ orientation: context.orientation.value }), props.class)"
  >
    <slot />
  </Primitive>
</template>
