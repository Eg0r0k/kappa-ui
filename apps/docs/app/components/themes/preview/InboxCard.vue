<script setup lang="ts">
import { CircleCheck, Download, FileText, HardDrive, Mail, MessageSquare, Search, UserPlus } from '@lucide/vue'
import { computed, ref } from 'vue'

import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/ui/input-group'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/ui/item'
import { Kbd } from '@/ui/kbd'
import { ScrollArea } from '@/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/ui/tabs'

const inbox = [
  { id: 1, icon: MessageSquare, title: 'Grace commented on Roadmap', time: '2m' },
  { id: 2, icon: FileText, title: 'Alan shared Budget.xlsx', time: '1h' },
  { id: 3, icon: Download, title: 'Your export is ready', time: '3h' },
  { id: 4, icon: UserPlus, title: 'Ada invited you to Design', time: 'Yesterday' },
  { id: 5, icon: CircleCheck, title: 'Build 482 passed', time: 'Yesterday' },
  { id: 6, icon: HardDrive, title: 'Storage is 92% full', time: 'Mon' },
  { id: 7, icon: Mail, title: 'Weekly summary is ready', time: 'Mon' },
  { id: 8, icon: MessageSquare, title: 'Alan resolved 3 comments', time: 'Sun' },
]
const unread = ref(new Set([1, 2, 3, 6]))
const tab = ref('all')
const query = ref('')

const items = computed(() =>
  inbox.filter(
    (entry) =>
      (tab.value === 'all' || unread.value.has(entry.id)) &&
      entry.title.toLowerCase().includes(query.value.trim().toLowerCase()),
  ),
)
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between gap-2">
        <CardTitle>Inbox</CardTitle>
        <Button variant="ghost" size="xs" :disabled="!unread.size" @click="unread = new Set()">Mark all read</Button>
      </div>
    </CardHeader>
    <CardContent class="flex flex-col gap-3 px-0">
      <div class="flex flex-col gap-3 px-(--card-spacing)">
        <Tabs v-model="tab">
          <TabsList size="sm" class="w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              <Badge v-if="unread.size" size="xs" class="tabular-nums">{{ unread.size }}</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <InputGroup size="sm">
          <InputGroupInput v-model="query" placeholder="Search" aria-label="Search the inbox" />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <Kbd>⌘K</Kbd>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <ScrollArea class="scroll-fade-overlay-y h-60 px-2">
        <ItemGroup v-if="items.length" class="gap-0.5">
          <Item
            v-for="entry in items"
            :key="entry.id"
            as="button"
            type="button"
            size="xs"
            class="w-full px-4"
            @click="unread.delete(entry.id)"
          >
            <ItemMedia variant="icon">
              <component :is="entry.icon" />
            </ItemMedia>
            <ItemContent class="min-w-0">
              <ItemTitle :class="['w-full truncate', unread.has(entry.id) ? 'text-foreground' : 'font-normal text-muted-foreground']">
                {{ entry.title }}
              </ItemTitle>
              <ItemDescription>{{ entry.time }}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <span v-if="unread.has(entry.id)" class="size-2 rounded-full bg-primary" aria-label="Unread" />
            </ItemActions>
          </Item>
        </ItemGroup>
        <p v-else class="px-4 py-8 text-center text-body-md text-muted-foreground">Nothing here.</p>
      </ScrollArea>
    </CardContent>
  </Card>
</template>
