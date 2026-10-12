<script setup lang="ts">
import { EditableInput, type EditableInputProps, injectEditableRootContext } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { editableInput } from ".";

const props = defineProps<EditableInputProps & { class?: HTMLAttributes["class"] }>();

const context = injectEditableRootContext();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});

const length = computed(() =>
  Math.max(1, (context.inputValue.value ?? "").length, (context.placeholder.value?.edit ?? "").length),
);
</script>

<template>
  <!-- size sizes the field where field-sizing is missing; Reka's own width is the 20-character default -->
  <EditableInput v-bind="delegated" data-slot="editable-input" :size="length" :class="cn(editableInput, props.class)" />
</template>
