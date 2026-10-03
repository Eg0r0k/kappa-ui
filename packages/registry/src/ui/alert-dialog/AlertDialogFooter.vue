<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <div
    data-slot="alert-dialog-footer"
    :class="
      cn(
        `
          flex shrink-0 flex-col-reverse gap-2 px-6
          sm:flex-row sm:justify-end
          group-data-[size=sm]/alert-dialog:grid group-data-[size=sm]/alert-dialog:grid-cols-2
        `,
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
