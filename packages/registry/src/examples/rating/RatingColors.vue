<script setup lang="ts">
import { Rating, RatingItem } from "@/ui/rating";

const colors = ["primary", "neutral", "warning", "destructive", "success", "info"] as const;
</script>

<template>
  <div class="grid grid-cols-[auto_auto] items-center gap-x-4 gap-y-2">
    <template v-for="color in colors" :key="color">
      <span class="font-mono text-body-sm">{{ color }}</span>
      <Rating :color="color" :default-value="3" :aria-label="`Rating, ${color}`" v-slot="{ items }">
        <RatingItem v-for="item in items" :key="item" :item="item" />
      </Rating>
    </template>
  </div>
</template>
