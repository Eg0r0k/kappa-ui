<script setup lang="ts">
import { ArrowRight, X } from '@lucide/vue'
import { computed } from 'vue'

import { Button } from '@/ui/button'
import type { CanvasComponent } from '~/lib/canvas'

const props = defineProps<{ component: CanvasComponent }>()
defineEmits<{ close: [] }>()

const words = computed(() => props.component.description.split(/\s+/).filter(Boolean))
</script>

<template>
  <section
    data-slot="canvas-description"
    aria-live="polite"
    class="pointer-events-auto rounded-surface-md bg-popover p-4 text-popover-foreground shadow-shadow-popover"
  >
    <Transition mode="out-in" leave-active-class="transition-opacity duration-short-2" leave-to-class="opacity-0">
      <div :key="component.slug" class="flex flex-col gap-2">
        <div class="flex items-start gap-2">
          <h2 class="kappa-canvas-word min-w-0 flex-1 font-display text-title-lg font-semibold text-balance">
            {{ component.title }}
          </h2>
          <Button
            variant="ghost"
            color="neutral"
            size="icon-sm"
            class="-mt-1 -me-1.5 shrink-0"
            aria-label="Close"
            @click="$emit('close')"
          >
            <X />
          </Button>
        </div>
        <p class="font-display text-body-md text-pretty text-muted-foreground">
          <template v-for="(word, i) in words" :key="i">
            <span class="kappa-canvas-word inline-block" :style="{ '--i': i + 1 }">{{ word }}</span
            >{{ ' ' }}
          </template>
        </p>
        <Button
          as-child
          variant="link"
          size="sm"
          class="kappa-canvas-word h-auto self-start p-0 font-display"
          :style="{ '--i': words.length + 1 }"
        >
          <NuxtLink :to="component.path">
            Documentation
            <ArrowRight data-icon="inline-end" />
          </NuxtLink>
        </Button>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
/* Each word rises out of a soft blur; the stagger is capped so long text doesn't drag. */
.kappa-canvas-word {
  animation: word-in var(--transition-duration-medium-4, 400ms) var(--ease-emphasized-decelerate) both;
  animation-delay: calc(min(var(--i, 0), 28) * 22ms);
}

@keyframes word-in {
  from {
    opacity: 0;
    transform: translateY(0.35em);
    filter: blur(3px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .kappa-canvas-word {
    animation: word-fade var(--transition-duration-short-4, 200ms) ease both;
    animation-delay: 0ms;
  }

  @keyframes word-fade {
    from {
      opacity: 0;
    }
  }
}
</style>
