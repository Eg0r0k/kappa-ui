<!--
  Adapted from Nuxt UI (https://github.com/nuxt/ui), modified for kappa-ui.
  Copyright (c) 2023 Nuxt. MIT License: https://github.com/nuxt/ui/blob/v4/LICENSE.md
-->
<script setup lang="ts">
import {
  Primitive,
  type PrimitiveProps,
  ProgressIndicator,
  ProgressRoot,
  type ProgressRootEmits,
  type ProgressRootProps,
  useDirection,
  useForwardPropsEmits,
  useId,
} from "reka-ui";
import { type HTMLAttributes, computed, ref } from "vue";

import { cn } from "@/lib/utils";
import {
  type ProgressAnimation,
  type ProgressColor,
  type ProgressOrientation,
  type ProgressSize,
  progressIndicatorVariants,
  progressStatusVariants,
  progressStepVariants,
  progressStepsVariants,
  progressTrackVariants,
  progressVariants,
  provideProgressContext,
} from ".";

interface Props extends Pick<ProgressRootProps, "getValueLabel" | "getValueText" | "modelValue"> {
  as?: PrimitiveProps["as"];
  max?: number | unknown[];
  status?: boolean;
  inverted?: boolean;
  color?: ProgressColor | (string & {});
  size?: ProgressSize;
  orientation?: ProgressOrientation;
  animation?: ProgressAnimation;
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), {
  as: "div",
  modelValue: null,
  max: undefined,
  inverted: false,
  color: "primary",
  size: "md",
  orientation: "horizontal",
  animation: "carousel",
});
const emits = defineEmits<ProgressRootEmits>();
const slots = defineSlots<{
  default?: () => unknown;
  status?: (props: { percent?: number }) => unknown;
  [step: `step-${number}`]: (props: { step: unknown }) => unknown;
}>();

const forwarded = useForwardPropsEmits(
  computed(() => ({
    modelValue: props.modelValue,
    getValueLabel: props.getValueLabel,
    getValueText: props.getValueText,
  })),
  emits,
);
const dir = useDirection();

const isIndeterminate = computed(() => typeof props.modelValue !== "number");
const steps = computed(() => (Array.isArray(props.max) ? props.max : undefined));

const realMax = computed(() => {
  if (isIndeterminate.value || !props.max) return undefined;
  return Array.isArray(props.max) ? props.max.length - 1 : Number(props.max);
});

const percent = computed(() => {
  if (typeof props.modelValue !== "number") return undefined;
  const max = realMax.value ?? 100;
  if (props.modelValue < 0) return 0;
  if (props.modelValue > max) return 100;
  return Math.round((props.modelValue / max) * 100);
});

const indicatorStyle = computed(() => {
  if (percent.value === undefined) return undefined;
  const rest = `${100 - percent.value}%`;
  if (props.orientation === "vertical") return { transform: `translateY(${props.inverted ? "" : "-"}${rest})` };
  const backwards = (dir.value === "rtl") === props.inverted;
  return { transform: `translateX(${backwards ? "-" : ""}${rest})` };
});

const statusStyle = computed(() => ({ "--percent": `${Math.max(percent.value ?? 0, 0)}%` }));

const stepState = (index: number) => {
  if (index !== Number(props.modelValue)) return "other";
  return index === 0 ? "first" : "active";
};

const labelId = useId(undefined, "kappa-progress-label");
const labelled = ref(false);

provideProgressContext({
  labelId,
  labelled,
  percent,
  value: computed(() => props.modelValue),
  max: computed(() => realMax.value ?? 100),
});
</script>

<template>
  <Primitive
    :as="props.as"
    data-slot="progress"
    :data-color="props.color"
    :data-orientation="props.orientation"
    :data-size="props.size"
    :class="cn(progressVariants({ orientation: props.orientation, size: props.size }), props.class)"
  >
    <div v-if="slots.default" data-slot="progress-header" class="flex items-center gap-3">
      <slot />
    </div>

    <div
      v-if="!isIndeterminate && (props.status || slots.status)"
      data-slot="progress-status"
      :class="progressStatusVariants({ orientation: props.orientation, inverted: props.inverted })"
      :style="statusStyle"
    >
      <slot name="status" :percent="percent">{{ percent }}%</slot>
    </div>

    <ProgressRoot
      v-bind="forwarded"
      :max="realMax"
      data-slot="progress-track"
      :aria-labelledby="labelled ? labelId : undefined"
      :class="progressTrackVariants({ orientation: props.orientation })"
      style="transform: translateZ(0)"
    >
      <ProgressIndicator
        data-slot="progress-indicator"
        :class="progressIndicatorVariants({ orientation: props.orientation, animation: props.animation })"
        :style="indicatorStyle"
      />
    </ProgressRoot>

    <div
      v-if="steps"
      data-slot="progress-steps"
      :class="progressStepsVariants({ orientation: props.orientation, inverted: props.inverted })"
    >
      <div
        v-for="(step, index) in steps"
        :key="index"
        data-slot="progress-step"
        :data-state="stepState(index)"
        :class="progressStepVariants({ orientation: props.orientation, inverted: props.inverted })"
      >
        <slot :name="`step-${index}`" :step="step">{{ step }}</slot>
      </div>
    </div>
  </Primitive>
</template>
