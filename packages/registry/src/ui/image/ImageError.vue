<script setup lang="ts">
import { ImageOff } from "@lucide/vue";
import { type HTMLAttributes, onBeforeUnmount } from "vue";

import { cn } from "@/lib/utils";
import { imageLayer, injectImageContext } from ".";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();

const image = injectImageContext(null);
if (image) {
  image.errorLayers.value++;
  onBeforeUnmount(() => image.errorLayers.value--);
}
</script>

<template>
  <div
    data-slot="image-error"
    :class="
      cn(
        imageLayer,
        `
          [[data-slot=image]:not([data-state=error])>&]:hidden
          group-data-[state=error]/image:visible group-data-[state=error]/image:opacity-100
        `,
        props.class,
      )
    "
  >
    <slot><ImageOff class="size-6" /></slot>
  </div>
</template>
