<script setup lang="ts">
import { Progress } from "@/ui/progress";

const animations = ["carousel", "carousel-inverse", "swing", "elastic"] as const;
</script>

<template>
  <div class="grid w-full max-w-sm gap-5">
    <div v-for="animation in animations" :key="animation" class="grid gap-2">
      <span class="text-label-md text-muted-foreground">{{ animation }}</span>
      <Progress :animation="animation" />
    </div>
  </div>
</template>
