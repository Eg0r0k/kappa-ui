<script setup lang="ts">
import { X } from "@lucide/vue";
import { TagsInputItemDelete, type TagsInputItemDeleteProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import vRipple from "@/lib/ripple";
import { cn } from "@/lib/utils";
import { tagsInputItemDelete } from ".";

const props = defineProps<TagsInputItemDeleteProps & { class?: HTMLAttributes["class"] }>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <TagsInputItemDelete
    v-ripple
    v-bind="delegated"
    data-slot="tags-input-item-delete"
    data-icon="inline-end"
    :class="cn(tagsInputItemDelete, props.class)"
  >
    <slot>
      <X />
    </slot>
  </TagsInputItemDelete>
</template>
