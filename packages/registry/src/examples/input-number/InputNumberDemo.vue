<script setup lang="ts">
import { ref } from "vue";

import { InputNumber, InputNumberDecrement, InputNumberIncrement, InputNumberInput } from "@/ui/input-number";

defineOptions({ inheritAttrs: false });

const quantity = ref(1);
</script>

<template>
  <InputNumber v-model="quantity" :min="0" :max="99" class="w-40" v-bind="$attrs">
    <InputNumberDecrement />
    <InputNumberInput aria-label="Quantity" />
    <InputNumberIncrement />
  </InputNumber>
</template>
