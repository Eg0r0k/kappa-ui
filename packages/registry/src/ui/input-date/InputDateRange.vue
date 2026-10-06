<script setup lang="ts">
import {
  type DateRange,
  DateRangeFieldInput,
  DateRangeFieldRoot,
  type DateRangeFieldRootProps,
  type DateValue,
  VisuallyHidden,
  useForwardProps,
} from "reka-ui";
import { type HTMLAttributes, computed, shallowRef, useAttrs, watch } from "vue";

import { useFieldControl } from "@/lib/field-context";
import { cn } from "@/lib/utils";
import type { TextControlSize, TextControlVariant } from "@/ui/input";
import { injectInputGroupContext } from "@/ui/input-group";
import { Spinner } from "@/ui/spinner";
import { inputDateGroupedVariants, inputDateSegment, inputDateVariants } from ".";
import { inclusiveMax, inputGranularity, parseDateText, toInputValue, useSegmentedField } from "./date-field";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    DateRangeFieldRootProps & {
      variant?: TextControlVariant;
      size?: TextControlSize;
      loading?: boolean;
      class?: HTMLAttributes["class"];
    }
  >(),
  { variant: "outline", size: "md" },
);
const emits = defineEmits<{
  "update:modelValue": [date: DateRange];
  "update:placeholder": [date: DateValue];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}>();

// Our own copy of the value, so a paste can set it whether or not v-model is bound.
const model = shallowRef<DateRange | null | undefined>(props.modelValue ?? props.defaultValue);
watch(
  () => props.modelValue,
  (value) => {
    model.value = value;
  },
);
const setModel = (value: DateRange) => {
  model.value = value;
  emits("update:modelValue", value);
};

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
    defaultValue: ________,
    modelValue: _________,
    name: __________,
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
    ? inputDateGroupedVariants({ size: size.value })
    : inputDateVariants({ variant: variant.value, size: size.value }),
);

const rootAttrs = computed(() => {
  const { "aria-invalid": _, ...rest } = attrs;
  return rest;
});

const listeners = useSegmentedField(emits, control.disabled);

const sides = ["start", "end"] as const;
type Side = (typeof sides)[number];

const onPaste = (event: ClipboardEvent) => {
  event.preventDefault();
  if (control.disabled.value || props.readonly) return;
  const root = event.currentTarget as HTMLElement;
  const withTime = root.querySelector("[data-reka-date-field-segment=hour]") !== null;
  const text = event.clipboardData?.getData("text") ?? "";
  const range: DateRange = { start: model.value?.start, end: model.value?.end };
  const base = (side: Side) =>
    range[side] ?? range[side === "start" ? "end" : "start"] ?? props.placeholder ?? props.defaultPlaceholder;

  const [first, second] = text.split("/");
  if (second !== undefined) {
    const start = parseDateText(first!, base("start"), withTime);
    const end = parseDateText(second, base("end"), withTime);
    if (start && end) setModel({ start, end });
    return;
  }
  const target = event.target instanceof Element ? event.target : null;
  const side: Side = target?.closest("[data-reka-date-range-field-segment-type=end]") ? "end" : "start";
  const next = parseDateText(text, base(side), withTime);
  if (next) setModel({ ...range, [side]: next });
};

// One native input per end, so the form gets `name[start]` and `name[end]` as ISO strings and the
// browser checks `required`, `min` and `max` on each.
const nativeInput = (side: Side, parts: { part: string }[]) => {
  const granularity = inputGranularity(parts);
  return {
    id: side === "start" ? control.id.value : undefined,
    type: granularity === "day" ? "date" : "datetime-local",
    step: granularity === "second" ? 1 : undefined,
    name: props.name ? `${props.name}[${side}]` : undefined,
    value: toInputValue(model.value?.[side], granularity),
    min: toInputValue(props.minValue, granularity) || undefined,
    max: toInputValue(inclusiveMax(props.maxValue), granularity) || undefined,
  };
};

const focusFirstSegment = (event: FocusEvent) => {
  (event.target as HTMLElement).parentElement?.querySelector<HTMLElement>("[role=spinbutton]")?.focus();
};

// Reka collects the segments and fixes the hour cycle once, on mount (reka-ui#1127).
const remountKey = computed(() => `${props.granularity}-${props.hourCycle}`);
</script>

<template>
  <DateRangeFieldRoot
    :key="remountKey"
    v-slot="{ segments, isInvalid }"
    v-bind="{ ...rootAttrs, ...forwarded }"
    :model-value="model"
    :data-slot="group ? 'input-group-control' : 'input-date-range'"
    :data-variant="variant"
    :data-size="size"
    :disabled="control.disabled.value"
    :aria-labelledby="control.labelledBy.value"
    :aria-describedby="control.describedBy.value"
    :aria-busy="props.loading || undefined"
    :class="cn(frame, props.class)"
    @update:model-value="setModel"
    @update:placeholder="emits('update:placeholder', $event)"
    @focusin="listeners.onFocusin"
    @focusout="listeners.onFocusout"
    @mousedown="listeners.onMousedown"
    @keydown="listeners.onKeydown"
    @keydown.capture="listeners.onKeydownCapture"
    @paste="onPaste"
  >
    <DateRangeFieldInput
      v-for="(segment, index) in segments.start"
      :key="`start-${segment.part}-${index}`"
      type="start"
      :part="segment.part"
      data-slot="input-date-segment"
      :aria-invalid="isInvalid || control.invalid.value"
      :class="inputDateSegment"
    >
      {{ segment.value }}
    </DateRangeFieldInput>
    <span aria-hidden="true" data-slot="input-date-range-separator" class="px-1 text-muted-foreground">–</span>
    <DateRangeFieldInput
      v-for="(segment, index) in segments.end"
      :key="`end-${segment.part}-${index}`"
      type="end"
      :part="segment.part"
      data-slot="input-date-segment"
      :aria-invalid="isInvalid || control.invalid.value"
      :class="inputDateSegment"
    >
      {{ segment.value }}
    </DateRangeFieldInput>
    <Spinner v-if="props.loading" class="ms-auto text-muted-foreground" />
    <VisuallyHidden
      v-for="side in sides"
      :key="side"
      as="input"
      feature="focusable"
      aria-hidden="true"
      tabindex="-1"
      v-bind="nativeInput(side, segments.start)"
      :required="control.required.value"
      :disabled="control.disabled.value"
      @focus="focusFirstSegment"
    />
  </DateRangeFieldRoot>
</template>
