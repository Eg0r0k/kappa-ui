<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue'

import { Button } from '@/ui/button'

const colorMode = useColorMode()

const toggle = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <Button variant="ghost" size="icon" aria-label="Toggle theme" @click="toggle">
    <Sun class="dark:hidden" />
    <Moon class="hidden dark:block" />
  </Button>
</template>
