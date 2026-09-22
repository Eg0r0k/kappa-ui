<script setup lang="ts">
import { Button } from "@/ui/button";
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <Button>No feedback</Button>
    <Button class="press-scale">Press and hold</Button>
    <Button variant="outline" class="press-scale">Outline</Button>
  </div>
</template>
