<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <ol
    data-slot="breadcrumb-list"
    :class="
      cn(
        `
          flex flex-wrap items-center gap-(--breadcrumb-gap) text-body-md break-words text-muted-foreground
          [--breadcrumb-gap:--spacing(1.5)]
          sm:[--breadcrumb-gap:--spacing(2.5)]
        `,
        props.class,
      )
    "
  >
    <slot />
  </ol>
</template>
