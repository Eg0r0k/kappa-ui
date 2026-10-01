<script setup lang="ts">
import { ColorAreaArea, ColorAreaRoot, type ColorAreaRootProps, ColorAreaThumb } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { colorPickerArea, colorPickerAreaCanvas, colorPickerThumb, injectColorPickerContext } from ".";

const props = withDefaults(
  defineProps<
    Omit<ColorAreaRootProps, "modelValue" | "defaultValue" | "disabled"> & { class?: HTMLAttributes["class"] }
  >(),
  { colorSpace: "hsb", xChannel: "saturation", yChannel: "brightness" },
);

const context = injectColorPickerContext();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
</script>

<template>
  <ColorAreaRoot
    v-slot="{ style }"
    v-bind="delegated"
    data-slot="color-picker-area"
    :model-value="context.color.value"
    :disabled="context.disabled.value"
    :class="cn(colorPickerArea, props.class)"
    @update:color="context.setColor"
  >
    <ColorAreaArea data-slot="color-picker-area-canvas" :style="style" :class="colorPickerAreaCanvas">
      <ColorAreaThumb
        data-slot="color-picker-area-thumb"
        :aria-invalid="context.invalid.value"
        :aria-describedby="context.describedBy.value"
        :style="{ backgroundColor: context.hex.value }"
        :class="colorPickerThumb"
      />
    </ColorAreaArea>
  </ColorAreaRoot>
</template>
