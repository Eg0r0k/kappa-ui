<script setup lang="ts">
import { computed } from 'vue'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/ui/toggle-group'
import CodeBlock from '~/components/CodeBlock.vue'
import CommandLine from '~/components/CommandLine.vue'
import { consumerDependencies, consumerSource } from '~/lib/consumer'
import { serializeCssRules, serializeCssVars } from '~/lib/css'
import {
  addCommand,
  installDependenciesCommand,
  packageManagers,
  registryItemUrl,
  type PackageManager,
} from '~/lib/install'
import { findItem, resolveInstallFilename } from '~/lib/registry'
import { loadSource, loadStyle } from '~/lib/sources'

const props = defineProps<{ name: string }>()

const found = findItem(props.name)
if (!found) {
  throw createError({
    statusCode: 500,
    statusMessage: `Registry item "${props.name}" is not in packages/registry/registry.json.`,
    fatal: true,
  })
}
const item = found

const pm = usePackageManager()
const choose = (value: unknown) => {
  if (typeof value === 'string' && value) pm.value = value as PackageManager
}
const url = registryItemUrl(useRuntimeConfig().public.siteUrl, item.name)

const dependencies = computed(() =>
  installDependenciesCommand(
    pm.value,
    consumerDependencies(item.dependencies ?? [], useRuntimeConfig().public.dependencyRanges),
  ),
)

const { data: pages } = useAsyncData('docs-component-pages', () =>
  queryCollection('docs').select('path', 'component').where('component', 'IS NOT NULL').all(),
)

const registryDependencies = computed(() =>
  (item.registryDependencies ?? []).map((name) => ({
    name,
    to: pages.value?.find((page) => page.component === name)?.path,
  })),
)

const { data: code } = useAsyncData(`install-code:${item.name}`, async () => {
  const { highlight, langOf } = await import('~/lib/highlight')
  const files = await Promise.all(
    item.files.map(async (file) => {
      const source = consumerSource(await loadSource(file.path))
      return {
        filename: resolveInstallFilename(file),
        source,
        html: await highlight(source, langOf(file.path)),
      }
    }),
  )
  const cssEntries = Object.entries(item.css ?? {})
  const imports = Object.fromEntries(cssEntries.filter(([key]) => key.startsWith('@import ')))
  const rules = Object.fromEntries(cssEntries.filter(([key]) => !key.startsWith('@import ')))
  const css = item.cssSource
    ? (await loadStyle(item.cssSource)).trim()
    : [
        Object.keys(imports).length ? serializeCssRules(imports) : '',
        item.cssVars ? serializeCssVars(item.cssVars) : '',
        Object.keys(rules).length ? serializeCssRules(rules) : '',
      ]
        .filter(Boolean)
        .join('\n\n')
  return { files, css: css ? { source: css, html: await highlight(css, 'css') } : null }
})
</script>

<template>
  <div class="not-prose my-6">
    <Tabs default-value="cli" class="gap-3">
      <TabsList variant="line" size="sm" class="w-full" aria-label="Installation method">
        <TabsTrigger value="cli">CLI</TabsTrigger>
        <TabsTrigger value="manual">Manual</TabsTrigger>
      </TabsList>
      <ToggleGroup
        type="single"
        size="sm"
        aria-label="Package manager"
        class="mt-1 self-start"
        :model-value="pm"
        @update:model-value="choose"
      >
        <ToggleGroupItem v-for="manager in packageManagers" :key="manager" :value="manager">
          {{ manager }}
        </ToggleGroupItem>
      </ToggleGroup>
      <TabsContent value="cli">
        <CommandLine :command="addCommand(pm, url)" />
      </TabsContent>
      <TabsContent value="manual">
        <ol class="list-decimal space-y-6 ps-5 text-sm marker:text-muted-foreground">
          <li v-if="dependencies" class="space-y-3">
            <p>Install the dependencies:</p>
            <CommandLine :command="dependencies" />
          </li>
          <li v-if="registryDependencies.length" class="space-y-3">
            <p>Add the items it builds on:</p>
            <ul class="flex flex-wrap gap-2">
              <li v-for="dependency in registryDependencies" :key="dependency.name">
                <NuxtLink
                  v-if="dependency.to"
                  :to="dependency.to"
                  class="rounded-sm font-mono text-primary underline-offset-4 hover:underline focus-visible:focus-ring"
                >
                  {{ dependency.name }}
                </NuxtLink>
                <code v-else class="font-mono">{{ dependency.name }}</code>
              </li>
            </ul>
          </li>
          <li v-if="code?.files.length" class="space-y-3">
            <p>Copy the files into your project:</p>
            <CodeBlock
              v-for="file in code?.files ?? []"
              :key="file.filename"
              :filename="file.filename"
              :html="file.html"
              :source="file.source"
            />
          </li>
          <li v-if="code?.css" class="space-y-3">
            <p>Add this to your global stylesheet. It applies to your whole project, not only to this component.</p>
            <CodeBlock filename="globals.css" :html="code.css.html" :source="code.css.source" />
          </li>
        </ol>
      </TabsContent>
    </Tabs>
  </div>
</template>
