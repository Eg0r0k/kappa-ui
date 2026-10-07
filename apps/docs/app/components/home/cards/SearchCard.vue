<script setup lang="ts">
import { Calculator, Calendar, CreditCard, Settings, Smile, User } from '@lucide/vue'
import { ref } from 'vue'

import ShowcaseCard from '~/components/home/ShowcaseCard.vue'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandLabel,
  CommandList,
  CommandSeparator,
} from '@/ui/command'
import { Kbd, KbdGroup } from '@/ui/kbd'

const suggestions = [
  { value: 'calendar', label: 'Calendar', icon: Calendar },
  { value: 'emoji', label: 'Search emoji', icon: Smile },
  { value: 'calculator', label: 'Calculator', icon: Calculator },
]
const settings = [
  { value: 'profile', label: 'Profile', icon: User, key: 'P' },
  { value: 'billing', label: 'Billing', icon: CreditCard, key: 'B' },
  { value: 'settings', label: 'Settings', icon: Settings, key: 'S' },
]

const opened = ref('')

const onSearch = (value: string) => {
  if (value) opened.value = ''
}
</script>

<template>
  <ShowcaseCard class="gap-0 py-0">
    <Command class="rounded-none bg-transparent">
      <CommandInput placeholder="Search or jump to…" aria-label="Search" @update:model-value="onSearch" />
      <CommandList class="h-55 max-h-none">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          <CommandLabel>Suggestions</CommandLabel>
          <CommandItem v-for="item in suggestions" :key="item.value" :value="item.value" @select="opened = item.label">
            <component :is="item.icon" />
            {{ item.label }}
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup>
          <CommandLabel>Settings</CommandLabel>
          <CommandItem v-for="item in settings" :key="item.value" :value="item.value" @select="opened = item.label">
            <component :is="item.icon" />
            {{ item.label }}
            <KbdGroup class="ms-auto">
              <Kbd>⌘</Kbd>
              <Kbd>{{ item.key }}</Kbd>
            </KbdGroup>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
    <div
      class="flex h-10 items-center justify-between gap-3 border-t border-border px-4 text-body-sm text-muted-foreground"
    >
      <span aria-live="polite" class="min-w-0 truncate">
        <template v-if="opened">Opened {{ opened }}</template>
        <span v-else class="flex items-center gap-1.5">
          <KbdGroup>
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
          </KbdGroup>
          Navigate
        </span>
      </span>
      <span class="flex shrink-0 items-center gap-1.5">
        <Kbd>↵</Kbd>
        Open
      </span>
    </div>
  </ShowcaseCard>
</template>
