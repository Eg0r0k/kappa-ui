<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <div data-slot="field-group" :class="cn('@container/field-group flex w-full flex-col gap-6', props.class)">
    <slot />
  </div>
</template>
