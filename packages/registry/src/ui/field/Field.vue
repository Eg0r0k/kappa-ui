<script setup lang="ts">
import { useId } from "reka-ui";
import { type HTMLAttributes, computed, ref, toRef } from "vue";

import { injectFieldContext, provideFieldContext } from "@/lib/field-context";
import { cn } from "@/lib/utils";
import { type FieldVariants, fieldVariants } from ".";

const props = defineProps<{
  controlId?: string;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  orientation?: FieldVariants["orientation"];
  class?: HTMLAttributes["class"];
}>();

const id = useId(props.controlId, "field");
const parent = injectFieldContext(null);

provideFieldContext({
  id,
  labelId: `${id}-label`,
  descriptionId: `${id}-description`,
  errorId: `${id}-error`,
  invalid: toRef(() => props.invalid),
  disabled: computed(() => Boolean(props.disabled || parent?.disabled.value)),
  required: toRef(() => props.required),
  hasLabel: ref(false),
  hasDescription: ref(false),
  hasError: ref(false),
});
</script>

<template>
  <div
    data-slot="field"
    :data-orientation="props.orientation ?? 'vertical'"
    :data-invalid="props.invalid || undefined"
    :data-disabled="props.disabled || undefined"
    :class="cn(fieldVariants({ orientation: props.orientation }), props.class)"
  >
    <slot />
  </div>
</template>
