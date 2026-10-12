<script setup lang="ts">
import { ref } from "vue";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

defineOptions({ inheritAttrs: false });

const fruits = ["Apple", "Banana", "Blueberry", "Grapes", "Pineapple"];
const fruit = ref<string>();
</script>

<template>
  <Select v-model="fruit">
    <SelectTrigger class="w-48" aria-label="Fruit" v-bind="$attrs">
      <SelectValue placeholder="Select a fruit" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem v-for="item in fruits" :key="item" :value="item">{{ item }}</SelectItem>
    </SelectContent>
  </Select>
</template>
