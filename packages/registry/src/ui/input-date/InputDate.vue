<script setup lang="ts">
import { DateFieldInput, DateFieldRoot, type DateFieldRootProps, type DateValue, useForwardProps } from "reka-ui";
import { type HTMLAttributes, computed, shallowRef, useAttrs, watch } from "vue";

import { useFieldControl } from "@/lib/field-context";
import { cn } from "@/lib/utils";
import type { TextControlSize, TextControlVariant } from "@/ui/input";
import { injectInputGroupContext } from "@/ui/input-group";
import { Spinner } from "@/ui/spinner";
import { inputDateGroupedVariants, inputDateSegment, inputDateVariants } from ".";
import { parseDateText, useSegmentedField } from "./date-field";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    DateFieldRootProps & {
      variant?: TextControlVariant;
      size?: TextControlSize;
      loading?: boolean;
      class?: HTMLAttributes["class"];
    }
  >(),
  { variant: "outline", size: "md" },
);
const emits = defineEmits<{
  "update:modelValue": [date: DateValue | undefined];
  "update:placeholder": [date: DateValue];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}>();

// Our own copy of the value, so a paste can set it whether or not v-model is bound.
const model = shallowRef<DateValue | null | undefined>(props.modelValue ?? props.defaultValue);
watch(
  () => props.modelValue,
  (value) => {
    model.value = value;
  },
);
const setModel = (value: DateValue | undefined) => {
  model.value = value;
  emits("update:modelValue", value);
};

const attrs = useAttrs();
const control = useFieldControl(props, attrs);

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

const onPaste = (event: ClipboardEvent) => {
  event.preventDefault();
  if (control.disabled.value || props.readonly) return;
  const root = event.currentTarget as HTMLElement;
  const base = model.value ?? props.placeholder ?? props.defaultPlaceholder;
  const withTime = root.querySelector("[data-reka-date-field-segment=hour]") !== null;
  const next = parseDateText(event.clipboardData?.getData("text") ?? "", base, withTime);
  if (next) setModel(next);
};

// Reka collects the segments and fixes the hour cycle once, on mount (reka-ui#1127).
const remountKey = computed(() => `${props.granularity}-${props.hourCycle}`);
</script>

<template>
  <DateFieldRoot
    :key="remountKey"
    v-slot="{ segments, isInvalid }"
    v-bind="{ ...rootAttrs, ...forwarded }"
    :model-value="model"
    :data-slot="group ? 'input-group-control' : 'input-date'"
    :data-variant="variant"
    :data-size="size"
    :id="control.id.value"
    :disabled="control.disabled.value"
    :required="control.required.value"
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
    <DateFieldInput
      v-for="(segment, index) in segments"
      :key="`${segment.part}-${index}`"
      :part="segment.part"
      data-slot="input-date-segment"
      :aria-invalid="isInvalid || control.invalid.value"
      :class="inputDateSegment"
    >
      {{ segment.value }}
    </DateFieldInput>
    <Spinner v-if="props.loading" class="ms-auto text-muted-foreground" />
  </DateFieldRoot>
</template>
