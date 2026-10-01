<script setup lang="ts">
import { reactive } from "vue";

import type { TextControlSize } from "@/ui/input";
import { TagsInput, TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText } from "@/ui/tags-input";

const sizes: TextControlSize[] = ["xs", "sm", "md", "lg", "xl"];
const tags = reactive(Object.fromEntries(sizes.map((size) => [size, ["Vue", "Nuxt"]]))) as Record<
  TextControlSize,
  string[]
>;
</script>

<template>
  <div class="flex w-full max-w-sm flex-col gap-4">
    <TagsInput v-for="size in sizes" :key="size" v-model="tags[size]" :size="size">
      <TagsInputItem v-for="tag in tags[size]" :key="tag" :value="tag">
        <TagsInputItemText />
        <TagsInputItemDelete />
      </TagsInputItem>
      <TagsInputInput :placeholder="size" :aria-label="`Tags, ${size}`" />
    </TagsInput>
  </div>
</template>
