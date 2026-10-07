<script setup lang="ts">
import vRipple from "@/lib/ripple";
import { Button } from "@/ui/button";
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <button
      v-ripple
      type="button"
      class="flex h-24 w-48 cursor-pointer items-center justify-center rounded-xl bg-muted text-label-lg outline-none focus-visible:focus-ring"
    >
      Press near an edge
    </button>
    <Button>Built in</Button>
    <Button v-ripple="{ color: 'red', opacity: 0.3 }" variant="ghost" color="neutral">Tinted</Button>
    <Button v-ripple="false" variant="outline" color="neutral">Off</Button>
  </div>
</template>
