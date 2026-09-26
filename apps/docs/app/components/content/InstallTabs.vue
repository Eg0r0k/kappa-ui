<script setup lang="ts">
import { computed } from 'vue'

import { Button } from '@/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import CodeBlock from '~/components/CodeBlock.vue'
import CommandLine from '~/components/CommandLine.vue'
import { serializeCssRules, serializeCssVars } from '~/lib/css'
import {
  addCommand,
  installDependenciesCommand,
  packageManagers,
  registryItemUrl,
  type PackageManager,
} from '~/lib/install'
import { findItem, resolveInstallFilename } from '~/lib/registry'
import { loadSource } from '~/lib/sources'

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

const pm = useState<PackageManager>('package-manager', () => 'pnpm')
const url = registryItemUrl(useRuntimeConfig().public.siteUrl, item.name)

const dependencies = computed(() => installDependenciesCommand(pm.value, item.dependencies ?? []))

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
      const source = await loadSource(file.path)
      return {
        filename: resolveInstallFilename(file),
        source,
        html: await highlight(source, langOf(file.path)),
      }
    }),
  )
  const css = [
    item.cssVars ? serializeCssVars(item.cssVars) : '',
    item.css ? serializeCssRules(item.css) : '',
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
      <div class="mt-1 flex flex-wrap gap-1" role="group" aria-label="Package manager">
        <Button
          v-for="manager in packageManagers"
          :key="manager"
          size="sm"
          :variant="pm === manager ? 'soft' : 'ghost'"
          color="neutral"
          :aria-pressed="pm === manager"
          @click="pm = manager"
        >
          {{ manager }}
        </Button>
      </div>
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
                  class="font-mono text-primary underline-offset-4 hover:underline"
                >
                  {{ dependency.name }}
                </NuxtLink>
                <code v-else class="font-mono">{{ dependency.name }}</code>
              </li>
            </ul>
          </li>
          <li class="space-y-3">
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
