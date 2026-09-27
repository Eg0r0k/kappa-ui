<script setup lang="ts">
import { Check, Copy } from '@lucide/vue'
import { ref } from 'vue'

import { previewGroup } from '~/lib/theme-preview'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/ui/input-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import { Separator } from '@/ui/separator'
import { useToast } from '@/ui/toast'

const link = 'https://kappa-ui.pages.dev/d/q4-roadmap'

const people = ref([
  {
    initials: 'AL',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    avatar: 'bg-primary/15 text-primary',
    access: 'edit',
  },
  {
    initials: 'GH',
    name: 'Grace Hopper',
    email: 'grace@example.com',
    avatar: 'bg-success/15 text-success-text',
    access: 'view',
  },
])

const toast = useToast()
const copied = ref(false)

const copyLink = () => {
  navigator.clipboard?.writeText(link).catch(() => {})
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
  toast.add({ group: previewGroup, color: 'success', title: 'Link copied' })
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Share</CardTitle>
      <CardDescription>Anyone with the link can view.</CardDescription>
    </CardHeader>
    <CardContent class="flex flex-col gap-4">
      <InputGroup>
        <InputGroupInput :default-value="link" readonly aria-label="Link" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" :aria-label="copied ? 'Copied' : 'Copy link'" @click="copyLink">
            <Check v-if="copied" />
            <Copy v-else />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <Separator />
      <p class="text-label-lg">People with access</p>
      <div v-for="person in people" :key="person.email" class="flex items-center gap-3">
        <span :class="['flex size-8 shrink-0 items-center justify-center rounded-full text-label-sm', person.avatar]">
          {{ person.initials }}
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-label-lg">{{ person.name }}</p>
          <p class="truncate text-body-sm text-muted-foreground">{{ person.email }}</p>
        </div>
        <Select v-model="person.access">
          <SelectTrigger size="sm" class="w-28" :aria-label="`Access for ${person.name}`">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="edit">Can edit</SelectItem>
            <SelectItem value="view">Can view</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardContent>
  </Card>
</template>
