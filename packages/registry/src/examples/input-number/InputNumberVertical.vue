<script setup lang="ts">
import { ref } from "vue";

import { InputNumber, InputNumberDecrement, InputNumberIncrement, InputNumberInput } from "@/ui/input-number";

const rows = ref(25);
</script>

<template>
  <InputNumber v-model="rows" :min="5" :max="100" :step="5" orientation="vertical" class="w-40">
    <InputNumberInput aria-label="Rows per page" />
    <InputNumberIncrement />
    <InputNumberDecrement />
  </InputNumber>
</template>
