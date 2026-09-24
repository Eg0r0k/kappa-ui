<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";

const open = ref(false);
</script>

<template>
  <div class="flex w-full max-w-sm flex-col items-start gap-4">
    <Button size="sm" variant="outline" color="neutral" @click="open = !open">
      {{ open ? "Hide" : "Show" }} notification
    </Button>
    <div class="h-20 w-full">
      <Transition
        enter-active-class="transition duration-medium-2 ease-emphasized-decelerate motion-reduce:transition-none"
        leave-active-class="transition duration-short-3 ease-emphasized-accelerate motion-reduce:transition-none"
        enter-from-class="translate-y-2 opacity-0"
        leave-to-class="translate-y-2 opacity-0"
      >
        <div v-if="open" role="status" class="rounded-lg border bg-background px-4 py-3">
          <p class="text-title-sm">Changes saved</p>
          <p class="text-body-sm text-muted-foreground">Your project is up to date.</p>
        </div>
      </Transition>
    </div>
  </div>
</template>
