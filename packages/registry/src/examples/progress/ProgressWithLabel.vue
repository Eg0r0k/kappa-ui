<script setup lang="ts">
import { Progress, ProgressLabel, ProgressValue } from "@/ui/progress";
</script>

<template>
  <Progress :model-value="56" class="max-w-sm">
    <ProgressLabel>Upload progress</ProgressLabel>
    <ProgressValue />
  </Progress>
</template>
