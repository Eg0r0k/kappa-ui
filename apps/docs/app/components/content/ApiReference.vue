<script setup lang="ts">
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/ui/accordion'
import ScrollBox from '~/components/ScrollBox.vue'
import InlineText from '~/components/content/InlineText.vue'
import api from '~/generated/api.json'
import type { ApiRow, ComponentApi } from '~~/scripts/lib/api-meta'

type Section = 'props' | 'emits' | 'slots' | 'exposed'

const props = defineProps<{ parts: string }>()

const fail = (message: string): never => {
  throw createError({ statusCode: 500, statusMessage: message, fatal: true })
}

const sections: { key: Section; title: string; label: string; detail: string }[] = [
  { key: 'props', title: 'Props', label: 'Prop', detail: 'Type and description' },
  { key: 'emits', title: 'Emits', label: 'Event', detail: 'Payload and description' },
  { key: 'slots', title: 'Slots', label: 'Slot', detail: 'Scope and description' },
  { key: 'exposed', title: 'Exposed', label: 'Member', detail: 'Type and description' },
]

const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

const flat = (rows: ApiRow[]) =>
  rows.flatMap((row) => [
    { ...row, label: row.name, nested: false },
    ...(row.fields ?? []).map((field) => ({ ...field, label: `${row.name}.${field.name}`, nested: true })),
  ])

const parts = props.parts
  .split(',')
  .map((name) => name.trim())
  .filter(Boolean)
  .map((name) => {
    const part =
      (api as Record<string, ComponentApi>)[name] ??
      fail(`No API data for "${name}". Add a file to apps/docs/api and run pnpm api:build.`)
    return {
      name,
      id: `api-${kebab(name)}`,
      paragraphs: part.description?.split(/\n{2,}/) ?? [],
      sections: sections
        .filter((section) => part[section.key].length > 0)
        .map((section) => ({ ...section, rows: flat(part[section.key]) })),
    }
  })
</script>

<template>
  <div data-slot="api-reference" class="not-prose my-6">
    <div class="hidden flex-col gap-10 md:flex">
      <section v-for="part in parts" :key="part.name" :aria-labelledby="part.id" class="flex flex-col gap-3">
        <h3 :id="part.id" class="scroll-mt-20 font-mono text-title-md">{{ part.name }}</h3>
        <p v-for="(paragraph, index) in part.paragraphs" :key="index" class="text-body-md text-muted-foreground">
          <InlineText :text="paragraph" />
        </p>
        <p v-if="part.sections.length === 0" class="text-body-md text-muted-foreground">
          No props, events, slots or exposed members.
        </p>
        <div v-for="section in part.sections" :key="section.key" class="overflow-hidden rounded-lg border">
          <ScrollBox>
            <table class="w-full text-left text-sm">
              <thead class="border-b bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th class="px-4 py-2 font-medium">{{ section.label }}</th>
                  <th v-if="section.key === 'props'" class="px-4 py-2 font-medium">Default</th>
                  <th class="px-4 py-2 font-medium">{{ section.detail }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in section.rows" :key="row.label" class="border-b align-top last:border-0">
                  <td
                    class="px-4 py-3 font-mono text-xs whitespace-nowrap"
                    :class="row.nested && 'ps-8 text-muted-foreground'"
                  >
                    {{ row.label }}<span v-if="row.required" class="text-destructive" aria-label="required">*</span>
                  </td>
                  <td v-if="section.key === 'props'" class="px-4 py-3">
                    <code v-if="row.default" class="font-mono text-xs">{{ row.default }}</code>
                    <span v-else class="text-muted-foreground">—</span>
                  </td>
                  <td class="min-w-64 px-4 py-3">
                    <code class="font-mono text-xs break-words">{{ row.type }}</code>
                    <p class="mt-1.5 text-muted-foreground"><InlineText :text="row.description" /></p>
                  </td>
                </tr>
              </tbody>
            </table>
          </ScrollBox>
        </div>
      </section>
    </div>
    <Accordion type="multiple" class="md:hidden">
      <AccordionItem v-for="part in parts" :key="part.name" :value="part.name">
        <AccordionTrigger class="min-h-11 font-mono">{{ part.name }}</AccordionTrigger>
        <AccordionContent>
          <div class="flex flex-col gap-4">
            <p v-for="(paragraph, index) in part.paragraphs" :key="index" class="text-body-md text-muted-foreground">
              <InlineText :text="paragraph" />
            </p>
            <div v-for="section in part.sections" :key="section.key" class="flex flex-col gap-2">
              <h4 class="text-label-lg text-muted-foreground">{{ section.title }}</h4>
              <dl class="flex flex-col divide-y rounded-lg border">
                <div v-for="row in section.rows" :key="row.label" class="flex flex-col gap-1 px-3 py-2.5">
                  <dt class="flex flex-wrap items-baseline justify-between gap-2">
                    <span class="font-mono text-xs" :class="row.nested && 'text-muted-foreground'">
                      {{ row.label }}<span v-if="row.required" class="text-destructive" aria-label="required">*</span>
                    </span>
                    <code v-if="row.default" class="font-mono text-xs text-muted-foreground">{{ row.default }}</code>
                  </dt>
                  <dd class="flex flex-col gap-1">
                    <code class="font-mono text-xs break-words">{{ row.type }}</code>
                    <span class="text-body-sm text-muted-foreground"><InlineText :text="row.description" /></span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
</template>
