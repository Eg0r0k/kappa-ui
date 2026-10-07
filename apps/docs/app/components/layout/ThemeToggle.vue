<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue'

import { Button } from '@/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip'

const colorMode = useColorMode()

const toggle = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <Tooltip>
    <TooltipTrigger as-child>
      <Button variant="ghost" color="neutral" size="icon-md" aria-label="Toggle theme" @click="toggle">
        <Sun class="dark:hidden" />
        <Moon class="hidden dark:block" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>Light or dark</TooltipContent>
  </Tooltip>
</template>
