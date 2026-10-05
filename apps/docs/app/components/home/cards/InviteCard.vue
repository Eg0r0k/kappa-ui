<script setup lang="ts">
import { Send } from '@lucide/vue'
import { computed, ref } from 'vue'

import ShowcaseCard from '~/components/home/ShowcaseCard.vue'
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from '@/ui/avatar'
import { Button } from '@/ui/button'
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import { TagsInput, TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText } from '@/ui/tags-input'

const commons = 'https://upload.wikimedia.org/wikipedia/commons/thumb'
const members = [
  {
    name: 'Ada Lovelace',
    initials: 'AL',
    src: `${commons}/a/a4/Ada_Lovelace_portrait.jpg/120px-Ada_Lovelace_portrait.jpg`,
  },
  { name: 'Grace Hopper', initials: 'GH', src: `${commons}/5/55/Grace_Hopper.jpg/120px-Grace_Hopper.jpg` },
  { name: 'Marie Curie', initials: 'MC', src: `${commons}/7/7e/Marie_Curie_c1920.jpg/120px-Marie_Curie_c1920.jpg` },
]
const roles = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Admin' },
]

const emails = ref(['alan@kappa.dev', 'mae@kappa.dev'])
const role = ref('editor')
const others = ref(3)
const sent = ref(0)

const hint = computed(() => {
  if (sent.value === 1) return 'Invite sent.'
  if (sent.value > 1) return `${sent.value} invites sent.`
  return 'Separate addresses with a comma.'
})

const send = () => {
  sent.value = emails.value.length
  others.value += emails.value.length
  emails.value = []
}
</script>

<template>
  <ShowcaseCard>
    <CardHeader>
      <CardTitle>Invite your team</CardTitle>
      <CardDescription>New members get access to every project.</CardDescription>
    </CardHeader>
    <CardContent class="flex flex-col gap-4">
      <Field>
        <FieldLabel>Email addresses</FieldLabel>
        <TagsInput v-model="emails" :delimiter="/[,;\s]/" add-on-paste add-on-blur @add-tag="sent = 0">
          <TagsInputItem v-for="email in emails" :key="email" :value="email">
            <TagsInputItemText />
            <TagsInputItemDelete />
          </TagsInputItem>
          <TagsInputInput placeholder="name@company.com" />
        </TagsInput>
        <FieldDescription>{{ hint }}</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Role</FieldLabel>
        <Select v-model="role">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in roles" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </CardContent>
    <CardFooter class="justify-between">
      <AvatarGroup
        role="img"
        :aria-label="`${members.length + others} members`"
        class="[--avatar-ring:--theme(--color-card)]"
      >
        <Avatar v-for="member in members" :key="member.name" size="sm">
          <AvatarImage :src="member.src" :alt="member.name" />
          <AvatarFallback :delay-ms="600">{{ member.initials }}</AvatarFallback>
        </Avatar>
        <AvatarGroupCount size="sm">+{{ others }}</AvatarGroupCount>
      </AvatarGroup>
      <Button :disabled="!emails.length" @click="send">
        <Send data-icon="inline-start" />
        Send invites
      </Button>
    </CardFooter>
  </ShowcaseCard>
</template>
