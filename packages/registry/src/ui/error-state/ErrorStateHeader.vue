<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { EmptyHeader } from "@/ui/empty";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <EmptyHeader data-slot="error-state-header" :class="props.class">
    <slot />
  </EmptyHeader>
</template>
