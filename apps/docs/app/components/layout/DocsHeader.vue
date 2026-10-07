<script setup lang="ts">
import { PanelLeft } from '@lucide/vue'

import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip'
import GithubIcon from '~/components/GithubIcon.vue'
import MainNav from '~/components/layout/MainNav.vue'
import SearchCommand from '~/components/layout/SearchCommand.vue'
import SearchTrigger from '~/components/layout/SearchTrigger.vue'
import ThemeCustomizer from '~/components/layout/ThemeCustomizer.vue'
import ThemeToggle from '~/components/layout/ThemeToggle.vue'
import { CHANGELOG_PATH } from '~/lib/sidebar'

const props = withDefaults(defineProps<{ navigation?: boolean }>(), { navigation: true })
const { toggle } = useDocsShell()
const version = useRuntimeConfig().public.registryVersion
</script>

<template>
  <header data-slot="docs-header" class="sticky top-0 z-40 border-b bg-card">
    <div class="flex h-14 items-center gap-2 px-4">
      <Tooltip v-if="props.navigation">
        <TooltipTrigger as-child>
          <Button variant="ghost" color="neutral" size="icon-md" aria-label="Toggle navigation" @click="toggle">
            <PanelLeft />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Navigation</TooltipContent>
      </Tooltip>
      <NuxtLink to="/" class="rounded-sm px-1 font-semibold tracking-tight focus-visible:focus-ring">kappa</NuxtLink>
      <NuxtLink :to="CHANGELOG_PATH" class="rounded-full focus-visible:focus-ring" aria-label="Changelog">
        <Badge variant="soft" color="neutral" size="sm">v{{ version }}</Badge>
      </NuxtLink>
      <MainNav class="ms-2 hidden md:flex" />
      <div class="ms-auto flex items-center gap-1">
        <SearchTrigger />
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="ghost" color="neutral" size="icon-md" as-child>
              <a href="https://github.com/Eg0r0k/kappa-ui" target="_blank" rel="noreferrer" aria-label="GitHub">
                <GithubIcon />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>GitHub</TooltipContent>
        </Tooltip>
        <ThemeCustomizer />
        <ThemeToggle />
      </div>
    </div>
    <SearchCommand />
  </header>
</template>
