<script setup lang="ts">
import { ref } from "vue";

import {
  Combobox,
  ComboboxAnchor,
  ComboboxCancel,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxViewport,
} from "@/ui/combobox";

const fruits = ["Apple", "Banana", "Blueberry", "Grapes", "Pineapple"];
const fruit = ref<string | null>("Banana");
</script>

<template>
  <Combobox v-model="fruit" reset-model-value-on-clear>
    <ComboboxAnchor class="w-56">
      <ComboboxInput placeholder="Select a fruit" aria-label="Fruit" />
      <ComboboxCancel />
      <ComboboxTrigger />
    </ComboboxAnchor>
    <ComboboxList>
      <ComboboxViewport>
        <ComboboxEmpty>No fruit found.</ComboboxEmpty>
        <ComboboxItem v-for="item in fruits" :key="item" :value="item">{{ item }}</ComboboxItem>
      </ComboboxViewport>
    </ComboboxList>
  </Combobox>
</template>
