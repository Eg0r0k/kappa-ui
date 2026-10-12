<script setup lang="ts">
import { useMutationObserver, useVModel } from "@vueuse/core";
import { Primitive, type PrimitiveProps, useForwardExpose } from "reka-ui";
import { type HTMLAttributes, computed, shallowRef } from "vue";

import { cn } from "@/lib/utils";
import {
  type TimelineColor,
  type TimelineEntry,
  type TimelineOrientation,
  type TimelineSize,
  type TimelineValue,
  provideTimelineContext,
  timelineVariants,
} from ".";

const props = withDefaults(
  defineProps<
    PrimitiveProps & {
      modelValue?: TimelineValue | null;
      defaultValue?: TimelineValue | null;
      reverse?: boolean;
      orientation?: TimelineOrientation;
      size?: TimelineSize;
      /** The tone of the reached indicators and lines. */
      color?: TimelineColor | (string & {});
      class?: HTMLAttributes["class"];
    }
  >(),
  {
    as: "ol",
    modelValue: undefined,
    defaultValue: undefined,
    reverse: false,
    orientation: "vertical",
    size: "md",
    color: "primary",
  },
);
const emits = defineEmits<{ "update:modelValue": [value: TimelineValue] }>();

const model = useVModel(props, "modelValue", emits, {
  defaultValue: props.defaultValue,
  passive: (props.modelValue === undefined) as false,
});

const { forwardRef, currentElement } = useForwardExpose();

const entries = shallowRef<TimelineEntry[]>([]);

const ordered = (list: TimelineEntry[]) =>
  [...list].sort((a, b) => {
    if (!a.element || !b.element) return 0;
    return a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  });

const resort = () => (entries.value = ordered(entries.value));

const register = (entry: TimelineEntry) => {
  entries.value = [...entries.value, entry];
  return () => {
    entries.value = entries.value.filter((item) => item !== entry);
  };
};

useMutationObserver(currentElement, resort, { childList: true });

const activeIndex = computed(() => {
  const value = model.value;
  if (value === undefined || value === null) return -1;
  return entries.value.findIndex((entry, index) => (entry.value() ?? index) === value);
});

provideTimelineContext({
  orientation: computed(() => props.orientation),
  reverse: computed(() => props.reverse),
  model,
  entries,
  activeIndex,
  register,
  resort,
});
</script>

<template>
  <Primitive
    :ref="forwardRef"
    :as="props.as"
    :as-child="props.asChild"
    data-slot="timeline"
    :data-orientation="props.orientation"
    :data-reverse="props.reverse || undefined"
    :data-color="props.color"
    :data-size="props.size"
    :class="cn(timelineVariants({ size: props.size }), props.class)"
  >
    <slot />
  </Primitive>
</template>
