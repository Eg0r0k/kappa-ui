<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { injectTourContext } from ".";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();

const { titleId } = injectTourContext();
</script>

<template>
  <h2
    :id="titleId"
    data-slot="tour-title"
    :class="cn('text-title-sm has-[~[data-slot=tour-close]]:pe-8 [[data-slot=tour-close]~&]:pe-8', props.class)"
  >
    <slot />
  </h2>
</template>
