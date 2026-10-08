<script setup lang="ts">
const rows = ["shimmer", "shimmer shimmer-duration-1000", "shimmer shimmer-spread-24", "shimmer shimmer-angle-45"];
</script>

<template>
  <div class="grid w-full max-w-lg gap-6 text-center text-body-md text-muted-foreground sm:grid-cols-2">
    <div v-for="row in rows" :key="row" class="flex flex-col gap-2">
      <p :class="row">Generating response…</p>
      <code class="text-body-sm">{{ row }}</code>
    </div>
  </div>
</template>
