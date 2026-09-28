<script setup lang="ts">
import { SliderRange, SliderRoot, type SliderRootProps, SliderThumb, SliderTrack, useForwardProps } from "reka-ui";
import { type HTMLAttributes, computed, ref, useAttrs } from "vue";

import { useFieldControl } from "@/lib/field-context";
import { cn } from "@/lib/utils";
import {
  type SliderVariants,
  sliderHandleVariants,
  sliderRangeVariants,
  sliderThumbVariants,
  sliderTrackVariants,
  sliderVariants,
} from ".";

defineOptions({ inheritAttrs: false });

const props = defineProps<
  Omit<SliderRootProps, "modelValue" | "defaultValue"> & {
    id?: string;
    defaultValue?: number | number[];
    variant?: SliderVariants["variant"];
    size?: SliderVariants["size"];
    touchTarget?: SliderVariants["touchTarget"];
    class?: HTMLAttributes["class"];
  }
>();
const emits = defineEmits<{ valueCommit: [value: number | number[]] }>();

const model = defineModel<number | number[]>();
if (model.value === undefined) model.value = props.defaultValue ?? props.min ?? 0;

const delegated = computed(() => {
  const { class: _, size: __, touchTarget: ___, defaultValue: ____, id: _____, variant: ______, ...rest } = props;
  return rest;
});
const forwarded = useForwardProps(delegated);

const attrs = useAttrs();
const control = useFieldControl(props, attrs);

const values = computed(() => (Array.isArray(model.value) ? model.value : [model.value ?? 0]));
const shape = (next: number[]) => (Array.isArray(model.value) ? next : (next[0] ?? 0));
const onUpdate = (next: number[] | undefined) => {
  if (next) model.value = shape(next);
};

const thumbOwned = ["aria-label", "aria-labelledby", "aria-valuetext", "aria-invalid", "aria-describedby"];
const rootAttrs = computed(() => {
  const rest = Object.fromEntries(Object.entries(attrs).filter(([key]) => !thumbOwned.includes(key)));
  if (values.value.length === 1) return rest;
  return { ...rest, role: "group", "aria-label": attrs["aria-label"], "aria-labelledby": control.labelledBy.value };
});
const thumbAttrs = computed(() => ({
  "aria-invalid": control.invalid.value,
  "aria-describedby": control.describedBy.value,
  ...(values.value.length === 1 && {
    "aria-label": attrs["aria-label"],
    "aria-labelledby": control.labelledBy.value,
    "aria-valuetext": attrs["aria-valuetext"],
  }),
}));

const hovered = ref<number>();
const onPointerEnter = (event: PointerEvent, index: number) => {
  if (event.pointerType === "mouse") hovered.value = index;
};
const onPointerLeave = () => {
  hovered.value = undefined;
};

const onPointerDown = (event: PointerEvent) => {
  const root = event.currentTarget as HTMLElement;
  queueMicrotask(() => {
    const thumb = document.activeElement;
    if (!(thumb instanceof HTMLElement) || !root.contains(thumb) || !thumb.matches(":focus-visible")) return;
    thumb.blur();
    thumb.focus({ focusVisible: false });
  });
};
</script>

<template>
  <SliderRoot
    v-bind="{ ...rootAttrs, ...forwarded }"
    data-slot="slider"
    :data-variant="props.variant ?? 'default'"
    :data-touch-target="props.touchTarget"
    :model-value="values"
    :id="control.id.value"
    :disabled="control.disabled.value"
    :required="control.required.value"
    :class="
      cn(sliderVariants({ variant: props.variant, size: props.size, touchTarget: props.touchTarget }), props.class)
    "
    @pointerdown="onPointerDown"
    @update:model-value="onUpdate"
    @value-commit="emits('valueCommit', shape($event))"
  >
    <SliderTrack data-slot="slider-track" :class="sliderTrackVariants({ variant: props.variant })">
      <SliderRange data-slot="slider-range" :class="sliderRangeVariants({ variant: props.variant })" />
    </SliderTrack>
    <SliderThumb
      v-for="(_, index) in values"
      :key="index"
      v-bind="thumbAttrs"
      data-slot="slider-thumb"
      :data-hovered="hovered === index || undefined"
      :class="sliderThumbVariants({ variant: props.variant, touchTarget: props.touchTarget })"
      @pointerenter="onPointerEnter($event, index)"
      @pointerleave="onPointerLeave"
    >
      <span data-slot="slider-handle" :class="sliderHandleVariants({ variant: props.variant })" />
    </SliderThumb>
  </SliderRoot>
</template>
