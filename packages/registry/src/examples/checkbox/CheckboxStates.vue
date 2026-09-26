<script setup lang="ts">
import { computed, ref } from "vue";

import { Checkbox, CheckboxGroup } from "@/ui/checkbox";
import { Field, FieldLabel } from "@/ui/field";

const files = ["README.md", "package.json", "index.ts"];
const selected = ref(["README.md"]);

const all = computed({
  get: () => (selected.value.length === files.length ? true : selected.value.length === 0 ? false : "indeterminate"),
  set: (value) => {
    selected.value = value === true ? [...files] : [];
  },
});
</script>

<template>
  <div class="flex flex-col gap-3">
    <Field orientation="horizontal">
      <Checkbox v-model="all" />
      <FieldLabel>Select all</FieldLabel>
    </Field>
    <CheckboxGroup v-model="selected" class="ps-8.25">
      <Field v-for="file in files" :key="file" orientation="horizontal">
        <Checkbox :value="file" />
        <FieldLabel class="font-mono">{{ file }}</FieldLabel>
      </Field>
    </CheckboxGroup>
  </div>
</template>
