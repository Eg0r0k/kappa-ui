<script setup lang="ts">
import { Skeleton } from "@/ui/skeleton";

const colors = ["primary", "neutral", "success", "warning", "destructive", "info"] as const;
</script>

<template>
  <div class="grid w-full max-w-sm grid-cols-[auto_1fr] items-center gap-x-3 gap-y-4">
    <template v-for="color in colors" :key="color">
      <Skeleton variant="circle" :color="color" class="w-8" />
      <Skeleton :color="color" animation="wave" class="h-4" />
    </template>
  </div>
</template>
