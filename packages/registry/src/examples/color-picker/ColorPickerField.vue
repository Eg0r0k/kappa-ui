<script setup lang="ts">
import { computed, ref } from "vue";

import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerField,
  ColorPickerPreview,
  ColorPickerSlider,
} from "@/ui/color-picker";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";

const color = ref("#bfdbfe");

const luminance = computed(() => {
  const [r, g, b] = [1, 3, 5].map((start) => parseInt(color.value.slice(start, start + 2), 16) / 255);
  return 0.299 * r! + 0.587 * g! + 0.114 * b!;
});
const tooLight = computed(() => luminance.value > 0.6);
</script>

<template>
  <Field :invalid="tooLight" class="w-64">
    <FieldLabel>Brand colour</FieldLabel>
    <ColorPicker v-model="color" name="brand">
      <ColorPickerArea />
      <ColorPickerSlider />
      <div class="flex gap-(--color-picker-gap)">
        <ColorPickerPreview />
        <ColorPickerField />
      </div>
    </ColorPicker>
    <FieldDescription>Used on buttons and links.</FieldDescription>
    <FieldError :errors="tooLight ? 'Too light for white text.' : null" />
  </Field>
</template>
