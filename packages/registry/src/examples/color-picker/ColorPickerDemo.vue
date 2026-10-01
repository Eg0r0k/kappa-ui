<script setup lang="ts">
import { ref } from "vue";

import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerField,
  ColorPickerPreview,
  ColorPickerSlider,
  ColorPickerSwatch,
  ColorPickerSwatches,
} from "@/ui/color-picker";

const color = ref("#3b82f6");
const presets = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"];
</script>

<template>
  <ColorPicker v-model="color" class="w-64">
    <ColorPickerArea />
    <ColorPickerSlider channel="hue" />
    <ColorPickerSlider channel="alpha" />
    <div class="flex gap-(--color-picker-gap)">
      <ColorPickerPreview />
      <ColorPickerField />
    </div>
    <ColorPickerSwatches>
      <ColorPickerSwatch v-for="preset in presets" :key="preset" :value="preset" />
    </ColorPickerSwatches>
  </ColorPicker>
</template>
