<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { EmptyDescription } from "@/ui/empty";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <EmptyDescription data-slot="error-state-description" :class="props.class">
    <slot />
  </EmptyDescription>
</template>
