<script setup lang="ts">
import { cn } from '@/lib/utils'
</script>

<template>
  <main class="min-h-svh bg-white p-10 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
    <!-- Два конфликтующих класса: tailwind-merge обязан оставить text-2xl -->
    <h1 :class="cn('text-base font-semibold tracking-tight', 'text-2xl')">delta-ui</h1>
    <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
      Витрина разработки. Компоненты живут в packages/registry.
    </p>
  </main>
</template>
