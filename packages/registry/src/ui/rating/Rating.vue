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
import { RatingRoot, type RatingRootProps, useDirection } from "reka-ui";
import { type HTMLAttributes, computed, ref, toRef, useAttrs, useTemplateRef } from "vue";

import { useFieldControl } from "@/lib/field-context";
import { cn } from "@/lib/utils";

import {
  type RatingColor,
  type RatingLabels,
  type RatingSize,
  type RatingTouchTarget,
  defaultRatingLabels,
  provideRatingContext,
  ratingVariants,
} from ".";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    Omit<RatingRootProps, "modelValue" | "as" | "asChild" | "loop"> & {
      id?: string;
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
defineSlots<{ default?: (props: { items: number[] }) => unknown }>();

const model = defineModel<number>();
const display = computed(() => model.value ?? props.defaultValue);

const attrs = useAttrs();
const control = useFieldControl(props, attrs);
const items = computed(() => Array.from({ length: props.length }, (_, index) => index + 1));
const dir = useDirection(toRef(() => props.dir));

provideRatingContext({
  length: computed(() => props.length),
  disabled: computed(() => Boolean(control.disabled.value)),
  labels: computed(() => ({ ...defaultRatingLabels, ...props.labels })),
});

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
</script>

<template>
  <RatingRoot
    v-bind="attrs"
    :id="control.id.value"
    data-slot="rating"
    :data-size="props.size"
    :data-color="props.color"
    :data-orientation="props.orientation"
    :data-touch-target="props.touchTarget"
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
    :class="
      cn(
        ratingVariants({ size: props.size, orientation: props.orientation, touchTarget: props.touchTarget }),
        props.class,
      )
    "
    @pointerover.capture="onPointer"
    @pointerdown.capture="onPointer"
    @mouseenter.capture="onMouseEnter"
    @update:model-value="model = $event"
  >
    <RatingHover @hover="emits('hover', $event)" />
    <slot :items="items" />
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
