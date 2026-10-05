<script setup lang="ts">
import { ArrowRight, FileCode, FolderOpen, Package, Pencil, RefreshCw } from '@lucide/vue'

import { Badge } from '@/ui/badge'
import DocsFigure from '~/components/DocsFigure.vue'

const parts = ['Overlays', 'Toasts', 'Directives', 'Gestures']
</script>

<template>
  <DocsFigure title="Two halves" class="grid gap-3 p-6 sm:grid-cols-[1fr_auto_1fr] sm:p-8">
    <div class="flex flex-col gap-4 rounded-lg border bg-background p-4">
      <div class="flex items-center gap-2">
        <FolderOpen class="size-4 text-muted-foreground" />
        <span class="text-label-lg">Your project</span>
      </div>
      <div class="font-mono text-xs leading-6">
        <div class="text-muted-foreground">components/ui/button/</div>
        <div class="flex items-center gap-1.5 ps-4"><FileCode class="size-3.5 text-muted-foreground" />Button.vue</div>
        <div class="flex items-center gap-1.5 ps-4"><FileCode class="size-3.5 text-muted-foreground" />index.ts</div>
      </div>
      <p class="text-body-sm text-muted-foreground">Components, copied in by the CLI.</p>
      <Badge variant="soft" color="success" class="mt-auto self-start"><Pencil />Yours to edit</Badge>
    </div>
    <div class="flex items-center justify-center gap-2 text-muted-foreground sm:flex-col">
      <ArrowRight class="size-4 max-sm:rotate-90" />
      <span class="font-mono text-xs">imports</span>
    </div>
    <div class="flex flex-col gap-4 rounded-lg border bg-background p-4">
      <div class="flex items-center gap-2">
        <Package class="size-4 text-muted-foreground" />
        <span class="font-mono text-label-lg">@kappa-ui/core</span>
      </div>
      <div class="flex flex-wrap gap-1.5">
        <span v-for="part in parts" :key="part" class="rounded-md bg-muted px-2 py-0.5 text-label-md">{{ part }}</span>
      </div>
      <p class="text-body-sm text-muted-foreground">The behaviour behind them, from npm.</p>
      <Badge variant="soft" color="info" class="mt-auto self-start"><RefreshCw />Updates with npm</Badge>
    </div>
  </DocsFigure>
</template>
