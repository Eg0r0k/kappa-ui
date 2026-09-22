<script setup lang="ts">
import { Button } from "@/ui/button";

const sizes = [
  { text: "sm", icon: "icon-sm", label: "Small" },
  { text: "default", icon: "icon", label: "Default" },
  { text: "lg", icon: "icon-lg", label: "Large" },
  { text: "xl", icon: "icon-xl", label: "Extra large" },
] as const;
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <template v-for="size in sizes" :key="size.text">
      <Button :size="size.text">{{ size.label }}</Button>
      <Button :size="size.icon" variant="outline" aria-label="Add">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5v14" />
        </svg>
      </Button>
    </template>
  </div>
</template>
