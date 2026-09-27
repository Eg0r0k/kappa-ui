<script setup lang="ts">
import DocsToc from '~/components/layout/DocsToc.vue'

definePageMeta({ layout: 'docs' })

const route = useRoute()

const { data: page } = await useAsyncData(`docs:${route.path}`, () => queryCollection('docs').path(route.path).first())

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
  <div v-if="page" class="flex gap-10 px-6 py-10 lg:px-10">
    <article class="min-w-0 max-w-3xl flex-1">
      <header class="mb-8">
        <h1 class="text-3xl font-semibold tracking-tight">{{ page.title }}</h1>
        <p class="mt-2 text-lg text-muted-foreground">{{ page.description }}</p>
      </header>
      <ContentRenderer :value="page" class="prose max-w-none" />
    </article>
    <aside class="sticky top-14 hidden h-fit w-56 shrink-0 py-2 xl:block">
      <DocsToc :links="page.body?.toc?.links ?? []" />
    </aside>
  </div>
</template>
