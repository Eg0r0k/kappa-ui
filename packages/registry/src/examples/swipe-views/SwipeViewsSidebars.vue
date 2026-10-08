<script setup lang="ts">
import { Hash } from "@lucide/vue";
import { ref } from "vue";

import { SwipeView, SwipeViews } from "@/ui/swipe-views";

const servers = ["K", "V", "T", "N"];
const channels = ["general", "releases", "design", "random"];
const messages = [
  ["Mia", "The new tokens landed on main"],
  ["Leo", "Swipe from anywhere, it feels native now"],
  ["Ana", "The member list waits on the right"],
  ["Mia", "And the server list trails behind"],
];
const members = ["Ana", "Leo", "Mia", "Sam", "Zoe"];

const view = ref("servers");
</script>

<template>
  <SwipeViews v-model="view" class="h-80 w-full max-w-sm rounded-xl border border-border bg-muted">
    <SwipeView
      value="servers"
      class="absolute inset-y-0 start-0 z-1 flex w-[calc(100%-3rem)] translate-x-[calc((var(--swipe-snap-offset)+var(--swipe-view-start))*0.3)] gap-2 bg-muted p-2"
    >
      <div class="flex flex-col gap-2">
        <span
          v-for="server in servers"
          :key="server"
          class="flex size-10 items-center justify-center rounded-xl bg-background text-label-lg"
        >
          {{ server }}
        </span>
      </div>
      <ul class="flex flex-1 flex-col gap-1">
        <li
          v-for="channel in channels"
          :key="channel"
          class="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-body-md text-muted-foreground"
        >
          <Hash class="size-4" />{{ channel }}
        </li>
      </ul>
    </SwipeView>
    <SwipeView
      value="chat"
      class="absolute inset-y-0 start-0 z-10 flex translate-x-[calc(var(--swipe-snap-offset)+var(--swipe-view-start))] flex-col bg-background shadow-lg"
    >
      <header class="flex items-center gap-1.5 border-b border-border px-4 py-3 text-title-sm">
        <Hash class="size-4 text-muted-foreground" />general
      </header>
      <ul class="flex flex-col gap-3 p-4">
        <li v-for="([name, text], index) in messages" :key="index">
          <p class="text-label-md">{{ name }}</p>
          <p class="text-body-md text-muted-foreground">{{ text }}</p>
        </li>
      </ul>
    </SwipeView>
    <SwipeView
      value="members"
      class="absolute inset-y-0 end-0 z-[clamp(0,(var(--swipe-snap-position)-1)*999,2)] w-[calc(100%-3rem)] translate-x-0 bg-muted p-4"
    >
      <p class="mb-3 text-label-md text-muted-foreground">Members: {{ members.length }}</p>
      <ul class="flex flex-col gap-2">
        <li v-for="member in members" :key="member" class="flex items-center gap-2 text-body-md">
          <span class="size-2 rounded-full bg-success" />{{ member }}
        </li>
      </ul>
    </SwipeView>
  </SwipeViews>
</template>
