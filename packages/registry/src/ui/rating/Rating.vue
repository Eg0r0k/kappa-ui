<!--
  Adapted from Nuxt UI (https://github.com/nuxt/ui), modified for kappa-ui.
  Copyright (c) 2023 Nuxt. MIT License: https://github.com/nuxt/ui/blob/v4/LICENSE.md
-->
<script lang="ts">
import { injectRatingRootContext } from "reka-ui";
import { defineComponent, watch } from "vue";

// Reads Reka's hovered value from inside RatingRoot, where its context lives.
const RatingHover = defineComponent({
  emits: { hover: (value: number) => typeof value === "number" },
  setup(_, { emit }) {
    const context = injectRatingRootContext();
    watch(context.hoveredRating, (value) => emit("hover", value));
    return () => null;
  },
});
</script>

<script setup lang="ts">
import { Star } from "@lucide/vue";
import { RatingItem, RatingItemIndicator, RatingRoot, type RatingRootProps, useDirection, useId } from "reka-ui";
import { type HTMLAttributes, computed, ref, toRef, useAttrs, useTemplateRef } from "vue";

import { useFieldControl } from "@/lib/field-context";
import { cn } from "@/lib/utils";
import {
  type RatingColor,
  type RatingLabels,
  type RatingSize,
  type RatingTouchTarget,
  defaultRatingLabels,
  ratingClipClass,
  ratingEmptyIconClass,
  ratingIconClass,
  ratingIndicatorClass,
  ratingIndicatorIconClass,
  ratingItemVariants,
  ratingVariants,
} from ".";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    Omit<RatingRootProps, "modelValue" | "as" | "asChild" | "loop"> & {
      id?: string;
      /** Shows the value as one picture, with exact fractions, and takes no input. */
      readonly?: boolean;
      size?: RatingSize;
      color?: RatingColor | (string & {});
      touchTarget?: RatingTouchTarget;
      labels?: Partial<RatingLabels>;
      class?: HTMLAttributes["class"];
    }
  >(),
  { length: 5, step: 1, orientation: "horizontal", size: "md", color: "primary", touchTarget: "none" },
);
const emits = defineEmits<{ hover: [value: number] }>();
defineSlots<{
  icon?: (props: { item: number; filled: boolean }) => unknown;
  "empty-icon"?: (props: { item: number }) => unknown;
}>();

const model = defineModel<number>();
const display = computed(() => model.value ?? props.defaultValue);

const attrs = useAttrs();
const control = useFieldControl(props, attrs);
const labels = computed(() => ({ ...defaultRatingLabels, ...props.labels }));
const items = computed(() => Array.from({ length: props.length }, (_, index) => index + 1));
const dir = useDirection(toRef(() => props.dir));

const rootClass = computed(() =>
  cn(ratingVariants({ size: props.size, orientation: props.orientation, touchTarget: props.touchTarget }), props.class),
);
const look = computed(() => ({
  "data-slot": "rating",
  "data-size": props.size,
  "data-color": props.color,
  "data-orientation": props.orientation,
  "data-touch-target": props.touchTarget,
}));

// Readonly: one picture, named "Rated 4.3 out of 5", after the field's label when there is one.
const selfId = useId(undefined, "rating");
const readonlyId = computed(() => control.id.value ?? selfId);
const readonlyLabel = computed(() => {
  const value = labels.value.readonly(display.value ?? 0, props.length);
  return attrs["aria-label"] ? `${attrs["aria-label"]}, ${value}` : value;
});
const fill = (item: number) => `${+(Math.min(1, Math.max(0, (display.value ?? 0) - (item - 1))) * 100).toFixed(2)}%`;

// Reka is always controlled, so the stars show the model even when a parent turns an update down.
const rekaValue = computed(() => display.value ?? 0);

// The form input is ours, not Reka's, whose input would submit "0" for nothing picked and pass native `required`.
// An empty value fails it instead. Like Reka's, it sits in the radiogroup, never inside a radio, and tells the form
// when its value changes.
const formValue = computed(() => (display.value ? String(display.value) : ""));
const input = useTemplateRef<HTMLInputElement>("input");
watch(
  formValue,
  () => {
    input.value?.dispatchEvent(new Event("input", { bubbles: true }));
    input.value?.dispatchEvent(new Event("change", { bubbles: true }));
  },
  { flush: "post" },
);

// Reka previews on mouseenter, which a tap also fires. Keep the preview to a mouse or a pen.
const pointerType = ref<string>();
const onPointer = (event: PointerEvent) => {
  pointerType.value = event.pointerType;
};
const onMouseEnter = (event: MouseEvent) => {
  if (pointerType.value === "touch") event.stopPropagation();
};

const hovered = ref<number>();
const onItemEnter = (event: PointerEvent, item: number) => {
  if (event.pointerType === "mouse") hovered.value = item;
};
const onItemLeave = () => {
  hovered.value = undefined;
};
</script>

<template>
  <div
    v-if="props.readonly"
    v-bind="{ ...attrs, ...look }"
    data-readonly=""
    role="img"
    :id="readonlyId"
    :dir="dir"
    :data-disabled="control.disabled.value ? '' : undefined"
    :aria-label="readonlyLabel"
    :aria-labelledby="control.labelledBy.value && `${control.labelledBy.value} ${readonlyId}`"
    :aria-describedby="control.describedBy.value"
    :class="rootClass"
  >
    <span v-for="item in items" :key="item" data-slot="rating-item" :class="ratingItemVariants({ interactive: false })">
      <span data-slot="rating-empty-icon" aria-hidden="true" :class="ratingEmptyIconClass">
        <slot name="empty-icon" :item="item">
          <slot name="icon" :item="item" :filled="false"><Star /></slot>
        </slot>
      </span>
      <span :class="ratingClipClass" :style="{ width: fill(item) }">
        <span data-slot="rating-icon" aria-hidden="true" :class="ratingIconClass">
          <slot name="icon" :item="item" :filled="true"><Star /></slot>
        </span>
      </span>
    </span>
    <input v-if="props.name" type="hidden" :name="props.name" :value="formValue" :disabled="control.disabled.value" />
  </div>
  <RatingRoot
    v-else
    v-bind="{ ...attrs, ...look }"
    :id="control.id.value"
    :model-value="rekaValue"
    :length="props.length"
    :step="props.step"
    :clearable="props.clearable"
    :hoverable="props.hoverable"
    :orientation="props.orientation"
    :dir="dir"
    :disabled="control.disabled.value"
    :required="control.required.value"
    :aria-invalid="control.invalid.value"
    :aria-describedby="control.describedBy.value"
    :aria-labelledby="control.labelledBy.value"
    :class="rootClass"
    @pointerover.capture="onPointer"
    @pointerdown.capture="onPointer"
    @mouseenter.capture="onMouseEnter"
    @update:model-value="model = $event"
  >
    <RatingHover @hover="emits('hover', $event)" />
    <RatingItem
      v-for="item in items"
      v-slot="{ steps }"
      :key="item"
      :item="item"
      as="span"
      data-slot="rating-item"
      :data-hovered="hovered === item || undefined"
      :data-disabled="control.disabled.value ? '' : undefined"
      :class="ratingItemVariants({ interactive: true })"
      @pointerenter="onItemEnter($event, item)"
      @pointerleave="onItemLeave"
    >
      <span data-slot="rating-empty-icon" aria-hidden="true" :class="ratingEmptyIconClass">
        <slot name="empty-icon" :item="item">
          <slot name="icon" :item="item" :filled="false"><Star /></slot>
        </slot>
      </span>
      <RatingItemIndicator
        v-for="step in steps"
        :key="step"
        :step="step"
        data-slot="rating-indicator"
        :aria-label="labels.item(step, props.length)"
        :class="ratingIndicatorClass"
      >
        <span :class="cn(ratingClipClass, 'end-0')">
          <span data-slot="rating-icon" aria-hidden="true" :class="cn(ratingIconClass, ratingIndicatorIconClass)">
            <slot name="icon" :item="item" :filled="true"><Star /></slot>
          </span>
        </span>
      </RatingItemIndicator>
    </RatingItem>
    <input
      v-if="props.name"
      ref="input"
      aria-hidden="true"
      tabindex="-1"
      class="sr-only"
      :name="props.name"
      :value="formValue"
      :required="control.required.value"
      :disabled="control.disabled.value"
    />
  </RatingRoot>
</template>
