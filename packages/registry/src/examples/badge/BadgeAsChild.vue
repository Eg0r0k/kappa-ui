<script setup lang="ts">
import { Badge } from "@/ui/badge";
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <Badge as="a" href="#" variant="soft">What's new</Badge>
    <Badge as-child variant="link" color="neutral">
      <a href="#">Changelog</a>
    </Badge>
  </div>
</template>
