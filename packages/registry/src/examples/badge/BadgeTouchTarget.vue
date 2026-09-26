<script setup lang="ts">
import { Badge } from "@/ui/badge";
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-6 [&_a::after]:outline [&_a::after]:outline-dashed [&_a::after]:outline-pink-500/70"
  >
    <Badge as="a" href="#" variant="soft">none</Badge>
    <Badge as="a" href="#" variant="soft" touch-target="expand">expand</Badge>
    <Badge as="a" href="#" variant="soft" touch-target="wrapper">wrapper</Badge>
  </div>
</template>
