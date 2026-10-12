<script setup lang="ts">
import { CircleAlert } from "@lucide/vue";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { EmptyMedia } from "@/ui/empty";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <EmptyMedia data-slot="error-state-media" :class="cn('text-destructive', props.class)">
    <slot><CircleAlert /></slot>
  </EmptyMedia>
</template>
