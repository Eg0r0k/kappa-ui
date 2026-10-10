<script setup lang="ts">
import { useMutationObserver, useVModel } from "@vueuse/core";
import { Primitive, type PrimitiveProps } from "reka-ui";
import { type ComponentPublicInstance, type HTMLAttributes, computed, ref, shallowRef } from "vue";

import { cn } from "@/lib/utils";
import {
  type TimelineColor,
  type TimelineEntry,
  type TimelineOrientation,
  type TimelineValue,
  type TimelineVariants,
  provideTimelineContext,
  timelineVariants,
} from ".";

const props = withDefaults(
  defineProps<
    PrimitiveProps & {
      modelValue?: TimelineValue;
      defaultValue?: TimelineValue;
      reverse?: boolean;
      orientation?: TimelineOrientation;
      size?: NonNullable<TimelineVariants["size"]>;
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

const root = ref<HTMLElement>();
const setInstance = (instance: ComponentPublicInstance | Element | null) => {
  const node = instance instanceof Element ? instance : instance?.$el;
  root.value = node instanceof HTMLElement ? node : undefined;
};

const entries = shallowRef<TimelineEntry[]>([]);

const ordered = (list: TimelineEntry[]) =>
  [...list].sort((a, b) => (a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));

const register = (entry: TimelineEntry) => {
  entries.value = ordered([...entries.value, entry]);
  return () => {
    entries.value = entries.value.filter((item) => item !== entry);
  };
};

useMutationObserver(root, () => (entries.value = ordered(entries.value)), { childList: true });

const activeIndex = computed(() => {
  const value = model.value;
  if (value === undefined) return -1;
  return entries.value.findIndex((entry, index) => (entry.value() ?? index) === value);
});

provideTimelineContext({
  orientation: computed(() => props.orientation),
  reverse: computed(() => props.reverse),
  entries,
  activeIndex,
  register,
});
</script>

<template>
  <Primitive
    :ref="setInstance"
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
