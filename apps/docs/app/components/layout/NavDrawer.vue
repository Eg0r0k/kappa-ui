<script setup lang="ts">
import { Drawer, DrawerContent, DrawerTitle } from '@/ui/drawer'
import DocsSidebar from '~/components/layout/DocsSidebar.vue'
import MainNav from '~/components/layout/MainNav.vue'
import type { PageOutline } from '~/lib/outline'

const props = defineProps<{ outline?: PageOutline }>()
const { drawer } = useDocsShell()
const route = useRoute()

watch(
  () => route.fullPath,
  () => {
    drawer.value = false
  },
)
</script>

<template>
  <Drawer v-model:open="drawer" side="left">
    <DrawerContent :aria-describedby="undefined" class="flex w-80 flex-col gap-0 p-0">
      <div class="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <DrawerTitle class="font-semibold">kappa</DrawerTitle>
        <MainNav class="ms-auto" @navigate="drawer = false" />
      </div>
      <DocsSidebar class="min-h-0 flex-1" :outline="props.outline" @navigate="drawer = false" />
    </DrawerContent>
  </Drawer>
</template>
