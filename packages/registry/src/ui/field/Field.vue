<script setup lang="ts">
import { useId } from "@kappa-ui/core/utils";
import { type HTMLAttributes, ref, toRef } from "vue";

import { provideFieldContext } from "@/lib/field-context";
import { cn } from "@/lib/utils";
import { type FieldVariants, fieldVariants } from ".";

const props = defineProps<{
  id?: string;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  orientation?: FieldVariants["orientation"];
  class?: HTMLAttributes["class"];
}>();

const id = useId(props.id, "field");

provideFieldContext({
  id,
  labelId: `${id}-label`,
  descriptionId: `${id}-description`,
  errorId: `${id}-error`,
  invalid: toRef(() => props.invalid),
  disabled: toRef(() => props.disabled),
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
