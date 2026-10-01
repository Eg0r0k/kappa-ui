<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { Spinner } from "@/ui/spinner";
import { imageLayer } from ".";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <div
    data-slot="image-loading"
    aria-hidden="true"
    :class="
      cn(
        imageLayer,
        '[[data-slot=image]:not([data-state=loading])>&]:hidden group-data-[state=loading]/image:visible group-data-[state=loading]/image:opacity-100 group-data-[state=error]/image:delay-0 group-data-[state=loaded]/image:delay-0',
        props.class,
      )
    "
  >
    <slot><Spinner class="size-6" /></slot>
  </div>
</template>
