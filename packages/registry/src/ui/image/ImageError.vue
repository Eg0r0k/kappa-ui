<script setup lang="ts">
import { ImageOff } from "@lucide/vue";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { imageLayer } from ".";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <div
    data-slot="image-error"
    :class="
      cn(
        imageLayer,
        '[[data-slot=image]:not([data-state=error])>&]:hidden group-data-[state=error]/image:visible group-data-[state=error]/image:opacity-100',
        props.class,
      )
    "
  >
    <slot><ImageOff class="size-6" /></slot>
  </div>
</template>
