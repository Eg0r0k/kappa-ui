<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { menuShortcut } from "@/lib/menu";
import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <span data-slot="menu-shortcut" :class="cn(menuShortcut, props.class)">
    <slot />
  </span>
</template>
