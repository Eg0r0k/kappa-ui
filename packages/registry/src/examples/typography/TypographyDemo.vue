<script setup lang="ts">
import { Button } from "@/ui/button";
</script>

<template>
  <article class="w-full max-w-sm rounded-xl border bg-background p-6">
    <p class="text-label-md text-muted-foreground">Release 2.4 · 3 min read</p>
    <h3 class="mt-2 text-headline-sm">Faster sync for large projects</h3>
    <p class="mt-3 text-body-md text-muted-foreground">
      Changes now stream in as they happen, so opening a project with thousands of files no longer waits for a full
      download.
    </p>
    <div class="mt-6 flex gap-2">
      <Button size="sm">Read more</Button>
      <Button size="sm" variant="ghost" color="neutral">Dismiss</Button>
    </div>
  </article>
</template>
