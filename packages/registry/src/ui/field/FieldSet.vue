<script setup lang="ts">
import { useId } from "reka-ui";
import { type HTMLAttributes, computed, ref, toRef } from "vue";

import { injectFieldContext, provideFieldContext } from "@/lib/field-context";
import { cn } from "@/lib/utils";

const props = defineProps<{
  id?: string;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  class?: HTMLAttributes["class"];
}>();

const id = useId(props.id, "fieldset");
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
  <fieldset
    data-slot="field-set"
    :disabled="props.disabled"
    :data-invalid="props.invalid || undefined"
    :data-disabled="props.disabled || undefined"
    :class="cn('group/fieldset flex min-w-0 flex-col gap-4', props.class)"
  >
    <slot />
  </fieldset>
</template>
