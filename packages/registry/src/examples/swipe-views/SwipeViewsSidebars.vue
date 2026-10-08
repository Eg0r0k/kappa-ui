<script setup lang="ts">
import { ArrowLeft, Hash } from "@lucide/vue";
import { ref } from "vue";

import { Avatar, AvatarFallback } from "@/ui/avatar";
import { Button } from "@/ui/button";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/ui/item";
import { SwipeView, SwipeViews } from "@/ui/swipe-views";

const servers = [
  { initial: "K", name: "kappa-ui", note: "New in # releases" },
  { initial: "V", name: "Vue Land", note: "New in # introduce-yourself" },
  { initial: "T", name: "Tauri Apps", note: "3 new threads" },
  { initial: "N", name: "Nuxt", note: "Nothing new" },
];
const channels = ["general", "releases", "design", "random"];
const messages = [
  ["Mia", "The avatars stay where they are"],
  ["Leo", "Swipe right for the server names"],
  ["Ana", "And the arrow brings the channels back"],
];

const view = ref("channels");
const server = ref(servers[0]!);
const channel = ref("general");

const pickServer = (item: (typeof servers)[number]) => {
  server.value = item;
  view.value = "channels";
};
const pickChannel = (name: string) => {
  channel.value = name;
  view.value = "chat";
};
</script>

<template>
  <SwipeViews
    v-model="view"
    layout="stack"
    :rubberband="false"
    class="h-96 w-full max-w-sm rounded-xl border border-border bg-muted select-none"
  >
    <ul class="absolute inset-y-0 start-0 flex w-16 flex-col items-center gap-2 py-2">
      <li v-for="item in servers" :key="item.name">
        <Button
          :variant="item.name === server.name ? 'solid' : 'subtle'"
          :color="item.name === server.name ? 'primary' : 'neutral'"
          size="icon-md"
          class="rounded-xl"
          :aria-label="item.name"
          @click="pickServer(item)"
        >
          {{ item.initial }}
        </Button>
      </li>
    </ul>
    <SwipeView
      value="servers"
      class="start-16 flex w-[calc(100%-4rem)] flex-col gap-2 py-2 pe-2 opacity-[clamp(0,1+var(--swipe-view-position),1)]"
    >
      <Item v-for="item in servers" :key="item.name" as="button" size="xs" class="h-9 py-0" @click="pickServer(item)">
        <ItemContent class="gap-0">
          <ItemTitle>{{ item.name }}</ItemTitle>
          <ItemDescription>{{ item.note }}</ItemDescription>
        </ItemContent>
      </Item>
    </SwipeView>
    <SwipeView value="channels" class="pointer-events-none ps-16">
      <div class="pointer-events-auto flex h-full flex-col gap-0.5 rounded-ss-2xl bg-background p-2 shadow-lg">
        <p class="px-3 pt-1 pb-2 text-title-sm">{{ server.name }}</p>
        <Button
          v-for="name in channels"
          :key="name"
          :variant="name === channel ? 'soft' : 'ghost'"
          color="neutral"
          size="sm"
          class="justify-start"
          @click="pickChannel(name)"
        >
          <Hash data-icon="inline-start" />{{ name }}
        </Button>
      </div>
    </SwipeView>
    <SwipeView value="chat" class="flex flex-col bg-background">
      <header class="flex items-center gap-1 border-b border-border p-2 text-title-sm">
        <Button
          variant="ghost"
          color="neutral"
          size="icon-sm"
          aria-label="Back to the channels"
          @click="view = 'channels'"
        >
          <ArrowLeft />
        </Button>
        <Hash class="size-4 text-muted-foreground" />{{ channel }}
      </header>
      <div class="flex flex-col p-2">
        <Item v-for="([name, text], index) in messages" :key="index" size="xs">
          <ItemMedia>
            <Avatar size="sm">
              <AvatarFallback>{{ name!.slice(0, 2) }}</AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{{ name }}</ItemTitle>
            <ItemDescription>{{ text }}</ItemDescription>
          </ItemContent>
        </Item>
      </div>
    </SwipeView>
  </SwipeViews>
</template>
