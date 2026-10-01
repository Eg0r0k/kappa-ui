<script setup lang="ts">
import { ref } from "vue";

import { ColorPicker, ColorPickerField, ColorPickerPreview, ColorPickerSlider } from "@/ui/color-picker";

const color = ref("#8b5cf6");
const channels = ["red", "green", "blue", "alpha"] as const;
</script>

<template>
  <ColorPicker v-model="color" class="w-full max-w-sm flex-row">
    <ColorPickerPreview class="h-auto w-16 self-stretch" />
    <div class="flex flex-1 flex-col gap-(--color-picker-gap)">
      <div v-for="channel in channels" :key="channel" class="flex items-center gap-(--color-picker-gap)">
        <ColorPickerSlider :channel="channel" :aria-label="channel" />
        <ColorPickerField :channel="channel" class="w-16 flex-none" />
      </div>
    </div>
  </ColorPicker>
</template>
