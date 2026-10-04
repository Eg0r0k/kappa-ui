<script setup lang="ts">
definePageMeta({ layout: 'docs' })

const route = useRoute()
const path = route.path.replace(/\/+$/, '')

const { data: page } = await useDocsPage(() => path)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

useSeoMeta({
  title: page.value.title,
  description: page.value.description,
})

defineOgImage('KappaDocs', {
  title: page.value.title,
  description: page.value.description,
})
</script>

<template>
  <article v-if="page" class="mx-auto w-full max-w-175 px-6 py-10">
    <header class="mb-8">
      <h1 class="text-3xl font-semibold tracking-tight">{{ page.title }}</h1>
      <p class="mt-2 text-lg text-muted-foreground">{{ page.description }}</p>
    </header>
    <ContentRenderer :value="page" class="prose max-w-none" />
  </article>
</template>
