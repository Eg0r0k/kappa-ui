<script setup lang="ts">
import { Progress } from "@/ui/progress";

const colors = ["primary", "neutral", "success", "warning", "destructive", "info"] as const;
</script>

<template>
  <div class="grid w-full max-w-sm gap-4">
    <Progress v-for="(color, index) in colors" :key="color" :color="color" :model-value="20 + index * 12" />
    <Progress color="success" :model-value="2" :max="['Queued', 'Building', 'Testing', 'Live']" />
  </div>
</template>
