<script setup lang="ts">
import { Braces, FileCode, FolderOpen, Package, Paintbrush } from '@lucide/vue'
import type { Component } from 'vue'

import { Badge } from '@/ui/badge'
import BreakAtSpaces from '~/components/BreakAtSpaces.vue'
import DocsFigure from '~/components/DocsFigure.vue'

type Row = {
  icon: Component
  name: string
  file: boolean
  before: string
  code: string
  after: string
  by: ('init' | 'add')[]
}

const rows: Row[] = [
  {
    icon: Braces,
    name: 'components.json',
    file: true,
    before: 'The ',
    code: '@kappa-ui',
    after: ' registry',
    by: ['init'],
  },
  {
    icon: FileCode,
    name: 'lib/utils.ts',
    file: true,
    before: '',
    code: 'cn()',
    after: ', which knows the typescale',
    by: ['init'],
  },
  {
    icon: Paintbrush,
    name: 'Your stylesheet',
    file: false,
    before: 'Tokens, the theme and ',
    code: '@import "@kappa-ui/core/tailwind.css"',
    after: '',
    by: ['init'],
  },
  {
    icon: Package,
    name: 'package.json',
    file: true,
    before: '',
    code: '@kappa-ui/core',
    after: ' and the dependencies of each component',
    by: ['init', 'add'],
  },
  {
    icon: FolderOpen,
    name: 'components/ui/button/',
    file: true,
    before: '',
    code: 'Button.vue',
    after: ' and the index.ts that exports it',
    by: ['add'],
  },
]
</script>

<template>
  <DocsFigure title="What lands in your project" class="divide-y">
    <div
      v-for="row in rows"
      :key="row.name"
      class="grid grid-cols-[auto_1fr_auto] items-start gap-x-3 gap-y-1 px-4 py-3 sm:grid-cols-[auto_13rem_1fr_auto]"
    >
      <component :is="row.icon" class="mt-0.5 size-4 text-muted-foreground" />
      <span :class="row.file ? 'font-mono text-sm' : 'text-label-lg'">{{ row.name }}</span>
      <span class="col-start-2 row-start-2 text-body-sm text-muted-foreground sm:col-start-3 sm:row-start-1">
        {{ row.before
        }}<code class="rounded bg-muted px-1 font-mono text-xs text-foreground"><BreakAtSpaces :text="row.code" /></code
        >{{ row.after }}
      </span>
      <span class="col-start-3 row-start-1 flex gap-1 sm:col-start-4">
        <Badge
          v-for="command in row.by"
          :key="command"
          variant="soft"
          :color="command === 'init' ? 'neutral' : 'primary'"
          class="font-mono"
        >
          {{ command }}
        </Badge>
      </span>
    </div>
  </DocsFigure>
</template>
