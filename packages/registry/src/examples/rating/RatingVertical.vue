<script setup lang="ts">
import { ref } from "vue";

import { Rating, RatingItem } from "@/ui/rating";

const difficulty = ref(2);
</script>

<template>
  <div class="flex items-center gap-4">
    <Rating
      v-model="difficulty"
      orientation="vertical"
      color="neutral"
      :length="4"
      aria-label="Difficulty"
      v-slot="{ items }"
    >
      <RatingItem v-for="item in items" :key="item" :item="item" />
    </Rating>
    <span class="text-body-md text-muted-foreground tabular-nums">Difficulty {{ difficulty }} of 4</span>
  </div>
</template>
