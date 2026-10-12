<script setup lang="ts">
import { EditablePreview, type EditablePreviewProps, injectEditableRootContext } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { editablePreview } from ".";

const props = defineProps<EditablePreviewProps & { class?: HTMLAttributes["class"] }>();

const context = injectEditableRootContext();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <!-- Reka's preview stays focusable and starts editing even when the root is disabled -->
  <EditablePreview
    v-bind="delegated"
    data-slot="editable-preview"
    :tabindex="context.disabled.value ? -1 : 0"
    :class="cn(editablePreview, context.disabled.value && 'pointer-events-none', props.class)"
  >
    <slot />
  </EditablePreview>
</template>
