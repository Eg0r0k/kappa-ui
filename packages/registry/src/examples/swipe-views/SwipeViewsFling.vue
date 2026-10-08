<script setup lang="ts">
import { ref } from "vue";

import { SwipeView, SwipeViews } from "@/ui/swipe-views";

const frame = ref(1);
</script>

<template>
  <div class="flex w-full max-w-sm flex-col items-center gap-3">
    <SwipeViews v-model="frame" :sequential="false" class="aspect-video w-full rounded-xl">
      <SwipeView
        v-for="index in 10"
        :key="index"
        :value="index"
        class="flex items-center justify-center odd:bg-muted even:bg-secondary"
      >
        <span class="text-display-sm text-muted-foreground">{{ index }}</span>
      </SwipeView>
    </SwipeViews>
    <p class="text-body-sm text-muted-foreground">Frame {{ frame }} of 10</p>
  </div>
</template>
