<script setup lang="ts">
import { TabsContent } from "reka-ui";
import { ref } from "vue";

import { Item, ItemContent, ItemDescription, ItemTitle } from "@/ui/item";
import { ScrollArea } from "@/ui/scroll-area";
import { SwipeView, SwipeViews } from "@/ui/swipe-views";
import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs";

const tabs = [
  {
    value: "chats",
    label: "Chats",
    rows: [
      ["Ada Lovelace", "The engine notes are ready"],
      ["Grace Hopper", "Found the bug, literally"],
      ["Alan Turing", "Lunch on Friday?"],
      ["Katherine Johnson", "Trajectory checks out"],
      ["Linus Torvalds", "Patch looks fine, merging"],
      ["Margaret Hamilton", "Priority display works"],
      ["Dennis Ritchie", "Sent you the pointer tips"],
      ["Barbara Liskov", "About that substitution"],
    ],
  },
  {
    value: "groups",
    label: "Groups",
    rows: [
      ["Design crit", "Mia: new icons are up"],
      ["Release crew", "Version PR is green"],
      ["Book club", "Next: The Soul of a New Machine"],
      ["Climbing", "Saturday at nine?"],
      ["Family", "Photos from the weekend"],
      ["Neighbours", "Parcel left at number 4"],
    ],
  },
  {
    value: "channels",
    label: "Channels",
    rows: [
      ["Vue News", "Vapor mode, a first look"],
      ["Tailwind", "A new release is out"],
      ["Frontend Weekly", "Issue 412"],
      ["CSS Tricks", "Scroll-driven animations in practice"],
      ["Open Source Daily", "Five tools worth a star"],
    ],
  },
];

const tab = ref("chats");
</script>

<template>
  <Tabs v-model="tab" class="w-full max-w-sm gap-0 overflow-clip rounded-xl border border-border">
    <TabsList variant="line" class="w-full">
      <TabsTrigger v-for="item in tabs" :key="item.value" :value="item.value">{{ item.label }}</TabsTrigger>
    </TabsList>
    <SwipeViews v-model="tab" class="h-72">
      <TabsContent v-for="item in tabs" :key="item.value" :value="item.value" force-mount as-child>
        <SwipeView :value="item.value" class="outline-none focus-visible:focus-ring-inset">
          <ScrollArea class="h-full">
            <Item v-for="[name, text] in item.rows" :key="name" size="sm">
              <ItemContent>
                <ItemTitle>{{ name }}</ItemTitle>
                <ItemDescription>{{ text }}</ItemDescription>
              </ItemContent>
            </Item>
          </ScrollArea>
        </SwipeView>
      </TabsContent>
    </SwipeViews>
  </Tabs>
</template>
