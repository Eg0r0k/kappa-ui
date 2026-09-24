<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <div
    data-slot="listbox-separator"
    aria-hidden="true"
    :class="cn('-mx-1 my-1 h-px shrink-0 bg-border group-data-[variant=ghost]/listbox:mx-0', props.class)"
  />
</template>
