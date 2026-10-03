<script setup lang="ts">
import { Bold, ChevronDown, Italic, Underline } from '@lucide/vue'
import { ref } from 'vue'

import { previewGroup } from '~/lib/theme-preview'
import { Button } from '@/ui/button'
import { ButtonGroup, ButtonGroupSeparator } from '@/ui/button-group'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card'
import { Kbd } from '@/ui/kbd'
import { Menu, MenuItem } from '@/ui/menu'
import { Textarea } from '@/ui/textarea'
import { useToast } from '@/ui/toast'

const formatting = [
  { key: 'bold', label: 'Bold', icon: Bold },
  { key: 'italic', label: 'Italic', icon: Italic },
  { key: 'underline', label: 'Underline', icon: Underline },
]

const formats = ref<string[]>([])
const toggle = (format: string) =>
  (formats.value = formats.value.includes(format)
    ? formats.value.filter((entry) => entry !== format)
    : [...formats.value, format])

const toast = useToast()

const send = () =>
  toast.promise(new Promise<void>((resolve) => setTimeout(resolve, 1500)), {
    loading: { group: previewGroup, title: 'Sending…' },
    success: () => ({ title: 'Reply sent', description: 'Grace will see it in the thread.' }),
    error: () => ({ title: 'Could not send' }),
  })
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Reply to Grace</CardTitle>
      <CardDescription>Re: Q4 roadmap review</CardDescription>
    </CardHeader>
    <CardContent class="flex flex-col gap-3">
      <ButtonGroup aria-label="Formatting">
        <Button
          v-for="format in formatting"
          :key="format.key"
          variant="outline"
          color="neutral"
          size="icon-sm"
          :aria-label="format.label"
          :aria-pressed="formats.includes(format.key)"
          class="aria-pressed:bg-accent aria-pressed:text-accent-foreground"
          @click="toggle(format.key)"
        >
          <component :is="format.icon" />
        </Button>
      </ButtonGroup>
      <Textarea
        autoresize
        placeholder="Write a reply…"
        aria-label="Reply"
        :class="{
          'font-semibold': formats.includes('bold'),
          italic: formats.includes('italic'),
          underline: formats.includes('underline'),
        }"
      />
    </CardContent>
    <CardFooter class="justify-between gap-2">
      <p class="text-body-sm text-muted-foreground"><Kbd>⌘</Kbd> <Kbd>Enter</Kbd> to send</p>
      <ButtonGroup aria-label="Send">
        <Button @click="send">Send</Button>
        <ButtonGroupSeparator />
        <Button size="icon" aria-label="More send options">
          <ChevronDown />
          <Menu anchor="bottom end" self="top end">
            <MenuItem @select="send">Send now</MenuItem>
            <MenuItem>Schedule for tomorrow</MenuItem>
            <MenuItem>Send without notifying</MenuItem>
          </Menu>
        </Button>
      </ButtonGroup>
    </CardFooter>
  </Card>
</template>
