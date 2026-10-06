<script setup lang="ts">
import { ref } from "vue";

import { Rating } from "@/ui/rating";

const stars = ref(3.5);
</script>

<template>
  <div dir="rtl" class="flex items-center gap-3">
    <Rating v-model="stars" dir="rtl" :step="0.5" aria-label="التقييم" />
    <span class="text-body-md text-muted-foreground tabular-nums">{{ stars }}</span>
  </div>
</template>
