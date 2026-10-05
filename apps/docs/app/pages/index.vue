<script setup lang="ts">
import CommandLine from '~/components/CommandLine.vue'
import HomeFooter from '~/components/home/HomeFooter.vue'
import HomeLede from '~/components/home/HomeLede.vue'
import HomeShowcase from '~/components/home/HomeShowcase.vue'
import StyleSwitcher from '~/components/home/StyleSwitcher.vue'
import { type ShowcaseStyleKey, showcaseCss, showcaseFontUrl } from '~/lib/showcase-styles'
import { Button } from '@/ui/button'

const title = 'Kappa UI has opinions too. About code, not about your UI.'
const description = 'Vue components on Reka UI and Tailwind CSS v4. The CLI copies their source into your project.'

const { siteUrl } = useRuntimeConfig().public
const command = `npx shadcn-vue@latest init --preset ${siteUrl}/r/init.json`
const styleKey = ref<ShowcaseStyleKey>('kappa')

useSeoMeta({ title: 'kappa-ui', description })

useHead({
  style: [{ key: 'showcase-styles', innerHTML: showcaseCss() }],
  link: [{ key: 'showcase-fonts', rel: 'stylesheet', href: showcaseFontUrl() }],
})

defineOgImage('KappaDocs', { title, description })
</script>

<template>
  <main class="overflow-x-clip">
    <section
      class="grid lg:h-[min(calc(100svh-3.5rem),56rem)] lg:grid-cols-[minmax(0,11fr)_minmax(0,13fr)] lg:grid-rows-[minmax(0,1fr)]"
    >
      <div class="flex flex-col justify-center gap-7 px-6 py-14 sm:px-10 lg:py-10 lg:ps-[max(2.5rem,calc(50vw-40rem))]">
        <h1 class="text-3xl/tight font-semibold tracking-tight text-balance sm:text-4xl/tight 2xl:text-5xl/tight">
          <span class="block text-muted-foreground">Your UI library has opinions. About your UI.</span>
          <span class="block">{{ title }}</span>
        </h1>
        <StyleSwitcher v-model="styleKey" />
        <HomeLede />
        <div class="flex flex-wrap gap-3">
          <Button as-child size="lg">
            <NuxtLink to="/docs/getting-started/quick-start">Get started</NuxtLink>
          </Button>
          <Button as-child size="lg" variant="soft" color="neutral">
            <NuxtLink to="/docs/components/button">Components</NuxtLink>
          </Button>
        </div>
        <CommandLine :command="command" class="max-w-xl" />
      </div>
      <HomeShowcase :style-key="styleKey" class="h-[40rem] lg:h-auto" />
    </section>
    <HomeFooter />
  </main>
</template>
