<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import { type ComponentPublicInstance, type HTMLAttributes, computed, onBeforeUnmount, onMounted, ref } from "vue";

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

const element = ref<HTMLElement>();
const setInstance = (instance: ComponentPublicInstance | Element | null) => {
  const node = instance instanceof Element ? instance : instance?.$el;
  element.value = node instanceof HTMLElement ? node : undefined;
};

const entry: TimelineEntry = { element: undefined, value: () => props.value };
const unregister = context.register(entry);

onMounted(() => {
  entry.element = element.value;
  context.resort();
});

onBeforeUnmount(unregister);

const index = computed(() => context.entries.value.indexOf(entry));

const state = computed<TimelineState | undefined>(() => {
  if (context.model.value === undefined) return undefined;
  const active = context.activeIndex.value;
  if (active === index.value) return "active";
  const before = active === -1 || index.value < active;
  if (context.reverse.value) return before ? "inactive" : "completed";
  return before ? "completed" : "inactive";
});
</script>

<template>
  <Primitive
    :ref="setInstance"
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
