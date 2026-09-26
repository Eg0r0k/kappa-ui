<script setup lang="ts">
import { Music } from "@lucide/vue";

import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/ui/item";

const cover = (hue: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 80% 60%)"/><stop offset="1" stop-color="hsl(${hue + 60} 70% 40%)"/></linearGradient></defs><rect width="1" height="1" fill="url(#g)"/></svg>`,
  )}`;

const albums = [
  { title: "Midnight City", artist: "Nova Lane", hue: 220 },
  { title: "Paper Suns", artist: "The Quiet Hours", hue: 20 },
];
</script>

<template>
  <ItemGroup class="w-full max-w-md gap-2">
    <Item variant="outline">
      <ItemMedia variant="icon">
        <Music />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Icon</ItemTitle>
        <ItemDescription>An icon on a muted square.</ItemDescription>
      </ItemContent>
    </Item>
    <Item v-for="album in albums" :key="album.title" variant="outline">
      <ItemMedia variant="image">
        <img :src="cover(album.hue)" :alt="`${album.title} cover`" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{{ album.title }}</ItemTitle>
        <ItemDescription>{{ album.artist }}</ItemDescription>
      </ItemContent>
    </Item>
  </ItemGroup>
</template>
