<script setup lang="ts">
import { Pin, Trash2 } from "@lucide/vue";
import { ref } from "vue";

import { Button } from "@/ui/button";
import { Item, ItemContent, ItemTitle } from "@/ui/item";
import { SwipeAction, SwipeActions, SwipeContent, SwipeItem, type SwipeState } from "@/ui/swipe-actions";

const state = ref<SwipeState>("closed");
</script>

<template>
  <div class="flex w-full max-w-sm flex-col gap-3">
    <div class="overflow-clip rounded-xl border border-border">
      <SwipeItem v-model:state="state">
        <SwipeActions side="start">
          <SwipeAction color="neutral"><Pin /> Pin</SwipeAction>
        </SwipeActions>
        <SwipeActions side="end">
          <SwipeAction color="destructive"><Trash2 /> Delete</SwipeAction>
        </SwipeActions>
        <SwipeContent>
          <Item size="sm">
            <ItemContent>
              <ItemTitle>Open: {{ state }}</ItemTitle>
            </ItemContent>
          </Item>
        </SwipeContent>
      </SwipeItem>
    </div>
    <div class="flex gap-2">
      <Button variant="outline" color="neutral" size="sm" @click="state = 'start'">Open start</Button>
      <Button variant="outline" color="neutral" size="sm" @click="state = 'end'">Open end</Button>
      <Button variant="ghost" color="neutral" size="sm" @click="state = 'closed'">Close</Button>
    </div>
  </div>
</template>
