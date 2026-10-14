<script setup lang="ts">
import CommandLine from '~/components/CommandLine.vue'
import HomeCanvas from '~/components/home/canvas/HomeCanvas.vue'
import HomeFooter from '~/components/home/HomeFooter.vue'
import HomeLede from '~/components/home/HomeLede.vue'
import { COMPONENTS_PATH } from '~/lib/sidebar'
import { Button } from '@/ui/button'

const title = 'Kappa UI has opinions too. About code, not about your UI.'
const description = 'Vue components on Reka UI and Tailwind CSS v4. The CLI copies their source into your project.'

const { siteUrl } = useRuntimeConfig().public
const command = `npx shadcn-vue@latest init --preset ${siteUrl}/r/init.json`

useSeoMeta({ title: 'kappa-ui', description })

defineOgImage('KappaDocs', { title, description })
</script>

<template>
  <main class="overflow-x-clip">
    <section
      class="grid grid-cols-[minmax(0,1fr)] lg:h-[min(calc(100svh-3.5rem),56rem)] lg:grid-cols-[minmax(0,11fr)_minmax(0,13fr)] lg:grid-rows-[minmax(0,1fr)]"
    >
      <div class="flex flex-col justify-center gap-7 px-5 py-14 lg:py-10">
        <h1 class="text-3xl/tight font-semibold tracking-tight text-balance sm:text-4xl/tight 2xl:text-5xl/tight">
          <span class="block text-muted-foreground">Your UI library has opinions. About your UI.</span>
          <span class="block">{{ title }}</span>
        </h1>
        <HomeLede />
        <div class="flex flex-wrap gap-3">
          <Button as-child size="lg">
            <NuxtLink to="/docs/getting-started/quick-start">Get started</NuxtLink>
          </Button>
          <Button as-child size="lg" variant="soft" color="neutral">
            <NuxtLink :to="COMPONENTS_PATH">Components</NuxtLink>
          </Button>
        </div>
        <CommandLine :command="command" class="max-w-xl" />
      </div>
      <HomeCanvas />
    </section>
    <HomeFooter />
  </main>
</template>
