<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <div
    data-slot="alert-description"
    :class="
      cn(
        `
          col-start-2 min-w-0 text-body-md opacity-90
          group-data-[orientation=horizontal]/alert:row-start-3
          [[data-slot=alert-title]+&]:mt-1
        `,
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
