<script setup lang="ts">
import { Splitter, SplitterHandle, SplitterPanel } from '@/ui/splitter'
import ExampleControls from '~/components/ExampleControls.vue'
import PreviewIframe from '~/components/PreviewIframe.vue'
import DemoCode from '~/components/demo/DemoCode.vue'
import DemoToolbar from '~/components/demo/DemoToolbar.vue'
import DemoTools from '~/components/demo/DemoTools.vue'
import DemoWidthHandle from '~/components/demo/DemoWidthHandle.vue'
import { findItem } from '~/lib/registry'
import { themeToQuery } from '~/lib/theme'

const demo = injectDemo()
const { selected, expanded, resizing, width, colorScheme, dir, inspect, restart } = demo
const { theme } = useSiteTheme()
const { show } = useSearchDialog()

const siteTheme = computed(() => JSON.stringify(themeToQuery(theme.value)))
const item = computed(() => (selected.value ? findItem(selected.value.name) : undefined))
const exampleName = computed(() => selected.value?.name ?? '')
const { controls, values, changed, reset } = useExampleProps(exampleName)
const controlsOpen = useControlsOpen()
const hasChanges = computed(() => Object.keys(changed.value).length > 0)

const share = computed(() => (item.value?.meta?.demo?.height ?? 0.6) * 100)

const setResizing = (value: boolean) => {
  resizing.value = value
}
</script>

<template>
  <aside
    data-slot="demo-panel"
    aria-label="Example"
    :data-expanded="expanded || undefined"
    :class="[
      'sticky top-14 h-[calc(100svh-3.5rem)] shrink flex-col bg-background',
      expanded ? 'flex flex-1' : 'hidden border-s md:flex md:w-100 lg:w-(--demo-width) lg:min-w-105',
    ]"
  >
    <DemoWidthHandle
      v-if="!expanded"
      v-model="width"
      class="absolute inset-y-0 -start-1.5 hidden lg:block"
      @commit="demo.commitWidth"
      @resizing="setResizing"
    />
    <DemoToolbar />
    <Splitter v-if="selected" :key="selected.name" direction="vertical" class="min-h-0 flex-1">
      <SplitterPanel :default-size="share" :min-size="20" class="relative">
        <PreviewIframe
          :name="selected.name"
          :title="item?.title"
          :color-scheme="colorScheme"
          :dir="dir"
          :site-theme="siteTheme"
          :restart="restart"
          :inspect="inspect"
          :props="values"
          height="100%"
          :class="['h-full', resizing && 'pointer-events-none']"
          @shortcut="show()"
        />
        <DemoTools class="absolute inset-x-0 bottom-3 z-10 mx-auto" />
      </SplitterPanel>
      <SplitterHandle
        grip
        class="[&>[data-slot=splitter-grip]]:h-10 [&>[data-slot=splitter-grip]]:w-4 [&>[data-slot=splitter-grip]]:rounded-full [&>[data-slot=splitter-grip]_svg]:size-3.5"
        @dragging="setResizing"
      />
      <SplitterPanel :min-size="10" class="flex flex-col">
        <ExampleControls
          v-if="controls.length > 0 && controlsOpen"
          v-model="values"
          :controls="controls"
          :changed="hasChanges"
          class="shrink-0 border-b bg-muted/40"
          @reset="reset"
        />
        <DemoCode :name="selected.name" :props="changed" class="min-h-0 flex-1" />
      </SplitterPanel>
    </Splitter>
  </aside>
</template>
