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

// reka-ui before 2.11 cancels the Enter that adds a tag only after a tick, so
// some browsers submit the form first (unovue/reka-ui#2966). While there's a
// draft, drop that submit for the rest of the keypress.
// Drop when the reka-ui peer floor is >= 2.11.
const holdImplicitSubmit = (event: KeyboardEvent) => {
  const input = event.target as HTMLInputElement;
  const form = input.form;
  if (!form || !input.value || event.isComposing || event.defaultPrevented) return;
  const drop = (submit: Event) => {
    if (submit.target !== form) return;
    submit.preventDefault();
    submit.stopImmediatePropagation();
  };
  window.addEventListener("submit", drop, true);
  setTimeout(() => window.removeEventListener("submit", drop, true));
};
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
    @keydown.enter="holdImplicitSubmit"
  />
</template>
