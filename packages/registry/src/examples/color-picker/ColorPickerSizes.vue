<script setup lang="ts">
import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerField,
  ColorPickerPreview,
  ColorPickerSlider,
} from "@/ui/color-picker";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <div class="grid w-full gap-8 sm:grid-cols-2">
    <ColorPicker v-for="size in sizes" :key="size" :size="size" default-value="#8b5cf6" class="w-56">
      <ColorPickerArea />
      <ColorPickerSlider />
      <div class="flex gap-(--color-picker-gap)">
        <ColorPickerPreview />
        <ColorPickerField />
      </div>
    </ColorPicker>
  </div>
</template>
