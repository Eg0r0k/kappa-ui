<script setup lang="ts">
import { BadgeCheck, ChevronRight } from "@lucide/vue";

import { Button } from "@/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/ui/item";
</script>

<template>
  <div class="grid w-full max-w-md gap-4">
    <Item variant="outline">
      <ItemContent>
        <ItemTitle>Basic item</ItemTitle>
        <ItemDescription>A title, a description and an action on one row.</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="outline" color="neutral" size="sm">Action</Button>
      </ItemActions>
    </Item>
    <Item variant="outline" size="sm" as-child>
      <a href="#">
        <ItemMedia>
          <BadgeCheck class="size-5" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Your profile has been verified.</ItemTitle>
        </ItemContent>
        <ItemActions>
          <ChevronRight class="size-4 rtl:rotate-180" />
        </ItemActions>
      </a>
    </Item>
  </div>
</template>
