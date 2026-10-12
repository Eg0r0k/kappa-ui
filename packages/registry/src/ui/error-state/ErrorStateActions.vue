<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { EmptyContent } from "@/ui/empty";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <EmptyContent data-slot="error-state-actions" :class="props.class">
    <slot />
  </EmptyContent>
</template>
