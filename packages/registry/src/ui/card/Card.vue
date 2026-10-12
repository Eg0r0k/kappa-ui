<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { type CardSize, type CardVariants, cardVariants } from ".";

const props = withDefaults(
  defineProps<{
    variant?: CardVariants["variant"];
    size?: CardSize;
    class?: HTMLAttributes["class"];
  }>(),
  { variant: "outline", size: "md" },
);
</script>

<template>
  <div
    data-slot="card"
    :data-variant="props.variant"
    :data-size="props.size"
    :class="cn(cardVariants({ variant: props.variant, size: props.size }), props.class)"
  >
    <slot />
  </div>
</template>
