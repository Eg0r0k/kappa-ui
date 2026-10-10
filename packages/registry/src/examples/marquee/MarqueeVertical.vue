<script setup lang="ts">
import { Camera, Cloud, Cpu, Database, Globe, Layers, Music, Terminal } from "@lucide/vue";

import { Marquee } from "@/ui/marquee";

const logos = [Camera, Cloud, Cpu, Database, Globe, Layers, Music, Terminal];
</script>

<template>
  <Marquee orientation="vertical" class="h-64 w-full">
    <component :is="logo" v-for="(logo, index) in logos" :key="index" class="size-10 shrink-0 text-muted-foreground" />
  </Marquee>
</template>
