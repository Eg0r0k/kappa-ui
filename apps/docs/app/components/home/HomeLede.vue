<script setup lang="ts">
import HomeLedeTerm from '~/components/home/HomeLedeTerm.vue'
import { componentCount } from '~/lib/registry'

const count = componentCount()
</script>

<template>
  <p class="max-w-xl text-body-lg text-muted-foreground">
    {{ count }}
    <HomeLedeTerm
      label="Vue"
      href="https://vuejs.org"
      text="Plain script setup components that run in Vite and Nuxt projects."
    />
    components on
    <HomeLedeTerm
      label="Reka UI"
      href="https://reka-ui.com"
      text="Accessible, unstyled Vue primitives. kappa-ui styles them and keeps their APIs."
    />
    and
    <HomeLedeTerm
      label="Tailwind CSS v4"
      href="https://tailwindcss.com"
      text="Every style is a utility class over CSS variables, so a theme is a few lines of CSS."
    />, copied into your project.
  </p>
</template>
