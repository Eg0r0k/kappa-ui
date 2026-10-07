<script setup lang="ts">
import { Search } from '@lucide/vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'

import { InputGroup, InputGroupAddon, InputGroupInput } from '@/ui/input-group'
import { Kbd } from '@/ui/kbd'

const props = defineProps<{ activeDescendant?: string; controls?: string }>()
const model = defineModel<string>({ default: '' })
const emit = defineEmits<{ submit: []; move: [delta: 1 | -1]; focus: []; blur: [] }>()
const root = ref<HTMLElement>()

const editable = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

const onKeydown = (event: KeyboardEvent) => {
  if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey || editable(event.target)) return
  const input = root.value?.querySelector('input')
  if (!input || input.getClientRects().length === 0 || getComputedStyle(input).visibility !== 'visible') return
  event.preventDefault()
  input.focus()
}

const onInputKeydown = (event: KeyboardEvent) => {
  if (event.isComposing) return
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    emit('move', event.key === 'ArrowDown' ? 1 : -1)
    return
  }
  if (event.key === 'Enter') {
    event.preventDefault()
    emit('submit')
    return
  }
  if (event.key === 'Escape' && model.value) model.value = ''
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
        :aria-activedescendant="props.activeDescendant"
        :aria-controls="props.controls"
        @keydown="onInputKeydown"
        @focus="emit('focus')"
        @blur="emit('blur')"
      />
      <InputGroupAddon align="inline-end">
        <Kbd aria-hidden="true">/</Kbd>
      </InputGroupAddon>
    </InputGroup>
  </div>
</template>
