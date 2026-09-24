<script setup lang="ts">
import { ref } from "vue";

import { Field, FieldLabel } from "@/ui/field";
import { Slider } from "@/ui/slider";

const price = ref([200, 800]);
</script>

<template>
  <Field class="w-full max-w-xs">
    <div class="flex items-center justify-between">
      <FieldLabel>Price</FieldLabel>
      <span class="text-body-sm text-muted-foreground tabular-nums">${{ price[0] }} – ${{ price[1] }}</span>
    </div>
    <Slider v-model="price" :max="1000" :step="10" />
  </Field>
</template>
