<script setup lang="ts">
import { TagsInputItemText, type TagsInputItemTextProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<TagsInputItemTextProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <TagsInputItemText v-bind="delegated" data-slot="tags-input-item-text" :class="cn('truncate', props.class)">
    <slot />
  </TagsInputItemText>
</template>
