<script setup lang="ts">
import { ref } from "vue";

import { ColorPicker, ColorPickerArea, type ColorPickerFormat, ColorPickerSlider } from "@/ui/color-picker";
import { ToggleGroup, ToggleGroupItem } from "@/ui/toggle-group";

const formats = ["hex", "rgb", "hsl", "hsb"] as const;
const format = ref<ColorPickerFormat>("hex");
const color = ref("#f97316");

const pick = (value: unknown) => {
  if (typeof value === "string" && value) format.value = value as ColorPickerFormat;
};
</script>

<template>
  <div class="flex w-64 flex-col gap-4">
    <ToggleGroup type="single" size="sm" aria-label="Format" :model-value="format" @update:model-value="pick">
      <ToggleGroupItem v-for="item in formats" :key="item" :value="item">{{ item }}</ToggleGroupItem>
    </ToggleGroup>
    <ColorPicker v-model="color" :format="format">
      <ColorPickerArea />
      <ColorPickerSlider />
      <ColorPickerSlider channel="alpha" />
    </ColorPicker>
    <code class="text-body-sm text-muted-foreground">{{ color }}</code>
  </div>
</template>
