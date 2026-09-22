<script setup lang="ts">
import { Button } from "@/ui/button";
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <Button as="a" href="https://vuejs.org" variant="outline">as="a"</Button>
    <Button as-child>
      <a href="https://vuejs.org">as-child</a>
    </Button>
  </div>
</template>
