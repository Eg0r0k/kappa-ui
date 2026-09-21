<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <!--
    aria-hidden because a spinner on its own announces nothing useful. The
    state belongs on the control that is busy — aria-busy on a Button, or a
    live region you own. Marking it hidden keeps a screen reader from reading
    out a stray graphic that carries no meaning.

    No size of its own: the caller sets one through class, and inside a
    delta-ui Button it inherits the 16px that the button applies to any svg
    without an explicit size.
  -->
  <svg viewBox="0 0 24 24" aria-hidden="true" :class="cn('delta-spinner shrink-0', props.class)">
    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" />
  </svg>
</template>

<style scoped>
/*
  Two animations running at different periods. `sweep` walks a clip-path
  around the circle so the visible arc grows and shrinks; `flip` rotates and
  mirrors the whole thing on a period twice as long, so the growing and
  shrinking halves never line up and the motion never looks like it repeats.

  This cannot be expressed with utilities — clip-path keyframes have no
  utility form — so it lives in a scoped block. Vue rewrites keyframe names
  in scoped styles, so these cannot collide with a consumer's own.
*/
.delta-spinner {
  animation:
    delta-spinner-sweep 0.8s infinite linear alternate,
    delta-spinner-flip 1.6s infinite linear;
}

@keyframes delta-spinner-sweep {
  0% {
    clip-path: polygon(50% 50%, 0 0, 50% 0%, 50% 0%, 50% 0%, 50% 0%, 50% 0%);
  }
  12.5% {
    clip-path: polygon(50% 50%, 0 0, 50% 0%, 100% 0%, 100% 0%, 100% 0%, 100% 0%);
  }
  25% {
    clip-path: polygon(50% 50%, 0 0, 50% 0%, 100% 0%, 100% 100%, 100% 100%, 100% 100%);
  }
  50% {
    clip-path: polygon(50% 50%, 0 0, 50% 0%, 100% 0%, 100% 100%, 50% 100%, 0% 100%);
  }
  62.5% {
    clip-path: polygon(50% 50%, 100% 0, 100% 0%, 100% 0%, 100% 100%, 50% 100%, 0% 100%);
  }
  75% {
    clip-path: polygon(50% 50%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 50% 100%, 0% 100%);
  }
  100% {
    clip-path: polygon(50% 50%, 50% 100%, 50% 100%, 50% 100%, 50% 100%, 50% 100%, 0% 100%);
  }
}

@keyframes delta-spinner-flip {
  0% {
    transform: scaleY(1) rotate(0deg);
  }
  49.99% {
    transform: scaleY(1) rotate(135deg);
  }
  50% {
    transform: scaleY(-1) rotate(0deg);
  }
  100% {
    transform: scaleY(-1) rotate(-135deg);
  }
}

/*
  Frozen rather than hidden: the clip-path is held at the frame where the arc
  is widest, so the shape still reads as a loading indicator to someone who
  has asked for no motion.
*/
@media (prefers-reduced-motion: reduce) {
  .delta-spinner {
    animation: none;
    clip-path: polygon(50% 50%, 0 0, 50% 0%, 100% 0%, 100% 100%, 50% 100%, 0% 100%);
  }
}
</style>
