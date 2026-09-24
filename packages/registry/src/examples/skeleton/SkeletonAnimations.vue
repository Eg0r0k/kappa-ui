<script setup lang="ts">
import { Skeleton } from "@/ui/skeleton";

const animations = ["pulse", "wave", "none"] as const;
</script>

<template>
  <div class="grid w-full max-w-2xl gap-6 sm:grid-cols-3">
    <div v-for="animation in animations" :key="animation" class="flex flex-col gap-3">
      <Skeleton :animation="animation" class="aspect-video w-full rounded-xl" />
      <div class="flex items-center gap-3">
        <Skeleton :animation="animation" variant="circle" class="size-8" />
        <Skeleton :animation="animation" class="h-3 flex-1" />
      </div>
      <p class="text-label-md text-muted-foreground">{{ animation }}</p>
    </div>
  </div>
</template>
