<script setup lang="ts">
import { ref } from "vue";

import { Rating } from "@/ui/rating";

const difficulty = ref(2);
</script>

<template>
  <div class="flex items-center gap-4">
    <Rating v-model="difficulty" orientation="vertical" color="neutral" :length="4" aria-label="Difficulty" />
    <span class="text-body-md text-muted-foreground tabular-nums">Difficulty {{ difficulty }} of 4</span>
  </div>
</template>
