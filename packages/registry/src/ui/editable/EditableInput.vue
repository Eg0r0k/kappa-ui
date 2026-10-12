<script setup lang="ts">
import { EditableInput, type EditableInputProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { editableInput } from ".";

const props = defineProps<EditableInputProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <EditableInput v-bind="delegated" data-slot="editable-input" :class="cn(editableInput, props.class)" />
</template>
