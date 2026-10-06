<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { menuShortcut } from "@/ui/menu";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <span data-slot="menubar-shortcut" dir="ltr" :class="cn(menuShortcut, props.class)">
    <slot />
  </span>
</template>
