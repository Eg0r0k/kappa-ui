<script setup lang="ts">
import { ref } from "vue";

import { SWIPE_VELOCITY, useDrag } from "@/lib/drag";
import { Button } from "@/ui/button";

const card = ref<HTMLElement>();
const movement = ref(0);
const dragging = ref(false);
const dismissed = ref(false);

useDrag(card, {
  towards: "right",
  enabled: () => !dismissed.value,
  onStart: () => (dragging.value = true),
  onMove: (move) => (movement.value = move.movement),
  onRelease: (move) => {
    dragging.value = false;
    const width = card.value?.offsetWidth ?? 0;
    dismissed.value = Math.abs(movement.value) > width / 2 || Math.abs(move.velocity) >= SWIPE_VELOCITY;
    movement.value = dismissed.value ? Math.sign(movement.value || move.velocity) * width : 0;
  },
  onCancel: () => {
    dragging.value = false;
    movement.value = 0;
  },
});

const reset = () => {
  dismissed.value = false;
  movement.value = 0;
};
</script>

<template>
  <div class="flex w-full max-w-sm flex-col items-center gap-4 overflow-clip p-1">
    <div
      ref="card"
      class="w-full cursor-grab rounded-xl border border-border bg-card p-4 text-body-md transition-[translate,opacity] duration-medium-2 ease-standard select-none data-dragging:cursor-grabbing data-dragging:transition-none"
      :data-dragging="dragging || undefined"
      :style="{ translate: `${movement}px 0`, opacity: dismissed ? 0 : 1 }"
    >
      Drag me sideways. Let go past half my width, or flick, to dismiss.
    </div>
    <Button variant="outline" color="neutral" size="sm" :disabled="!dismissed" @click="reset">Bring it back</Button>
  </div>
</template>
