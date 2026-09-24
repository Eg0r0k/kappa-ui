<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<{
    size?: "default" | "sm";
    class?: HTMLAttributes["class"];
  }>(),
  { size: "default" },
);
</script>

<template>
  <div
    data-slot="card"
    :data-size="props.size"
    :class="
      cn(
        'group/card flex flex-col gap-(--card-spacing) rounded-xl border bg-card py-(--card-spacing) text-card-foreground [--card-spacing:--spacing(6)] data-[size=sm]:[--card-spacing:--spacing(4)]',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
