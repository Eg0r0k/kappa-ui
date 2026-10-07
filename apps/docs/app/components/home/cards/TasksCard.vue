<script setup lang="ts">
import { Copy, Ellipsis, Pencil, Trash2 } from '@lucide/vue'
import { computed, ref, useId } from 'vue'

import ShowcaseCard from '~/components/home/ShowcaseCard.vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/ui/alert-dialog'
import { Badge, type BadgeColor } from '@/ui/badge'
import { Button } from '@/ui/button'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Checkbox } from '@/ui/checkbox'
import { Input } from '@/ui/input'
import { Menu, MenuItem, MenuSeparator } from '@/ui/menu'
import { vTooltip } from '@/ui/tooltip'

type Priority = 'High' | 'Medium' | 'Low'
type Task = { id: number; title: string; priority: Priority; done: boolean }

const priorityColor: Record<Priority, BadgeColor> = { High: 'destructive', Medium: 'warning', Low: 'info' }

const tasks = ref<Task[]>([
  { id: 1, title: 'Design review', priority: 'High', done: true },
  { id: 2, title: 'Write release notes', priority: 'Medium', done: false },
  { id: 3, title: 'Fix login redirect', priority: 'High', done: true },
  { id: 4, title: 'Update dependencies', priority: 'Low', done: true },
  { id: 5, title: 'Plan the Q4 roadmap', priority: 'Medium', done: false },
])
let nextId = tasks.value.length + 1

const uid = useId()
const elementId = (task: Task, part: string) => `${uid}-${part}-${task.id}`

const done = computed(() => tasks.value.filter((task) => task.done).length)

const renaming = ref<number | null>(null)
const draft = ref('')
const confirming = ref(false)
const target = ref<Task | null>(null)

const startRename = (task: Task) => {
  renaming.value = task.id
  draft.value = task.title
}

const commitRename = (task: Task) => {
  if (renaming.value !== task.id) return
  task.title = draft.value.trim() || task.title
  renaming.value = null
}

const finishRename = (task: Task, save: boolean) => {
  if (save) commitRename(task)
  renaming.value = null
  document.getElementById(elementId(task, 'actions'))?.focus()
}

const duplicate = (task: Task) => {
  const index = tasks.value.findIndex((item) => item.id === task.id)
  tasks.value.splice(index + 1, 0, { ...task, id: nextId++, title: `${task.title} (copy)`, done: false })
}

const askDelete = (task: Task) => {
  target.value = task
  confirming.value = true
}

const remove = () => {
  tasks.value = tasks.value.filter((task) => task.id !== target.value?.id)
}

const onMenuClosed = (event: Event, task: Task) => {
  if (confirming.value) return event.preventDefault()
  if (renaming.value !== task.id) return
  event.preventDefault()
  const input = document.getElementById(elementId(task, 'rename'))
  input?.focus()
  if (input instanceof HTMLInputElement) input.select()
}

const onDialogClosed = (event: Event) => {
  const task = target.value
  if (!task || !tasks.value.some((item) => item.id === task.id)) return
  event.preventDefault()
  document.getElementById(elementId(task, 'actions'))?.focus()
}
</script>

<template>
  <ShowcaseCard>
    <CardHeader>
      <CardTitle>Tasks</CardTitle>
      <CardDescription>{{ done }} of {{ tasks.length }} done</CardDescription>
    </CardHeader>
    <CardContent>
      <ul v-if="tasks.length" class="flex flex-col">
        <li v-for="task in tasks" :key="task.id" class="flex min-h-10 items-center gap-3">
          <Checkbox :id="elementId(task, 'done')" v-model="task.done" :aria-label="task.title" />
          <Input
            v-if="renaming === task.id"
            :id="elementId(task, 'rename')"
            v-model="draft"
            size="xs"
            aria-label="Task name"
            class="min-w-0 flex-1"
            @keydown.enter.prevent="finishRename(task, true)"
            @keydown.esc="finishRename(task, false)"
            @blur="commitRename(task)"
          />
          <label
            v-else
            :for="elementId(task, 'done')"
            class="min-w-0 flex-1 truncate text-body-md transition-colors duration-short-3 ease-standard"
            :class="{ 'text-muted-foreground line-through': task.done }"
          >
            {{ task.title }}
          </label>
          <div class="flex shrink-0 items-center gap-1.5">
            <Badge variant="soft" size="sm" :color="priorityColor[task.priority]">{{ task.priority }}</Badge>
            <Button
              :id="elementId(task, 'actions')"
              v-tooltip.label="'More actions'"
              variant="ghost"
              color="neutral"
              size="icon-xs"
              :aria-label="`Actions for ${task.title}`"
            >
              <Ellipsis />
              <Menu size="sm" anchor="bottom end" self="top end" @close-auto-focus="onMenuClosed($event, task)">
                <MenuItem @select="startRename(task)">
                  <Pencil />
                  Rename
                </MenuItem>
                <MenuItem @select="duplicate(task)">
                  <Copy />
                  Duplicate
                </MenuItem>
                <MenuSeparator />
                <MenuItem variant="destructive" @select="askDelete(task)">
                  <Trash2 />
                  Delete
                </MenuItem>
              </Menu>
            </Button>
          </div>
        </li>
      </ul>
      <p v-else class="py-6 text-center text-body-md text-muted-foreground">All clear. No tasks left.</p>
    </CardContent>

    <AlertDialog v-model:open="confirming">
      <AlertDialogContent size="sm" @close-auto-focus="onDialogClosed">
        <AlertDialogHeader>
          <AlertDialogMedia class="bg-destructive/10 text-destructive">
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete task?</AlertDialogTitle>
          <AlertDialogDescription>“{{ target?.title }}” is removed from your list for good.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction color="destructive" @click="remove">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </ShowcaseCard>
</template>
