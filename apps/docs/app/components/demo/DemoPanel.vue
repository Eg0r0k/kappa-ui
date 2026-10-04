<script setup lang="ts">
import { Splitter, SplitterHandle, SplitterPanel } from '@/ui/splitter'
import DeferredPreview from '~/components/DeferredPreview.vue'
import DemoCode from '~/components/demo/DemoCode.vue'
import DemoToolbar from '~/components/demo/DemoToolbar.vue'
import DemoWidthHandle from '~/components/demo/DemoWidthHandle.vue'
import api from '~/generated/api.json'
import { hasColorProp } from '~/lib/demo'
import { findItem } from '~/lib/registry'
import { themeToQuery } from '~/lib/theme'

const demo = injectDemo()
const { selected, component, expanded, resizing, width, colorScheme, dir, color, inspect, restart } = demo
const { theme } = useSiteTheme()
const { show } = useSearchDialog()

const siteTheme = computed(() => JSON.stringify(themeToQuery(theme.value)))
const item = computed(() => (selected.value ? findItem(selected.value.name) : undefined))
const share = computed(() => (item.value?.meta?.demo?.height ?? 0.6) * 100)
const colors = computed(() => hasColorProp(findItem(component.value ?? '')?.files ?? [], api))

const setResizing = (value: boolean) => {
  resizing.value = value
}
</script>

<template>
  <aside
    data-slot="demo-panel"
    aria-label="Example"
    :class="[
      'sticky top-14 hidden h-[calc(100svh-3.5rem)] shrink flex-col border-s bg-background md:flex',
      expanded ? 'md:flex-1' : 'md:w-100 lg:w-(--demo-width) lg:min-w-105',
    ]"
  >
    <DemoWidthHandle
      v-if="!expanded"
      v-model="width"
      class="absolute inset-y-0 -start-1.5 hidden lg:block"
      @commit="demo.commitWidth"
      @resizing="setResizing"
    />
    <DemoToolbar :colors="colors" />
    <Splitter v-if="selected" :key="selected.name" direction="vertical" class="min-h-0 flex-1">
      <SplitterPanel :default-size="share" :min-size="20">
        <DeferredPreview
          :name="selected.name"
          :title="item?.title"
          :color-scheme="colorScheme"
          :dir="dir"
          :site-theme="siteTheme"
          :restart="restart"
          :color="colors ? color : 'primary'"
          :inspect="inspect"
          height="100%"
          root-margin="0px"
          :class="['h-full', resizing && 'pointer-events-none']"
          @shortcut="show()"
        />
      </SplitterPanel>
      <SplitterHandle @dragging="setResizing" />
      <SplitterPanel :min-size="10">
        <DemoCode :name="selected.name" />
      </SplitterPanel>
    </Splitter>
  </aside>
</template>
