<script setup lang="ts">
import { Button } from "@/ui/button";
import { Item, ItemContent, ItemDescription, ItemFooter, ItemHeader, ItemTitle } from "@/ui/item";

const cover = (hue: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"><defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 80% 65%)"/><stop offset="1" stop-color="hsl(${hue + 50} 70% 45%)"/></linearGradient></defs><rect width="16" height="9" fill="url(#g)"/></svg>`,
  )}`;

const models = [
  { name: "Aurora", description: "Fast and light, for everyday answers.", hue: 200, context: "128k" },
  { name: "Borealis", description: "Slower and deeper, for long documents.", hue: 280, context: "1M" },
];
</script>

<template>
  <div class="grid w-full max-w-xl gap-4 sm:grid-cols-2">
    <Item v-for="model in models" :key="model.name" variant="outline" class="content-between overflow-hidden">
      <ItemHeader class="-mx-4 -mt-4 basis-[calc(100%+--spacing(8))]">
        <img :src="cover(model.hue)" :alt="`${model.name} artwork`" class="aspect-video w-full object-cover" />
      </ItemHeader>
      <ItemContent>
        <ItemTitle>{{ model.name }}</ItemTitle>
        <ItemDescription>{{ model.description }}</ItemDescription>
      </ItemContent>
      <ItemFooter>
        <span class="text-body-sm text-muted-foreground">{{ model.context }} context</span>
        <Button size="sm" variant="soft">Use</Button>
      </ItemFooter>
    </Item>
  </div>
</template>
