<script setup lang="ts">
import {
  TimeRangeFieldInput,
  TimeRangeFieldRoot,
  type TimeRangeFieldRootEmits,
  type TimeRangeFieldRootProps,
  useForwardPropsEmits,
} from "reka-ui";
import { type HTMLAttributes, computed, useAttrs } from "vue";

import { useFieldControl } from "@/lib/field-context";
import { cn } from "@/lib/utils";
import type { TextControlSize, TextControlVariant } from "@/ui/input";
import { Spinner } from "@/ui/spinner";
import { inputTimeSegment, inputTimeVariants } from ".";

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
const emits = defineEmits<TimeRangeFieldRootEmits>();

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
    ...rest
  } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);

const rootAttrs = computed(() => {
  const { "aria-invalid": _, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <TimeRangeFieldRoot
    v-slot="{ segments, isInvalid }"
    v-bind="{ ...rootAttrs, ...forwarded }"
    data-slot="input-time-range"
    :data-variant="props.variant"
    :data-size="props.size"
    :id="control.id.value"
    :disabled="control.disabled.value"
    :required="control.required.value"
    :aria-labelledby="control.labelledBy.value"
    :aria-describedby="control.describedBy.value"
    :aria-busy="props.loading || undefined"
    :class="cn(inputTimeVariants({ variant: props.variant, size: props.size }), props.class)"
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
  </TimeRangeFieldRoot>
</template>
