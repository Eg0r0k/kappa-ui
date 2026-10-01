<script setup lang="ts">
import { computed, ref } from "vue";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";
import { TagsInput, TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText } from "@/ui/tags-input";

const skills = ref(["TypeScript"]);
const touched = ref(false);
const invalid = computed(() => touched.value && skills.value.length < 2);
</script>

<template>
  <Field :invalid="invalid" required class="w-full max-w-sm">
    <FieldLabel>Skills</FieldLabel>
    <TagsInput v-model="skills" @remove-tag="touched = true" @add-tag="touched = true">
      <TagsInputItem v-for="skill in skills" :key="skill" :value="skill">
        <TagsInputItemText />
        <TagsInputItemDelete />
      </TagsInputItem>
      <TagsInputInput placeholder="Add a skill" />
    </TagsInput>
    <FieldError v-if="invalid" errors="List at least two skills." />
    <FieldDescription v-else>Press Enter after each one.</FieldDescription>
  </Field>
</template>
