<script setup lang="ts">
import { ColorSliderRoot, type ColorSliderRootProps, ColorSliderThumb, ColorSliderTrack, colorToString } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import {
  colorPickerSlider,
  colorPickerSliderChecker,
  colorPickerSliderHandle,
  colorPickerSliderThumb,
  colorPickerSliderTrack,
  injectColorPickerContext,
} from ".";

const props = withDefaults(
  defineProps<
    Omit<ColorSliderRootProps, "modelValue" | "defaultValue" | "disabled" | "channel"> & {
      channel?: ColorSliderRootProps["channel"];
      class?: HTMLAttributes["class"];
    }
  >(),
  { channel: "hue", colorSpace: "hsb" },
);

const context = injectColorPickerContext();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});

const handleColor = (value: number) =>
  props.channel === "hue"
    ? colorToString({ space: "hsb", h: value, s: 100, b: 100, alpha: 1 }, "hex")
    : context.hex.value;
</script>

<template>
  <ColorSliderRoot
    v-bind="delegated"
    data-slot="color-picker-slider"
    :data-channel="props.channel"
    :model-value="context.color.value"
    :disabled="context.disabled.value"
    :class="cn(colorPickerSlider, props.class)"
    @update:color="context.setColor"
  >
    <span v-if="props.channel === 'alpha'" aria-hidden="true" :class="colorPickerSliderChecker" />
    <ColorSliderTrack data-slot="color-picker-slider-track" :class="colorPickerSliderTrack" />
    <ColorSliderThumb
      v-slot="{ channelValue }"
      data-slot="color-picker-slider-thumb"
      :aria-invalid="context.invalid.value"
      :aria-describedby="context.describedBy.value"
      :class="cn('group/thumb', colorPickerSliderThumb)"
    >
      <span
        data-slot="color-picker-slider-handle"
        :style="{ backgroundColor: handleColor(channelValue) }"
        :class="colorPickerSliderHandle"
      />
    </ColorSliderThumb>
  </ColorSliderRoot>
</template>
