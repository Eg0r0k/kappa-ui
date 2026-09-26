<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Typography</CardTitle>
      <CardDescription>The typescale in the chosen font.</CardDescription>
    </CardHeader>
    <CardContent class="flex flex-col gap-2">
      <p class="text-display-sm">Aa Bb Cc</p>
      <p class="text-headline-sm">The quick brown fox</p>
      <p class="text-title-md">jumps over the lazy dog.</p>
      <p class="text-body-md text-muted-foreground">Body text reads at 14px with 20px lines. Numbers: 0123456789.</p>
      <p class="text-label-md text-primary">A label in the brand colour</p>
    </CardContent>
  </Card>
</template>
