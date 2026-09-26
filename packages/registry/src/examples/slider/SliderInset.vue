<script setup lang="ts">
import { ref } from "vue";

import { Field, FieldLabel } from "@/ui/field";
import { Slider } from "@/ui/slider";

const volume = ref(30);
const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <div class="flex w-full max-w-xs flex-col gap-8">
    <Field>
      <div class="flex items-center justify-between">
        <FieldLabel>Volume</FieldLabel>
        <span class="text-label-lg text-muted-foreground tabular-nums">{{ volume }}%</span>
      </div>
      <Slider v-model="volume" variant="inset" />
    </Field>
    <Slider variant="inset" :default-value="[20, 60]" aria-label="Price range" />
    <div class="flex flex-col gap-4">
      <Slider
        v-for="(size, index) in sizes"
        :key="size"
        variant="inset"
        :size="size"
        :default-value="20 + index * 15"
        :aria-label="`Volume, ${size}`"
      />
    </div>
  </div>
</template>
