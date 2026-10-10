<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import {
  type ComponentPublicInstance,
  type HTMLAttributes,
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
} from "vue";

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

const registered = shallowRef<TimelineEntry>();
let unregister: (() => void) | undefined;

onMounted(() => {
  const node = element.value;
  if (!node) return;
  const entry = { element: node, value: () => props.value };
  registered.value = entry;
  unregister = context.register(entry);
});

onBeforeUnmount(() => unregister?.());

const index = computed(() => (registered.value ? context.entries.value.indexOf(registered.value) : -1));

const state = computed<TimelineState | undefined>(() => {
  const active = context.activeIndex.value;
  if (active === -1 || index.value === -1) return undefined;
  if (index.value === active) return "active";
  const reached = context.reverse.value ? index.value > active : index.value < active;
  return reached ? "completed" : "inactive";
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
