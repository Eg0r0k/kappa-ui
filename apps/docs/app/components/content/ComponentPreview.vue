<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue'
import { defineAsyncComponent, ref, watch, type HTMLAttributes } from 'vue'

import { Button } from '@/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import CodeBlock from '~/components/CodeBlock.vue'
import CommandLine from '~/components/CommandLine.vue'
import PreviewFrame from '~/components/content/PreviewFrame.vue'
import { consumerFilename, consumerSource } from '~/lib/consumer'
import { addCommand, registryItemUrl } from '~/lib/install'
import { registryItems, resolveExample } from '~/lib/registry'
import { exampleModules, loadSource } from '~/lib/sources'

const props = defineProps<{ name: string; class?: HTMLAttributes['class'] }>()

const resolve = () => {
  try {
    return resolveExample(props.name, registryItems, Object.keys(exampleModules))
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: (error as Error).message, fatal: true })
  }
}

const { item, key } = resolve()
const Example = defineAsyncComponent(exampleModules[key]!)
const exampleCommand = addCommand('npm', registryItemUrl(useRuntimeConfig().public.siteUrl, item.name))

const { data: code } = useAsyncData(`example-code:${props.name}`, async () => {
  const { highlight } = await import('~/lib/highlight')
  return Promise.all(
    item.files.map(async (file) => {
      const source = consumerSource(await loadSource(file.path))
      return { filename: consumerFilename(file.path), source, html: await highlight(source, 'vue') }
    }),
  )
})

const colorMode = useColorMode()
const theme = ref<'light' | 'dark'>()
const dir = ref<'ltr' | 'rtl'>('ltr')

const toggleTheme = () => {
  const dark = theme.value ? theme.value === 'dark' : colorMode.value === 'dark'
  theme.value = dark ? 'light' : 'dark'
}

const toggleDir = () => {
  dir.value = dir.value === 'ltr' ? 'rtl' : 'ltr'
}

watch(
  () => colorMode.value,
  () => {
    theme.value = undefined
  },
)
</script>

<template>
  <div class="not-prose my-6">
    <Tabs default-value="preview" class="gap-4">
      <div class="flex items-end justify-between gap-2 border-b">
        <TabsList variant="line" size="sm" class="-mb-px" aria-label="Example view">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        <div class="flex items-center gap-1 pb-1">
          <Button
            variant="ghost"
            color="neutral"
            size="icon-sm"
            aria-label="Toggle the example's theme"
            @click="toggleTheme"
          >
            <template v-if="theme">
              <Moon v-if="theme === 'dark'" />
              <Sun v-else />
            </template>
            <template v-else>
              <Sun class="dark:hidden" />
              <Moon class="hidden dark:block" />
            </template>
          </Button>
          <Button
            variant="ghost"
            color="neutral"
            size="sm"
            :aria-pressed="dir === 'rtl'"
            aria-label="Toggle right-to-left"
            @click="toggleDir"
          >
            {{ dir === 'rtl' ? 'RTL' : 'LTR' }}
          </Button>
        </div>
      </div>
      <TabsContent value="preview">
        <PreviewFrame :theme="theme" :dir="dir" :class="props.class">
          <Example />
        </PreviewFrame>
      </TabsContent>
      <TabsContent value="code">
        <div v-if="code" class="grid gap-3">
          <CodeBlock
            v-for="block in code"
            :key="block.filename"
            :filename="block.filename"
            :html="block.html"
            :source="block.source"
          />
        </div>
        <div class="mt-3 grid gap-2">
          <p class="text-xs text-muted-foreground">Add this example to your project:</p>
          <CommandLine :command="exampleCommand" />
        </div>
      </TabsContent>
    </Tabs>
  </div>
</template>
