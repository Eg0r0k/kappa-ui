<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <div
    data-slot="alert-dialog-media"
    :class="
      cn(
        'mb-2 inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground [&_svg]:pointer-events-none icon-size-6',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
