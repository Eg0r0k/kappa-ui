<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { type EmptyVariants, emptyVariants } from ".";

const props = withDefaults(
  defineProps<{
    size?: NonNullable<EmptyVariants["size"]>;
    class?: HTMLAttributes["class"];
  }>(),
  { size: "md" },
);
</script>

<template>
  <div data-slot="empty" :data-size="props.size" :class="cn(emptyVariants({ size: props.size }), props.class)">
    <slot />
  </div>
</template>
