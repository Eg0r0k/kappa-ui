<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { injectTourContext } from ".";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();

const { descriptionId } = injectTourContext();
</script>

<template>
  <p :id="descriptionId" data-slot="tour-description" :class="cn('text-body-md text-muted-foreground', props.class)">
    <slot />
  </p>
</template>
