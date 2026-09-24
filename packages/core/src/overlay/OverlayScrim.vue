<script setup lang="ts">
import type { ModalScrim } from "./modal-scrim";

defineProps<{ scrim: ModalScrim }>();

const mechanics = { position: "fixed", inset: "0", pointerEvents: "auto" } as const;
</script>

<template>
  <div
    v-if="scrim.scrimVisible.value"
    aria-hidden="true"
    :style="mechanics"
    v-bind="$attrs"
    @pointerdown="scrim.onScrimPointerdown"
    @contextmenu.prevent
  />
</template>
