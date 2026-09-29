<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { tableStyles } from ".";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <tbody data-slot="table-body" :class="cn(tableStyles.body, props.class)">
    <slot />
  </tbody>
</template>
