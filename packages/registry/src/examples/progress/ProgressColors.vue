<script setup lang="ts">
import { Progress } from "@/ui/progress";

const colors = ["text-success", "text-warning", "text-info", "text-destructive", "text-foreground"];
</script>

<template>
  <div class="grid w-full max-w-sm gap-4">
    <Progress v-for="(color, index) in colors" :key="color" :model-value="20 + index * 15" :class="color" />
  </div>
</template>
