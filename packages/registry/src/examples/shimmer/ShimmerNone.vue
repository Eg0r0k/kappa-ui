<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";

const done = ref(false);
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <p :class="['shimmer text-body-md text-muted-foreground', done && 'shimmer-none']">
      {{ done ? "Response ready" : "Generating response…" }}
    </p>
    <Button variant="outline" color="neutral" size="sm" @click="done = !done">
      {{ done ? "Start again" : "Finish" }}
    </Button>
  </div>
</template>
