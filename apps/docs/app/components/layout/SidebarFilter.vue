<script setup lang="ts">
import { Search } from '@lucide/vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'

import { InputGroup, InputGroupAddon, InputGroupInput } from '@/ui/input-group'
import { Kbd } from '@/ui/kbd'

const model = defineModel<string>({ default: '' })
const root = ref<HTMLElement>()

const editable = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

const onKeydown = (event: KeyboardEvent) => {
  if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey || editable(event.target)) return
  const input = root.value?.querySelector('input')
  if (!input || input.getClientRects().length === 0) return
  event.preventDefault()
  input.focus()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div ref="root" data-slot="sidebar-filter">
    <InputGroup size="sm">
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        v-model="model"
        enterkeyhint="search"
        placeholder="Filter"
        aria-label="Filter the navigation"
        aria-keyshortcuts="/"
      />
      <InputGroupAddon align="inline-end">
        <Kbd aria-hidden="true">/</Kbd>
      </InputGroupAddon>
    </InputGroup>
  </div>
</template>
