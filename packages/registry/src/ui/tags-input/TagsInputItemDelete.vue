<script setup lang="ts">
import { X } from "@lucide/vue";
import { TagsInputItemDelete, type TagsInputItemDeleteProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { injectTagsInputContext, tagsInputItemDeleteVariants } from ".";

const props = defineProps<TagsInputItemDeleteProps & { class?: HTMLAttributes["class"] }>();

const context = injectTagsInputContext();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <TagsInputItemDelete
    v-bind="delegated"
    data-slot="tags-input-item-delete"
    data-icon="inline-end"
    :class="cn(tagsInputItemDeleteVariants({ size: context.size }), props.class)"
  >
    <slot>
      <X />
    </slot>
  </TagsInputItemDelete>
</template>
