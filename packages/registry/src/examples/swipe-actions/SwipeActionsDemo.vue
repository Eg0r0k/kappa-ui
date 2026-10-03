<script setup lang="ts">
import { Archive, Flag, Trash2 } from "@lucide/vue";
import { ref } from "vue";

import { Item, ItemContent, ItemDescription, ItemTitle } from "@/ui/item";
import { SwipeAction, SwipeActions, SwipeContent, SwipeItem, SwipeRoot } from "@/ui/swipe-actions";

const initial = [
  { id: 1, sender: "Ada Lovelace", subject: "Notes on the engine", flagged: false },
  { id: 2, sender: "Grace Hopper", subject: "Q4 roadmap review", flagged: false },
  { id: 3, sender: "Alan Turing", subject: "Lunch on Friday?", flagged: true },
];

const mails = ref(initial.map((mail) => ({ ...mail })));

const remove = (id: number) => (mails.value = mails.value.filter((mail) => mail.id !== id));
const toggleFlag = (id: number) =>
  (mails.value = mails.value.map((mail) => (mail.id === id ? { ...mail, flagged: !mail.flagged } : mail)));
const restore = () => (mails.value = initial.map((mail) => ({ ...mail })));
</script>

<template>
  <div class="w-full max-w-sm overflow-clip rounded-xl border border-border">
    <SwipeRoot as="ul" class="divide-y divide-border">
      <SwipeItem v-for="mail in mails" :key="mail.id" as="li">
        <SwipeActions side="start" full-swipe>
          <SwipeAction color="info" @click="remove(mail.id)"><Archive /> Archive</SwipeAction>
        </SwipeActions>
        <SwipeActions side="end" full-swipe>
          <SwipeAction color="warning" @click="toggleFlag(mail.id)">
            <Flag /> {{ mail.flagged ? "Unflag" : "Flag" }}
          </SwipeAction>
          <SwipeAction color="destructive" @click="remove(mail.id)"><Trash2 /> Delete</SwipeAction>
        </SwipeActions>
        <SwipeContent>
          <Item size="sm">
            <ItemContent>
              <ItemTitle>
                {{ mail.sender }}
                <Flag v-if="mail.flagged" class="size-3.5 text-warning-text" />
              </ItemTitle>
              <ItemDescription>{{ mail.subject }}</ItemDescription>
            </ItemContent>
          </Item>
        </SwipeContent>
      </SwipeItem>
    </SwipeRoot>
    <button
      v-if="mails.length === 0"
      type="button"
      class="w-full px-4 py-6 text-body-md text-muted-foreground outline-none focus-visible:focus-ring-inset"
      @click="restore"
    >
      No messages left. Bring them back
    </button>
  </div>
</template>
