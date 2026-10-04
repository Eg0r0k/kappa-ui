<script setup lang="ts">
import ChangelogTimeline from '~/components/ChangelogTimeline.vue'

definePageMeta({ layout: 'docs' })

const { data: releases } = await useAsyncData('changelog', async () => {
  const { default: changelog } = await import('~/generated/changelog.json')
  return changelog.releases.map(({ package: pkg, version, date, entries }) => ({
    package: pkg as 'registry' | 'core',
    version,
    date,
    entries: entries.map(({ hash, url, text }) => ({ hash, url, text })),
  }))
})

useSeoMeta({ title: 'Changelog', description: 'Every release of the kappa-ui components and @kappa-ui/core.' })

defineOgImage('KappaDocs', {
  title: 'Changelog',
  description: 'Every release of the kappa-ui components and @kappa-ui/core.',
})
</script>

<template>
  <article class="mx-auto w-full max-w-175 px-6 py-10">
    <header class="mb-8">
      <h1 class="text-3xl font-semibold tracking-tight">Changelog</h1>
      <p class="mt-2 text-lg text-muted-foreground">Every release of the components and of @kappa-ui/core.</p>
    </header>
    <ChangelogTimeline :releases="releases ?? []" />
  </article>
</template>
