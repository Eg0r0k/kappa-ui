<script setup lang="ts">
import { Radio, RadioGroup } from "@/ui/radio-group";

const colors = ["primary", "neutral", "success", "warning", "destructive", "info"] as const;
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
    <RadioGroup
      v-for="color in colors"
      :key="color"
      :color="color"
      orientation="horizontal"
      default-value="on"
      :aria-label="color"
      class="gap-x-3"
    >
      <Radio value="on" aria-label="On" />
      <Radio value="off" aria-label="Off" />
    </RadioGroup>
  </div>
</template>
