<script setup lang="ts">
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/ui/item";

const variants = ["ghost", "outline", "soft", "subtle", "filled"] as const;
</script>

<template>
  <div class="grid w-full max-w-md gap-4">
    <Item v-for="variant in variants" :key="variant" :variant="variant">
      <ItemContent>
        <ItemTitle>{{ variant }}</ItemTitle>
        <ItemDescription>The same content on the {{ variant }} surface.</ItemDescription>
      </ItemContent>
    </Item>
  </div>
</template>
