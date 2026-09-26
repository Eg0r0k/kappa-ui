<script setup lang="ts">
import { Inbox } from "@lucide/vue";

import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/ui/item";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <div class="grid w-full max-w-md gap-3">
    <Item v-for="size in sizes" :key="size" :size="size" variant="outline">
      <ItemMedia variant="icon">
        <Inbox />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Size {{ size }}</ItemTitle>
        <ItemDescription>Padding, text and media follow the size.</ItemDescription>
      </ItemContent>
    </Item>
  </div>
</template>
