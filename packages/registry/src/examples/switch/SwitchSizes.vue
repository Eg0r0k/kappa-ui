<script setup lang="ts">
import { Switch } from "@/ui/switch";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div v-for="checked in [false, true]" :key="String(checked)" class="flex items-center gap-6">
      <Switch v-for="size in sizes" :key="size" :size="size" :default-value="checked" :aria-label="`Size ${size}`" />
    </div>
  </div>
</template>
