<script setup lang="ts">
import { Primitive, type PrimitiveProps, useForwardExpose } from "reka-ui";
import { type HTMLAttributes, computed, onBeforeUnmount, onMounted } from "vue";

import { cn } from "@/lib/utils";
import {
  type TimelineEntry,
  type TimelineState,
  type TimelineValue,
  injectTimelineContext,
  timelineItemVariants,
} from ".";

const props = withDefaults(defineProps<PrimitiveProps & { value?: TimelineValue; class?: HTMLAttributes["class"] }>(), {
  as: "li",
  value: undefined,
});
const context = injectTimelineContext();

const { forwardRef, currentElement } = useForwardExpose();

const entry: TimelineEntry = { element: undefined, value: () => props.value };
const unregister = context.register(entry);

onMounted(() => {
  entry.element = currentElement.value;
  context.resort();
});

onBeforeUnmount(unregister);

const index = computed(() => context.entries.value.indexOf(entry));

const state = computed<TimelineState | undefined>(() => {
  if (context.model.value === undefined || context.model.value === null) return undefined;
  const active = context.activeIndex.value;
  if (active === index.value) return "active";
  const before = active === -1 || index.value < active;
  if (context.reverse.value) return before ? "inactive" : "completed";
  return before ? "completed" : "inactive";
});
</script>

<template>
  <Primitive
    :ref="forwardRef"
    :as="props.as"
    :as-child="props.asChild"
    data-slot="timeline-item"
    :data-state="state"
    :data-orientation="context.orientation.value"
    :aria-current="state === 'active' ? 'step' : undefined"
    :class="cn(timelineItemVariants({ orientation: context.orientation.value }), props.class)"
  >
    <slot :state="state" />
  </Primitive>
</template>
