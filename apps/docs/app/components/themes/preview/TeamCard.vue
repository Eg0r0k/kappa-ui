<script setup lang="ts">
import { Ellipsis } from '@lucide/vue'
import { ref } from 'vue'

import MemberMenu from '~/components/themes/preview/MemberMenu.vue'
import { previewGroup } from '~/lib/theme-preview'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/ui/dialog'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/ui/item'
import { useToast } from '@/ui/toast'

const roles = ['Owner', 'Editor', 'Viewer'] as const
const roleColor = { Owner: 'primary', Editor: 'success', Viewer: 'neutral' } as const

interface Member {
  initials: string
  name: string
  email: string
  role: (typeof roles)[number]
  avatar: string
}

const team = ref<Member[]>([
  { initials: 'AL', name: 'Ada Lovelace', email: 'ada@example.com', role: 'Owner', avatar: 'bg-primary/15 text-primary' },
  { initials: 'GH', name: 'Grace Hopper', email: 'grace@example.com', role: 'Editor', avatar: 'bg-success/15 text-success-text' },
  { initials: 'AT', name: 'Alan Turing', email: 'alan@example.com', role: 'Viewer', avatar: 'bg-warning/15 text-warning-text' },
  { initials: 'KJ', name: 'Katherine Johnson', email: 'katherine@example.com', role: 'Viewer', avatar: 'bg-muted text-muted-foreground' },
])

const toast = useToast()

const leaving = ref<Member>()
const confirmRemove = ref(false)

const askRemove = (member: Member) => {
  leaving.value = member
  confirmRemove.value = true
}

const remove = () => {
  const member = leaving.value
  if (!member) return
  const index = team.value.indexOf(member)
  team.value.splice(index, 1)
  toast.add({
    group: previewGroup,
    title: `${member.name} removed`,
    description: 'They no longer see this project.',
    actions: [{ label: 'Undo', onClick: () => team.value.splice(index, 0, member) }],
  })
}

const message = (member: Member) =>
  toast.add({ group: previewGroup, color: 'primary', title: `Message sent to ${member.name.split(' ')[0]}` })
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Team</CardTitle>
      <CardDescription>Right-click a person, or use the menu button.</CardDescription>
    </CardHeader>
    <CardContent class="px-2">
      <ItemGroup v-if="team.length" class="gap-0.5">
        <Item v-for="member in team" :key="member.email" size="sm" class="hover:bg-muted/60">
          <ItemMedia>
            <span :class="['flex size-9 items-center justify-center rounded-full text-label-md', member.avatar]">
              {{ member.initials }}
            </span>
          </ItemMedia>
          <ItemContent class="min-w-0">
            <ItemTitle class="w-full truncate">{{ member.name }}</ItemTitle>
            <ItemDescription class="truncate">{{ member.email }}</ItemDescription>
          </ItemContent>
          <ItemActions class="gap-1">
            <Badge variant="soft" :color="roleColor[member.role]">{{ member.role }}</Badge>
            <Button variant="ghost" color="neutral" size="icon-sm" :aria-label="`Actions for ${member.name}`">
              <Ellipsis />
              <MemberMenu
                v-model:role="member.role"
                :name="member.name"
                :roles="roles"
                @message="message(member)"
                @remove="askRemove(member)"
              />
            </Button>
          </ItemActions>
          <MemberMenu
            v-model:role="member.role"
            context-menu
            :name="member.name"
            :roles="roles"
            @message="message(member)"
            @remove="askRemove(member)"
          />
        </Item>
      </ItemGroup>
      <p v-else class="px-4 py-3 text-body-md text-muted-foreground">Nobody else has access.</p>

      <Dialog v-model:open="confirmRemove">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {{ leaving?.name }}?</DialogTitle>
            <DialogDescription>They lose access to this project at once. You can invite them again later.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose as-child>
              <Button variant="outline" color="neutral">Cancel</Button>
            </DialogClose>
            <DialogClose as-child>
              <Button color="destructive" @click="remove">Remove</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardContent>
  </Card>
</template>
