<script setup lang="ts">
import { TagsInputInput, type TagsInputInputProps, useForwardExpose } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { injectTagsInputContext, tagsInputInputVariants } from ".";

const props = defineProps<TagsInputInputProps & { class?: HTMLAttributes["class"] }>();

const context = injectTagsInputContext();
const { forwardRef } = useForwardExpose();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <TagsInputInput
    v-bind="delegated"
    :ref="forwardRef"
    data-slot="tags-input-input"
    :aria-invalid="context.invalid"
    :aria-describedby="context.describedBy"
    :aria-required="context.required || undefined"
    :class="cn(tagsInputInputVariants({ size: context.size }), props.class)"
  />
</template>
