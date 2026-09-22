<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import { defineAsyncComponent, ref, watch, type HTMLAttributes } from 'vue'

import { Button } from '@/ui/button'
import CodeBlock from '~/components/CodeBlock.vue'
import CommandLine from '~/components/CommandLine.vue'
import PreviewFrame from '~/components/content/PreviewFrame.vue'
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
const file = item.files[0]!
const Example = defineAsyncComponent(exampleModules[key]!)
const exampleCommand = addCommand('npm', registryItemUrl(useRuntimeConfig().public.siteUrl, item.name))

const { data: code } = useAsyncData(`example-code:${props.name}`, async () => {
  const source = await loadSource(file.path)
  const { highlight } = await import('~/lib/highlight')
  return { source, html: await highlight(source, 'vue') }
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

const trigger =
  '-mb-px border-b-2 border-transparent px-1 pb-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground'
</script>

<template>
  <div class="not-prose my-6">
    <TabsRoot default-value="preview">
      <div class="flex items-center justify-between gap-2 border-b">
        <TabsList class="flex gap-4" aria-label="Example view">
          <TabsTrigger value="preview" :class="trigger">Preview</TabsTrigger>
          <TabsTrigger value="code" :class="trigger">Code</TabsTrigger>
        </TabsList>
        <div class="flex items-center gap-1 pb-1">
          <Button variant="ghost" size="icon-sm" aria-label="Toggle the example's theme" @click="toggleTheme">
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
            size="sm"
            :aria-pressed="dir === 'rtl'"
            aria-label="Toggle right-to-left"
            @click="toggleDir"
          >
            {{ dir === 'rtl' ? 'RTL' : 'LTR' }}
          </Button>
        </div>
      </div>
      <TabsContent value="preview" class="mt-4">
        <PreviewFrame :theme="theme" :dir="dir" :class="props.class">
          <Example />
        </PreviewFrame>
      </TabsContent>
      <TabsContent value="code" class="mt-4">
        <CodeBlock
          v-if="code"
          :filename="file.path.replace(/^src\//, '@/')"
          :html="code.html"
          :source="code.source"
        />
        <div class="mt-3 grid gap-2">
          <p class="text-xs text-muted-foreground">Add this example to your project:</p>
          <CommandLine :command="exampleCommand" />
        </div>
      </TabsContent>
    </TabsRoot>
  </div>
</template>
