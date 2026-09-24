<script setup lang="ts">
import { Checkbox } from "@/ui/checkbox";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <div class="flex items-center gap-6">
    <Checkbox v-for="size in sizes" :key="size" :size="size" :default-value="true" :aria-label="`Size ${size}`" />
  </div>
</template>
