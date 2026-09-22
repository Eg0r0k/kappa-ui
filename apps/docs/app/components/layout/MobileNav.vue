<script setup lang="ts">
import { Menu, X } from '@lucide/vue'
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from 'reka-ui'
import { ref } from 'vue'

import { Button } from '@/ui/button'
import DocsSidebar from '~/components/layout/DocsSidebar.vue'

const open = ref(false)
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger as-child>
      <Button variant="ghost" size="icon" class="md:hidden" aria-label="Open navigation">
        <Menu />
      </Button>
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent
        :aria-describedby="undefined"
        class="fixed inset-y-0 start-0 z-50 flex w-72 flex-col border-e bg-background text-foreground"
      >
        <div class="flex h-14 items-center justify-between border-b px-4">
          <DialogTitle class="font-semibold">delta-ui</DialogTitle>
          <DialogClose as-child>
            <Button variant="ghost" size="icon" aria-label="Close navigation">
              <X />
            </Button>
          </DialogClose>
        </div>
        <div class="min-h-0 flex-1">
          <DocsSidebar @navigate="open = false" />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
