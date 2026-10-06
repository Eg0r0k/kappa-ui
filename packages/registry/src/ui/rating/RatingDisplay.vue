<script setup lang="ts">
import { useDirection, useId } from "reka-ui";
import { type HTMLAttributes, computed, toRef, useAttrs } from "vue";

import { useFieldControl } from "@/lib/field-context";
import { cn } from "@/lib/utils";

import {
  type RatingColor,
  type RatingLabels,
  type RatingSize,
  defaultRatingLabels,
  provideRatingDisplayContext,
  ratingVariants,
} from ".";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The value to show, exact fractions included. */
    value?: number;
    length?: number;
    orientation?: "horizontal" | "vertical";
    dir?: "ltr" | "rtl";
    size?: RatingSize;
    color?: RatingColor | (string & {});
    labels?: Partial<RatingLabels>;
    id?: string;
    name?: string;
    disabled?: boolean;
    class?: HTMLAttributes["class"];
  }>(),
  { value: 0, length: 5, orientation: "horizontal", size: "md", color: "primary" },
);
defineSlots<{ default?: (props: { items: number[] }) => unknown }>();

const attrs = useAttrs();
const control = useFieldControl(props, attrs);
const items = computed(() => Array.from({ length: props.length }, (_, index) => index + 1));
const dir = useDirection(toRef(() => props.dir));

// One picture, named "Rated 4.3 out of 5", after the field's label when there is one.
const selfId = useId(undefined, "rating-display");
const rootId = computed(() => control.id.value ?? selfId);
const label = computed(() => {
  const value = { ...defaultRatingLabels, ...props.labels }.readonly(props.value, props.length);
  return attrs["aria-label"] ? `${attrs["aria-label"]}, ${value}` : value;
});

provideRatingDisplayContext({
  fill: (item) => `${+(Math.min(1, Math.max(0, props.value - (item - 1))) * 100).toFixed(2)}%`,
});
</script>

<template>
  <div
    v-bind="attrs"
    :id="rootId"
    data-slot="rating-display"
    :data-size="props.size"
    :data-color="props.color"
    :data-orientation="props.orientation"
    :data-disabled="control.disabled.value ? '' : undefined"
    role="img"
    :dir="dir"
    :aria-label="label"
    :aria-labelledby="control.labelledBy.value && `${control.labelledBy.value} ${rootId}`"
    :aria-describedby="control.describedBy.value"
    :class="cn(ratingVariants({ size: props.size, orientation: props.orientation }), props.class)"
  >
    <slot :items="items" />
    <input
      v-if="props.name"
      type="hidden"
      :name="props.name"
      :value="props.value ? String(props.value) : ''"
      :disabled="control.disabled.value"
    />
  </div>
</template>
