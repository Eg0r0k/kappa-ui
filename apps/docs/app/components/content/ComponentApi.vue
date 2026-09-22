<script setup lang="ts">
import api from '~/generated/api.json'
import type { ApiRow, ComponentApi } from '~~/scripts/lib/api-meta'

type Section = 'props' | 'emits' | 'slots' | 'exposed'

const props = defineProps<{ name: string; section: Section }>()

const fail = (message: string): never => {
  throw createError({ statusCode: 500, statusMessage: message, fatal: true })
}

const component =
  (api as Record<string, ComponentApi>)[props.name] ??
  fail(`No API data for "${props.name}". Add a file to apps/docs/api and run pnpm api:build.`)
const rows: ApiRow[] = component[props.section]
if (rows.length === 0) fail(`${props.name} has no ${props.section}; remove this ::component-api block.`)

const headers: Record<Section, [string, string]> = {
  props: ['Prop', 'Type'],
  emits: ['Event', 'Payload'],
  slots: ['Slot', 'Scope'],
  exposed: ['Member', 'Type'],
}

const flat = rows.flatMap((row) => [
  { ...row, label: row.name, nested: false },
  ...(row.fields ?? []).map((field) => ({ ...field, label: `${row.name}.${field.name}`, nested: true })),
])
</script>

<template>
  <div class="not-prose my-6 overflow-x-auto rounded-lg border">
    <table class="w-full text-left text-sm">
      <thead class="border-b bg-muted/40 text-xs text-muted-foreground">
        <tr>
          <th class="px-4 py-2 font-medium">{{ headers[section][0] }}</th>
          <th class="px-4 py-2 font-medium">{{ headers[section][1] }}</th>
          <th v-if="section === 'props'" class="px-4 py-2 font-medium">Default</th>
          <th class="px-4 py-2 font-medium">Description</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in flat" :key="row.label" class="border-b align-top last:border-0">
          <td class="px-4 py-3 font-mono text-xs whitespace-nowrap" :class="row.nested && 'ps-8 text-muted-foreground'">
            {{ row.label }}<span v-if="row.required" class="text-destructive" aria-label="required">*</span>
          </td>
          <td class="px-4 py-3"><code class="font-mono text-xs break-words">{{ row.type }}</code></td>
          <td v-if="section === 'props'" class="px-4 py-3">
            <code v-if="row.default" class="font-mono text-xs">{{ row.default }}</code>
            <span v-else class="text-muted-foreground">—</span>
          </td>
          <td class="px-4 py-3 text-muted-foreground">{{ row.description }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
