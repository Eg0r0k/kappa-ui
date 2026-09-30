<script setup lang="ts">
import { Minus } from "@lucide/vue";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <div
    data-slot="pin-input-separator"
    aria-hidden="true"
    :class="cn('flex shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-4', props.class)"
  >
    <slot>
      <Minus />
    </slot>
  </div>
</template>
