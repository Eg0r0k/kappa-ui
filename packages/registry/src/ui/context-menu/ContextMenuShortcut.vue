<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { contextMenuShortcut } from ".";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <span data-slot="context-menu-shortcut" dir="ltr" :class="cn(contextMenuShortcut, props.class)">
    <slot />
  </span>
</template>
