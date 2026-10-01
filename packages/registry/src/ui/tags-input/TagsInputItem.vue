<script setup lang="ts">
import { TagsInputItem, type TagsInputItemProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { type BadgeColor, type BadgeVariants, badgeVariants } from "@/ui/badge";
import { injectTagsInputContext, tagsInputBadgeSize, tagsInputItemClass } from ".";

const props = withDefaults(
  defineProps<
    TagsInputItemProps & {
      variant?: NonNullable<BadgeVariants["variant"]>;
      color?: BadgeColor | (string & {});
      class?: HTMLAttributes["class"];
    }
  >(),
  { as: "span", variant: "soft", color: "neutral" },
);

const context = injectTagsInputContext();

const delegated = computed(() => {
  const { class: _, variant: __, color: ___, ...rest } = props;
  return rest;
});
</script>

<template>
  <TagsInputItem
    v-bind="delegated"
    data-slot="tags-input-item"
    :data-variant="props.variant"
    :data-color="props.color"
    :class="
      cn(
        badgeVariants({ variant: props.variant, size: tagsInputBadgeSize[context.size] }),
        tagsInputItemClass,
        props.class,
      )
    "
  >
    <slot />
  </TagsInputItem>
</template>
