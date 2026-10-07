<script setup lang="ts">
import { Archive, Mail, MailOpen, RotateCcw } from '@lucide/vue'
import { computed, ref } from 'vue'

import ShowcaseCard from '~/components/home/ShowcaseCard.vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { SwipeAction, SwipeActions, SwipeContent, SwipeItem, SwipeRoot } from '@/ui/swipe-actions'

const commons = 'https://upload.wikimedia.org/wikipedia/commons/thumb'

const initial = [
  {
    id: 1,
    sender: 'Ada Lovelace',
    initials: 'AL',
    avatar: `${commons}/a/a4/Ada_Lovelace_portrait.jpg/120px-Ada_Lovelace_portrait.jpg`,
    subject: 'Notes on the analytical engine',
    time: '9:41',
    unread: true,
  },
  {
    id: 2,
    sender: 'Grace Hopper',
    initials: 'GH',
    avatar: `${commons}/5/55/Grace_Hopper.jpg/120px-Grace_Hopper.jpg`,
    subject: 'Found the bug, literally',
    time: '8:15',
    unread: true,
  },
  {
    id: 3,
    sender: 'Marie Curie',
    initials: 'MC',
    avatar: `${commons}/7/7e/Marie_Curie_c1920.jpg/120px-Marie_Curie_c1920.jpg`,
    subject: 'Lab results are in',
    time: 'Tue',
    unread: false,
  },
  {
    id: 4,
    sender: 'Alan Turing',
    initials: 'AT',
    avatar: undefined,
    subject: 'Lunch on Friday?',
    time: 'Mon',
    unread: false,
  },
]

const messages = ref(initial.map((message) => ({ ...message })))
const unread = computed(() => messages.value.filter((message) => message.unread).length)

const archive = (id: number) => {
  messages.value = messages.value.filter((message) => message.id !== id)
}

const restore = () => {
  messages.value = initial.map((message) => ({ ...message }))
}
</script>

<template>
  <ShowcaseCard class="pb-0">
    <CardHeader>
      <div class="flex items-center gap-2">
        <CardTitle>Inbox</CardTitle>
        <Badge v-if="unread" variant="soft" size="sm">{{ unread }} new</Badge>
      </div>
      <CardDescription>Swipe a message left to archive it, right to mark it read.</CardDescription>
    </CardHeader>
    <div class="overflow-clip rounded-b-lg border-t border-border">
      <SwipeRoot v-if="messages.length" as="ul" aria-label="Messages" class="divide-y divide-border">
        <SwipeItem v-for="message in messages" :key="message.id" as="li">
          <SwipeActions side="start" full-swipe>
            <SwipeAction color="primary" @click="message.unread = !message.unread">
              <MailOpen v-if="message.unread" />
              <Mail v-else />
              {{ message.unread ? 'Mark read' : 'Mark unread' }}
            </SwipeAction>
          </SwipeActions>
          <SwipeActions side="end" full-swipe>
            <SwipeAction color="info" @click="archive(message.id)">
              <Archive />
              Archive
            </SwipeAction>
          </SwipeActions>
          <SwipeContent class="bg-card">
            <button
              type="button"
              class="relative flex w-full items-center gap-3 px-(--card-spacing) py-3 text-start outline-none state-layer focus-visible:focus-ring-inset"
              @click="message.unread = false"
            >
              <Avatar aria-hidden="true">
                <AvatarImage v-if="message.avatar" :src="message.avatar" alt="" />
                <AvatarFallback :delay-ms="message.avatar ? 600 : undefined">{{ message.initials }}</AvatarFallback>
              </Avatar>
              <span class="flex min-w-0 flex-1 flex-col">
                <span class="flex items-baseline gap-2">
                  <span class="truncate text-label-lg">{{ message.sender }}</span>
                  <span class="ms-auto shrink-0 text-label-sm text-muted-foreground tabular-nums">
                    {{ message.time }}
                  </span>
                </span>
                <span class="flex items-center gap-2">
                  <span
                    class="truncate text-body-sm"
                    :class="message.unread ? 'text-foreground' : 'text-muted-foreground'"
                  >
                    {{ message.subject }}
                  </span>
                  <span v-if="message.unread" class="ms-auto size-2 shrink-0 rounded-full bg-primary">
                    <span class="sr-only">Unread</span>
                  </span>
                </span>
              </span>
            </button>
          </SwipeContent>
        </SwipeItem>
      </SwipeRoot>
      <div v-else class="flex flex-col items-center gap-2 px-(--card-spacing) py-6 text-center">
        <p class="text-body-sm text-muted-foreground">You're all caught up.</p>
        <Button variant="ghost" color="neutral" size="sm" @click="restore">
          <RotateCcw data-icon="inline-start" />
          Restore all
        </Button>
      </div>
    </div>
  </ShowcaseCard>
</template>
