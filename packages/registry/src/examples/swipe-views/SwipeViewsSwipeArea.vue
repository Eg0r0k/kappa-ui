<script setup lang="ts">
import { Archive, Trash2 } from "@lucide/vue";
import { ref } from "vue";

import { Item, ItemContent, ItemTitle } from "@/ui/item";
import { SwipeAction, SwipeActions, SwipeContent, SwipeItem, SwipeRoot } from "@/ui/swipe-actions";
import { SwipeView, SwipeViews, SwipeViewsSwipeArea } from "@/ui/swipe-views";

const folders = [
  { value: "inbox", label: "Inbox", mails: ["Notes on the engine", "Q4 roadmap review", "Lunch on Friday?"] },
  { value: "updates", label: "Updates", mails: ["Your build passed", "New sign-in on Linux", "Invoice for October"] },
  { value: "social", label: "Social", mails: ["Mia mentioned you", "Leo shared an album", "3 new followers"] },
];

const folder = ref("inbox");
</script>

<template>
  <SwipeViews v-model="folder" swipe-area-only class="h-72 w-full max-w-sm rounded-xl border border-border">
    <SwipeView v-for="item in folders" :key="item.value" :value="item.value">
      <p class="px-4 pt-3 pb-2 text-label-md text-muted-foreground">{{ item.label }}</p>
      <SwipeRoot as="ul" class="divide-y divide-border">
        <SwipeItem v-for="mail in item.mails" :key="mail" as="li">
          <SwipeActions side="start">
            <SwipeAction color="info"><Archive /> Archive</SwipeAction>
          </SwipeActions>
          <SwipeActions side="end">
            <SwipeAction color="destructive"><Trash2 /> Delete</SwipeAction>
          </SwipeActions>
          <SwipeContent>
            <Item size="sm">
              <ItemContent>
                <ItemTitle>{{ mail }}</ItemTitle>
              </ItemContent>
            </Item>
          </SwipeContent>
        </SwipeItem>
      </SwipeRoot>
    </SwipeView>
    <SwipeViewsSwipeArea side="start" class="bg-foreground/5 data-disabled:bg-transparent" />
    <SwipeViewsSwipeArea side="end" class="bg-foreground/5 data-disabled:bg-transparent" />
  </SwipeViews>
</template>
