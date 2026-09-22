<script setup lang="ts">
import { Button } from "@/ui/button";
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-6 [&_button::after]:outline [&_button::after]:outline-dashed [&_button::after]:outline-pink-500/70"
  >
    <Button size="sm">none</Button>
    <Button size="sm" touch-target="expand">expand</Button>
    <Button size="sm" touch-target="wrapper">wrapper</Button>
    <Button size="sm" touch-target="expand">Ok</Button>
  </div>
</template>
