<script setup lang="ts">
import { Check, X } from '@lucide/vue'

import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
</script>

<template>
  <div data-slot="do-dont" class="not-prose my-6 grid gap-3 sm:grid-cols-2">
    <Card size="sm">
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-success-text"><Check class="size-4" />Do</CardTitle>
      </CardHeader>
      <CardContent class="text-body-md"><slot name="do" /></CardContent>
    </Card>
    <Card size="sm">
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-destructive"><X class="size-4" />Don’t</CardTitle>
      </CardHeader>
      <CardContent class="text-body-md"><slot name="dont" /></CardContent>
    </Card>
  </div>
</template>
