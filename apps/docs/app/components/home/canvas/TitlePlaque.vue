<script setup lang="ts">
import { Move } from '@lucide/vue'

defineProps<{ count: string }>()
</script>

<template>
  <div
    data-slot="canvas-plaque"
    class="flex size-full flex-col items-center justify-center gap-3 text-center select-none"
  >
    <p class="text-display-lg font-bold">Kappa UI</p>
    <p class="flex items-center gap-2.5 text-body-lg text-muted-foreground">
      <span>{{ count }}</span>
      <span aria-hidden="true">·</span>
      <span
        role="img"
        aria-label="The canvas moves in every direction"
        class="kappa-canvas-drift inline-flex text-foreground"
      >
        <Move class="size-5" />
      </span>
      <span aria-hidden="true">·</span>
      <span>click to open</span>
    </p>
  </div>
</template>

<style scoped>
.kappa-canvas-drift {
  animation: drift 1.6s ease-in-out 0.6s 3;
}

@keyframes drift {
  0%,
  100% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(3px, -2px);
  }
  75% {
    transform: translate(-3px, 2px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .drift {
    animation: none;
  }
}
</style>
