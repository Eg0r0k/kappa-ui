<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { Empty } from "@/ui/empty";
import type { ErrorStateSize } from ".";

const props = withDefaults(
  defineProps<{
    size?: ErrorStateSize;
    class?: HTMLAttributes["class"];
  }>(),
  { size: "md" },
);
</script>

<template>
  <Empty data-slot="error-state" role="alert" :size="props.size" :class="props.class">
    <slot />
  </Empty>
</template>
