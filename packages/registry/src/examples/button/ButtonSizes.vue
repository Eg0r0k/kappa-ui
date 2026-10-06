<script setup lang="ts">
import { Plus } from "@lucide/vue";

import { Button } from "@/ui/button";

const sizes = [
  { text: "xs", icon: "icon-xs", label: "Extra small" },
  { text: "sm", icon: "icon-sm", label: "Small" },
  { text: "md", icon: "icon-md", label: "Medium" },
  { text: "lg", icon: "icon-lg", label: "Large" },
  { text: "xl", icon: "icon-xl", label: "Extra large" },
] as const;
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <template v-for="size in sizes" :key="size.text">
      <Button :size="size.text">{{ size.label }}</Button>
      <Button :size="size.icon" variant="outline" color="neutral" aria-label="Add">
        <Plus />
      </Button>
    </template>
  </div>
</template>
