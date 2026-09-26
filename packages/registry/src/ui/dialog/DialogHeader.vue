<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <div
    data-slot="dialog-header"
    :class="cn('flex shrink-0 flex-col gap-1.5 px-6 group-has-[>[data-slot=dialog-close]]/dialog:pe-14', props.class)"
  >
    <slot />
  </div>
</template>
