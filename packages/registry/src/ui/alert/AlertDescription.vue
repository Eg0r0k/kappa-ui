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
        'col-start-2 min-w-0 text-body-md opacity-90 group-data-[orientation=horizontal]/alert:row-start-3 group-data-[size=xs]/alert:text-body-sm group-data-[size=sm]/alert:text-body-sm group-data-[size=lg]/alert:text-body-lg group-data-[size=xl]/alert:text-body-lg [[data-slot=alert-title]+&]:mt-1',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
