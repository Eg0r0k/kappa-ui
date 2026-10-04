<script setup lang="ts">
import { Badge } from '@/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import badgeData from '~/generated/badges.json'
import { componentGroups } from '~/lib/sidebar'

definePageMeta({ layout: 'docs' })

const nav = useDocsNavigation()
const groups = computed(() => componentGroups(nav.value))
const badges = badgeData as Record<string, { kind: 'new' | 'updated'; until: string }>
const badgeOf = (component?: string) => (component ? badges[component]?.kind : undefined)

useSeoMeta({ title: 'Components', description: 'Every kappa-ui component, grouped by what it is for.' })

defineOgImage('KappaDocs', {
  title: 'Components',
  description: 'Every kappa-ui component, grouped by what it is for.',
})
</script>

<template>
  <article class="mx-auto w-full max-w-5xl px-6 py-10">
    <header class="mb-10">
      <h1 class="text-3xl font-semibold tracking-tight">Components</h1>
      <p class="mt-2 text-lg text-muted-foreground">Every component, grouped by what it is for.</p>
    </header>
    <section v-for="group in groups" :key="group.key" :aria-labelledby="`group-${group.key}`" class="mb-10">
      <h2 :id="`group-${group.key}`" class="mb-4 text-title-md">{{ group.title }}</h2>
      <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="page in group.pages" :key="page.path">
          <NuxtLink :to="page.path" class="block h-full rounded-xl focus-visible:focus-ring">
            <Card size="sm" class="h-full transition-colors hover:bg-accent">
              <CardHeader>
                <CardTitle class="flex items-center gap-2">
                  {{ page.title }}
                  <Badge
                    v-if="badgeOf(page.component)"
                    size="xs"
                    variant="soft"
                    :color="badgeOf(page.component) === 'new' ? 'success' : 'info'"
                  >
                    {{ badgeOf(page.component) }}
                  </Badge>
                </CardTitle>
                <CardDescription class="line-clamp-2">{{ page.description }}</CardDescription>
              </CardHeader>
            </Card>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </article>
</template>
