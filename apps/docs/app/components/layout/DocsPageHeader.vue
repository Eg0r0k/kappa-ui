<script setup lang="ts">
import { ChevronDown, Copy, FileText } from '@lucide/vue'

import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { ButtonGroup } from '@/ui/button-group'
import { Menu, MenuItem, MenuTrigger } from '@/ui/menu'
import { useToast } from '@/ui/toast'
import GithubIcon from '~/components/GithubIcon.vue'
import { badgeOf } from '~/lib/badges'
import { rawPath } from '~/lib/raw'
import { findItem } from '~/lib/registry'

const props = defineProps<{ title: string; description?: string; path: string; component?: string; reka?: string }>()

const toast = useToast()
const now = ref<number>()
onMounted(() => {
  now.value = Date.now()
})
const badge = computed(() => badgeOf(props.component, now.value))

const source = computed(() => {
  const file = props.component ? findItem(props.component)?.files[0]?.path : undefined
  if (!file) return undefined
  return `https://github.com/Eg0r0k/kappa-ui/tree/main/packages/registry/${file.slice(0, file.lastIndexOf('/'))}`
})

const copyPage = async () => {
  const markdown = await $fetch<string>(rawPath(props.path), { responseType: 'text' })
  await navigator.clipboard.writeText(markdown)
  toast.add({ title: 'Page copied as Markdown', color: 'success' })
}
</script>

<template>
  <header data-slot="docs-page-header" class="mb-8 flex flex-col gap-3">
    <div class="flex flex-wrap items-center gap-3">
      <h1 class="text-3xl font-semibold tracking-tight">{{ props.title }}</h1>
      <Badge v-if="badge" variant="soft" :color="badge === 'new' ? 'success' : 'info'">{{ badge }}</Badge>
    </div>
    <p v-if="props.description" class="text-lg text-muted-foreground">{{ props.description }}</p>
    <div class="flex flex-wrap items-center gap-2">
      <ButtonGroup>
        <Button variant="outline" color="neutral" size="sm" @click="copyPage">
          <Copy data-icon="inline-start" />
          Copy page
        </Button>
        <MenuTrigger as-child>
          <Button
            id="page-actions-trigger"
            variant="outline"
            color="neutral"
            size="icon-sm"
            aria-label="More page actions"
          >
            <ChevronDown />
          </Button>
        </MenuTrigger>
      </ButtonGroup>
      <Menu target="#page-actions-trigger" anchor="bottom end" self="top end">
        <MenuItem as-child>
          <a :href="rawPath(props.path)" target="_blank" rel="noreferrer">
            <FileText />
            View as Markdown
          </a>
        </MenuItem>
      </Menu>
      <Button v-if="source" variant="ghost" color="neutral" size="sm" as-child>
        <a :href="source" target="_blank" rel="noreferrer">
          <GithubIcon data-icon="inline-start" class="size-4" />
          Source
        </a>
      </Button>
      <Button v-if="props.reka" variant="ghost" color="neutral" size="sm" as-child>
        <a :href="props.reka" target="_blank" rel="noreferrer">Reka UI</a>
      </Button>
    </div>
  </header>
</template>
