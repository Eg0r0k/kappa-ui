<script setup lang="ts">
import { Progress } from "@/ui/progress";

const sizes = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"] as const;
</script>

<template>
  <div class="grid w-full max-w-sm gap-4">
    <Progress v-for="size in sizes" :key="size" :size="size" :model-value="50" />
  </div>
</template>
