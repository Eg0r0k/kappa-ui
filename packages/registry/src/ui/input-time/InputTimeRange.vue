<script setup lang="ts">
import {
  TimeRangeFieldInput,
  TimeRangeFieldRoot,
  type TimeRangeFieldRootEmits,
  type TimeRangeFieldRootProps,
  type TimeValue,
  VisuallyHidden,
  useForwardProps,
} from "reka-ui";
import { type HTMLAttributes, computed, shallowRef, useAttrs } from "vue";

import { useFieldControl } from "@/lib/field-context";
import { cn } from "@/lib/utils";
import type { TextControlSize, TextControlVariant } from "@/ui/input";
import { injectInputGroupContext } from "@/ui/input-group";
import { Spinner } from "@/ui/spinner";
import { inputTimeGroupedVariants, inputTimeSegment, inputTimeVariants } from ".";
import { useSegmentedField } from "./time-field";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    TimeRangeFieldRootProps & {
      variant?: TextControlVariant;
      size?: TextControlSize;
      loading?: boolean;
      class?: HTMLAttributes["class"];
    }
  >(),
  { variant: "outline", size: "md" },
);
const emits = defineEmits<TimeRangeFieldRootEmits & { focus: [event: FocusEvent]; blur: [event: FocusEvent] }>();

const attrs = useAttrs();
const control = useFieldControl(props, attrs);

// name, id and required stay off Reka's root: its hidden input submits "undefined - undefined" and
// never fails `required`. The two hidden inputs below take them instead.
const delegated = computed(() => {
  const {
    class: _,
    variant: __,
    size: ___,
    loading: ____,
    id: _____,
    disabled: ______,
    required: _______,
    name: ________,
    defaultValue: _________,
    ...rest
  } = props;
  return rest;
});
const forwarded = useForwardProps(delegated);

const group = injectInputGroupContext(null);
const variant = computed(() => group?.variant.value ?? props.variant);
const size = computed(() => group?.size.value ?? props.size);
const frame = computed(() =>
  group
    ? inputTimeGroupedVariants({ size: size.value })
    : inputTimeVariants({ variant: variant.value, size: size.value }),
);

const rootAttrs = computed(() => {
  const { "aria-invalid": _, ...rest } = attrs;
  return rest;
});

const sides = ["start", "end"] as const;
const focusFirstSegment = (event: FocusEvent) => {
  (event.target as HTMLElement).parentElement?.querySelector<HTMLElement>("[role=spinbutton]")?.focus();
};
const native = (value: TimeValue | undefined) => value?.toString() ?? "";

const listeners = useSegmentedField(emits, control.disabled);

// Reka collects the segments and fixes the hour cycle once, on mount (reka-ui#1127).
const remountKey = computed(() => `${props.granularity}-${props.hourCycle}`);
// The last value, so a remount without v-model keeps what was typed.
const latest = shallowRef(props.defaultValue);
const onUpdate = (value: TimeRangeFieldRootEmits["update:modelValue"][0]) => {
  latest.value = value;
  emits("update:modelValue", value);
};
</script>

<template>
  <TimeRangeFieldRoot
    :key="remountKey"
    v-slot="{ modelValue, segments, isInvalid }"
    v-bind="{ ...rootAttrs, ...forwarded }"
    :data-slot="group ? 'input-group-control' : 'input-time-range'"
    :data-variant="variant"
    :data-size="size"
    :disabled="control.disabled.value"
    :aria-labelledby="control.labelledBy.value"
    :aria-describedby="control.describedBy.value"
    :aria-busy="props.loading || undefined"
    :class="cn(frame, props.class)"
    :default-value="latest"
    @update:model-value="onUpdate"
    @update:placeholder="emits('update:placeholder', $event)"
    @focusin="listeners.onFocusin"
    @focusout="listeners.onFocusout"
    @mousedown="listeners.onMousedown"
    @keydown="listeners.onKeydown"
  >
    <TimeRangeFieldInput
      v-for="(segment, index) in segments.start"
      :key="`start-${segment.part}-${index}`"
      type="start"
      :part="segment.part"
      data-slot="input-time-segment"
      :aria-invalid="isInvalid || control.invalid.value"
      :class="inputTimeSegment"
    >
      {{ segment.value }}
    </TimeRangeFieldInput>
    <span aria-hidden="true" data-slot="input-time-range-separator" class="px-1 text-muted-foreground">–</span>
    <TimeRangeFieldInput
      v-for="(segment, index) in segments.end"
      :key="`end-${segment.part}-${index}`"
      type="end"
      :part="segment.part"
      data-slot="input-time-segment"
      :aria-invalid="isInvalid || control.invalid.value"
      :class="inputTimeSegment"
    >
      {{ segment.value }}
    </TimeRangeFieldInput>
    <Spinner v-if="props.loading" class="ms-auto text-muted-foreground" />
    <VisuallyHidden
      v-for="side in sides"
      :key="side"
      as="input"
      feature="focusable"
      aria-hidden="true"
      tabindex="-1"
      :id="side === 'start' ? control.id.value : undefined"
      :name="props.name ? `${props.name}[${side}]` : undefined"
      :value="native(modelValue?.[side])"
      :required="control.required.value"
      :disabled="control.disabled.value"
      @focus="focusFirstSegment"
    />
  </TimeRangeFieldRoot>
</template>
