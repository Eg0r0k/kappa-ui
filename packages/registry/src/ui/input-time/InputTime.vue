<script setup lang="ts">
import {
  TimeFieldInput,
  TimeFieldRoot,
  type TimeFieldRootEmits,
  type TimeFieldRootProps,
  useForwardPropsEmits,
} from "reka-ui";
import { type HTMLAttributes, computed, useAttrs } from "vue";

import { useFieldControl } from "@/lib/field-context";
import { cn } from "@/lib/utils";
import type { TextControlSize, TextControlVariant } from "@/ui/input";
import { injectInputGroupContext } from "@/ui/input-group";
import { Spinner } from "@/ui/spinner";
import { inputTimeGroupedVariants, inputTimeSegment, inputTimeVariants } from ".";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    TimeFieldRootProps & {
      variant?: TextControlVariant;
      size?: TextControlSize;
      loading?: boolean;
      class?: HTMLAttributes["class"];
    }
  >(),
  { variant: "outline", size: "md" },
);
const emits = defineEmits<TimeFieldRootEmits>();

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
</script>

<template>
  <TimeFieldRoot
    v-slot="{ segments, isInvalid }"
    v-bind="{ ...rootAttrs, ...forwarded }"
    :data-slot="group ? 'input-group-control' : 'input-time'"
    :data-variant="variant"
    :data-size="size"
    :id="control.id.value"
    :disabled="control.disabled.value"
    :required="control.required.value"
    :aria-labelledby="control.labelledBy.value"
    :aria-describedby="control.describedBy.value"
    :aria-busy="props.loading || undefined"
    :class="cn(frame, props.class)"
  >
    <TimeFieldInput
      v-for="(segment, index) in segments"
      :key="`${segment.part}-${index}`"
      :part="segment.part"
      data-slot="input-time-segment"
      :aria-invalid="isInvalid || control.invalid.value"
      :class="inputTimeSegment"
    >
      {{ segment.value }}
    </TimeFieldInput>
    <Spinner v-if="props.loading" class="ms-auto text-muted-foreground" />
  </TimeFieldRoot>
</template>
