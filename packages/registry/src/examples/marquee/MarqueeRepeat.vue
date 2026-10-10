<script setup lang="ts">
import { Camera, Cloud, Cpu } from "@lucide/vue";

import { Marquee } from "@/ui/marquee";

const logos = [Camera, Cloud, Cpu];
</script>

<template>
  <Marquee :repeat="1" class="w-full">
    <component :is="logo" v-for="(logo, index) in logos" :key="index" class="size-10 shrink-0 text-muted-foreground" />
  </Marquee>
</template>
