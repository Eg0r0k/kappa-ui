<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { dropdownMenuShortcut } from ".";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <span data-slot="dropdown-menu-shortcut" dir="ltr" :class="cn(dropdownMenuShortcut, props.class)">
    <slot />
  </span>
</template>
