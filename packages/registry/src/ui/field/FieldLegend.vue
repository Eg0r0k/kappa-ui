<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <legend
    data-slot="field-legend"
    :class="
      cn(
        `
          mb-4 text-title-md
          group-data-disabled/fieldset:text-foreground/(--disabled-opacity)
          group-data-invalid/fieldset:text-destructive
        `,
        props.class,
      )
    "
  >
    <slot />
  </legend>
</template>
