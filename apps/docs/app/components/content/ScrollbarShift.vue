<script setup lang="ts">
import { ArrowRight, Check, X } from '@lucide/vue'

import DocsFigure from '~/components/DocsFigure.vue'

const cases = [
  { key: 'without', title: 'Without the setup', note: 'The page jumps left by the scrollbar’s width.', padded: true },
  { key: 'with', title: 'With :scroll-body="false"', note: 'Nothing moves.', padded: false },
]
const frames = [
  { key: 'closed', label: 'Menu closed', open: false },
  { key: 'open', label: 'Menu open', open: true },
]
const hatch = 'bg-[repeating-linear-gradient(-45deg,var(--color-destructive)_0_1px,transparent_1px_4px)] opacity-60'
</script>

<template>
  <DocsFigure title="What the scrollbar does to the page" class="divide-y">
    <div v-for="item in cases" :key="item.key" class="flex flex-col gap-3 p-5 sm:p-6">
      <div class="flex items-center gap-2 text-label-md">
        <X v-if="item.padded" class="size-4 text-destructive" />
        <Check v-else class="size-4 text-success-text" />
        <span :class="item.padded ? '' : 'font-mono text-xs'">{{ item.title }}</span>
      </div>
      <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
        <template v-for="(frame, index) in frames" :key="frame.key">
          <ArrowRight v-if="index > 0" class="size-4 text-muted-foreground" />
          <div class="flex flex-col gap-1.5">
            <span class="text-body-sm text-muted-foreground">{{ frame.label }}</span>
            <div class="flex h-36 overflow-hidden rounded-lg border bg-background" aria-hidden="true">
              <div class="relative flex min-w-0 flex-1 flex-col">
                <div class="flex h-7 shrink-0 items-center gap-1.5 border-b bg-card px-2.5">
                  <span class="size-2.5 rounded-full bg-primary" />
                  <span class="h-1.5 w-8 rounded-full bg-foreground/20" />
                  <span class="ms-auto size-3.5 rounded-full bg-foreground/30" />
                </div>
                <div class="flex min-h-0 flex-1">
                  <div class="flex min-w-0 flex-1 flex-col gap-2 p-2.5">
                    <span class="h-1.5 w-2/3 rounded-full bg-foreground/15" />
                    <span class="h-1.5 w-full rounded-full bg-foreground/15" />
                    <span class="h-1.5 w-5/6 rounded-full bg-foreground/15" />
                    <span class="relative mt-1 h-4 w-10 self-end rounded-sm bg-primary/70">
                      <span
                        v-if="item.padded && frame.open"
                        class="absolute inset-0 translate-x-4 rounded-sm outline-1 outline-destructive outline-dashed"
                      />
                    </span>
                    <span class="h-1.5 w-full rounded-full bg-foreground/15" />
                  </div>
                  <div v-if="item.padded && frame.open" :class="['w-4 shrink-0', hatch]" />
                </div>
                <span class="absolute inset-y-0 end-2.5 border-e border-dashed border-primary/60" />
                <div
                  v-if="frame.open"
                  class="absolute start-2 top-8 flex w-20 flex-col gap-1 rounded-md bg-popover p-1 shadow-shadow-md"
                >
                  <span class="h-3.5 rounded-sm bg-accent" />
                  <span class="mx-1 my-0.5 h-1.5 w-2/3 rounded-full bg-foreground/20" />
                  <span class="mx-1 mb-0.5 h-1.5 w-1/2 rounded-full bg-foreground/20" />
                </div>
              </div>
              <div class="flex w-4 shrink-0 justify-center border-s bg-muted/60 py-1">
                <span v-if="!frame.open" class="h-10 w-2 rounded-full bg-foreground/30" />
              </div>
            </div>
          </div>
        </template>
      </div>
      <p class="text-body-sm text-muted-foreground">{{ item.note }}</p>
    </div>
    <ul class="flex flex-wrap gap-x-5 gap-y-1.5 px-5 py-3 text-body-sm text-muted-foreground sm:px-6">
      <li class="flex items-center gap-1.5">
        <span class="h-3.5 w-0 border-e border-dashed border-primary/60" />
        The content’s edge with the menu closed
      </li>
      <li class="flex items-center gap-1.5">
        <span class="h-3.5 w-2 rounded-full bg-foreground/30" />
        The scrollbar, hidden while the menu is open
      </li>
      <li class="flex items-center gap-1.5">
        <span class="h-2.5 w-4 rounded-xs outline-1 outline-destructive outline-dashed" />
        Where the button was
      </li>
      <li class="flex items-center gap-1.5">
        <span :class="['size-3.5', hatch]" />
        Padding the overlay adds to &lt;body&gt;
      </li>
    </ul>
  </DocsFigure>
</template>
