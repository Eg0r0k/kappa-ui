<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";

const run = ref(0);
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <p :key="run" class="shimmer text-body-md text-muted-foreground shimmer-once shimmer-duration-1100">
      Generating response…
    </p>
    <Button variant="outline" color="neutral" size="sm" @click="run++">Replay</Button>
  </div>
</template>
