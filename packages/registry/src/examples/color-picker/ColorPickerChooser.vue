<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerField,
  ColorPickerPreview,
  ColorPickerSlider,
} from "@/ui/color-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";

const color = ref("#22c55e");
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="outline" color="neutral">
        <span
          data-icon="inline-start"
          aria-hidden="true"
          class="size-4 rounded-full inset-ring inset-ring-border"
          :style="{ backgroundColor: color }"
        />
        Choose colour
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-3">
      <ColorPicker v-model="color" class="w-56">
        <ColorPickerArea />
        <ColorPickerSlider />
        <div class="flex gap-(--color-picker-gap)">
          <ColorPickerPreview />
          <ColorPickerField />
        </div>
      </ColorPicker>
    </PopoverContent>
  </Popover>
</template>
