<script setup lang="ts">
import { ref } from "vue";

import { TagsInput, TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText } from "@/ui/tags-input";

defineOptions({ inheritAttrs: false });

const fruits = ref(["Apple", "Banana"]);
</script>

<template>
  <TagsInput v-model="fruits" class="max-w-sm" v-bind="$attrs">
    <TagsInputItem v-for="fruit in fruits" :key="fruit" :value="fruit">
      <TagsInputItemText />
      <TagsInputItemDelete />
    </TagsInputItem>
    <TagsInputInput placeholder="Add a fruit" aria-label="Fruits" />
  </TagsInput>
</template>
