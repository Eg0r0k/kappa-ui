<script setup lang="ts">
import { Progress } from "@/ui/progress";
import { Rating } from "@/ui/rating";

const average = 4.3;
const total = 1284;
const breakdown = [
  { stars: 5, count: 802 },
  { stars: 4, count: 291 },
  { stars: 3, count: 104 },
  { stars: 2, count: 39 },
  { stars: 1, count: 48 },
];
const reviews = [
  { name: "Mira", stars: 5, text: "Quiet, warm, and the coffee is excellent." },
  { name: "Tomás", stars: 3.5, text: "Lovely room. The lift was out for two days." },
];
const percent = (count: number) => Math.round((count / total) * 100);
</script>

<template>
  <div class="flex w-full max-w-sm flex-col gap-6">
    <div class="flex items-center gap-3">
      <span class="text-headline-lg tabular-nums">{{ average }}</span>
      <div class="flex flex-col gap-1">
        <Rating readonly :model-value="average" color="warning" aria-label="Average" />
        <span class="text-body-sm text-muted-foreground">{{ total.toLocaleString("en") }} reviews</span>
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <div v-for="row in breakdown" :key="row.stars" class="flex items-center gap-3 text-body-sm">
        <span class="w-12 shrink-0 tabular-nums">{{ row.stars }} stars</span>
        <Progress
          :model-value="percent(row.count)"
          size="sm"
          color="warning"
          :aria-label="`${row.stars} stars`"
          class="flex-1"
        />
        <span class="w-9 shrink-0 text-end text-muted-foreground tabular-nums">{{ percent(row.count) }}%</span>
      </div>
    </div>
    <ul class="flex flex-col gap-4">
      <li v-for="review in reviews" :key="review.name" class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <span class="text-label-lg">{{ review.name }}</span>
          <Rating readonly size="xs" :model-value="review.stars" color="warning" />
        </div>
        <p class="text-body-md text-muted-foreground">{{ review.text }}</p>
      </li>
    </ul>
  </div>
</template>
