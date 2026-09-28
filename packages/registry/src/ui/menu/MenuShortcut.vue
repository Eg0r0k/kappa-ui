<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { menuShortcut } from ".";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <span data-slot="menu-shortcut" :class="cn(menuShortcut, props.class)">
    <slot />
  </span>
</template>
