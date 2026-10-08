<script setup lang="ts">
import { SwipeView, SwipeViews } from "@/ui/swipe-views";

const clips = [
  { title: "Morning run", author: "@ana", tone: "bg-primary text-primary-foreground" },
  { title: "Sourdough, day three", author: "@leo", tone: "bg-warning text-warning-foreground" },
  { title: "Rooftop garden", author: "@mia", tone: "bg-success text-success-foreground" },
  { title: "Night ferry", author: "@sam", tone: "bg-info text-info-foreground" },
];
</script>

<template>
  <SwipeViews orientation="vertical" class="h-96 w-full max-w-xs rounded-xl">
    <SwipeView
      v-for="(clip, index) in clips"
      :key="clip.title"
      :value="index"
      :class="['flex flex-col justify-end gap-1 p-5', clip.tone]"
    >
      <p class="text-title-md">{{ clip.title }}</p>
      <p class="text-body-sm opacity-80">{{ clip.author }}</p>
    </SwipeView>
  </SwipeViews>
</template>
