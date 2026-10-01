<script setup lang="ts">
import { ref } from "vue";

import { TagsInput, TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText } from "@/ui/tags-input";

type Label = { id: string; name: string };

const labels = ref<Label[]>([
  { id: "bug", name: "Bug" },
  { id: "good-first-issue", name: "Good first issue" },
]);

const toLabel = (name: string): Label => ({ id: name.trim().toLowerCase().replace(/\s+/g, "-"), name: name.trim() });
</script>

<template>
  <div class="flex w-full max-w-sm flex-col gap-3">
    <TagsInput v-model="labels" :convert-value="toLabel" :display-value="(label) => label.name">
      <TagsInputItem v-for="label in labels" :key="label.id" :value="label" color="primary">
        <TagsInputItemText />
        <TagsInputItemDelete />
      </TagsInputItem>
      <TagsInputInput placeholder="Add a label" aria-label="Labels" />
    </TagsInput>
    <p class="text-body-sm text-muted-foreground">{{ labels.map((label) => label.id).join(", ") || "No labels" }}</p>
  </div>
</template>
