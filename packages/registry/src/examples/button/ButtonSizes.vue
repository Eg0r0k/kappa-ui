<script setup lang="ts">
import { Plus } from "@lucide/vue";

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
      <Button :size="size.icon" variant="outline" color="neutral" aria-label="Add">
        <Plus />
      </Button>
    </template>
  </div>
</template>
