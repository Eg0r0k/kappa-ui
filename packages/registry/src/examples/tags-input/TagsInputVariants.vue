<script setup lang="ts">
import { reactive } from "vue";

import type { TextControlVariant } from "@/ui/input";
import { TagsInput, TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText } from "@/ui/tags-input";

const variants: TextControlVariant[] = ["outline", "soft", "filled", "ghost", "subtle"];
const tags = reactive(Object.fromEntries(variants.map((variant) => [variant, ["Vue", "Nuxt"]]))) as Record<
  TextControlVariant,
  string[]
>;
</script>

<template>
  <div class="flex w-full max-w-sm flex-col gap-4">
    <TagsInput v-for="variant in variants" :key="variant" v-model="tags[variant]" :variant="variant">
      <TagsInputItem v-for="tag in tags[variant]" :key="tag" :value="tag">
        <TagsInputItemText />
        <TagsInputItemDelete />
      </TagsInputItem>
      <TagsInputInput :placeholder="variant" :aria-label="`Tags, ${variant}`" />
    </TagsInput>
  </div>
</template>
