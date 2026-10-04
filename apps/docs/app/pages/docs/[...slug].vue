<script setup lang="ts">
import DocsPageHeader from '~/components/layout/DocsPageHeader.vue'

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
    <DocsPageHeader
      :title="page.title"
      :description="page.description"
      :path="path"
      :component="page.component"
      :reka="page.reka"
    />
    <ContentRenderer :value="page" class="prose max-w-none" />
  </article>
</template>
