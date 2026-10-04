<script setup lang="ts">
import { Search } from '@lucide/vue'

import { Button } from '@/ui/button'
import { Kbd } from '@/ui/kbd'
import { modKey } from '~/lib/sidebar'

const { show } = useSearchDialog()
const mod = ref('⌘')
onMounted(() => {
  mod.value = modKey(navigator.platform)
})
</script>

<template>
  <Button
    variant="outline"
    color="neutral"
    size="sm"
    aria-keyshortcuts="Meta+K Control+K"
    class="hidden w-56 justify-start text-muted-foreground md:inline-flex"
    @click="show()"
  >
    <Search data-icon="inline-start" />
    Search…
    <Kbd class="ms-auto" aria-hidden="true">{{ mod }} K</Kbd>
  </Button>
  <Button
    variant="ghost"
    color="neutral"
    size="icon"
    aria-label="Search"
    aria-keyshortcuts="Meta+K Control+K"
    class="md:hidden"
    @click="show()"
  >
    <Search />
  </Button>
</template>
