<script setup lang="ts">
import { ArrowLeft, Hash } from "@lucide/vue";
import { ref } from "vue";

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
  ["Leo", "Swipe right twice for the server names"],
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
  <SwipeViews v-model="view" :rubberband="false" class="h-96 w-full max-w-sm rounded-xl border border-border bg-muted">
    <ul class="absolute inset-y-0 start-0 flex w-16 flex-col items-center gap-2 py-2">
      <li v-for="item in servers" :key="item.name">
        <button
          type="button"
          :aria-label="item.name"
          :class="[
            'flex size-10 items-center justify-center rounded-xl text-label-lg outline-none focus-visible:focus-ring',
            item.name === server.name ? 'bg-primary text-primary-foreground' : 'bg-background',
          ]"
          @click="pickServer(item)"
        >
          {{ item.initial }}
        </button>
      </li>
    </ul>
    <SwipeView
      value="servers"
      class="absolute inset-y-0 start-16 flex w-[calc(100%-4rem)] translate-x-0 flex-col gap-2 py-2 pe-2 opacity-[clamp(0,1+var(--swipe-view-position),1)]"
    >
      <button
        v-for="item in servers"
        :key="item.name"
        type="button"
        class="flex h-10 flex-col justify-center rounded-md px-2 text-start outline-none focus-visible:focus-ring"
        @click="pickServer(item)"
      >
        <span class="text-label-lg">{{ item.name }}</span>
        <span class="text-body-sm text-muted-foreground">{{ item.note }}</span>
      </button>
    </SwipeView>
    <SwipeView
      value="channels"
      class="pointer-events-none absolute inset-y-0 start-0 z-1 translate-x-[max(0px,calc(var(--swipe-snap-offset)+var(--swipe-view-start)))] ps-16"
    >
      <div class="pointer-events-auto h-full rounded-ss-2xl bg-background p-2 shadow-lg">
        <p class="px-2 pt-1 pb-2 text-title-sm">{{ server.name }}</p>
        <button
          v-for="name in channels"
          :key="name"
          type="button"
          :class="[
            'flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-body-md outline-none focus-visible:focus-ring',
            name === channel ? 'bg-muted text-foreground' : 'text-muted-foreground',
          ]"
          @click="pickChannel(name)"
        >
          <Hash class="size-4" />{{ name }}
        </button>
      </div>
    </SwipeView>
    <SwipeView
      value="chat"
      class="absolute inset-y-0 start-0 z-10 flex translate-x-[calc(var(--swipe-snap-offset)+var(--swipe-view-start))] flex-col bg-background"
    >
      <header class="flex items-center gap-1.5 border-b border-border px-2 py-2 text-title-sm">
        <button
          type="button"
          aria-label="Back to the channels"
          class="flex size-8 items-center justify-center rounded-md outline-none focus-visible:focus-ring"
          @click="view = 'channels'"
        >
          <ArrowLeft class="size-4" />
        </button>
        <Hash class="size-4 text-muted-foreground" />{{ channel }}
      </header>
      <ul class="flex flex-col gap-3 p-4">
        <li v-for="([name, text], index) in messages" :key="index">
          <p class="text-label-md">{{ name }}</p>
          <p class="text-body-md text-muted-foreground">{{ text }}</p>
        </li>
      </ul>
    </SwipeView>
  </SwipeViews>
</template>
