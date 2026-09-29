<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { tableStyles } from ".";

const props = defineProps<{ sticky?: boolean; class?: HTMLAttributes["class"] }>();
</script>

<template>
  <thead
    data-slot="table-header"
    :data-sticky="props.sticky ? '' : undefined"
    :class="cn(tableStyles.header, props.class)"
  >
    <slot />
  </thead>
</template>
