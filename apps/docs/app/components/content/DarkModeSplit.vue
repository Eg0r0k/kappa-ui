<script setup lang="ts">
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { Switch } from '@/ui/switch'
import DocsFigure from '~/components/DocsFigure.vue'

const sides = [
  { theme: 'light', selector: ':root' },
  { theme: 'dark', selector: '.dark' },
]
</script>

<template>
  <DocsFigure title="One markup, two classes" class="grid sm:grid-cols-2">
    <div
      v-for="side in sides"
      :key="side.theme"
      :class="[side.theme, 'flex flex-col gap-4 bg-background p-5 text-foreground sm:p-6']"
      inert
    >
      <span class="font-mono text-xs text-muted-foreground">{{ side.selector }}</span>
      <Card size="sm">
        <CardHeader>
          <CardTitle class="flex items-center justify-between gap-2">
            Notifications
            <Badge variant="soft" color="success">On</Badge>
          </CardTitle>
          <CardDescription>Email me when someone replies.</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-3">
          <Input size="sm" placeholder="you@example.com" />
          <div class="flex items-center gap-2 text-body-sm">
            <Switch size="sm" :default-value="true" />
            Weekly digest
          </div>
        </CardContent>
        <CardFooter class="justify-end gap-2">
          <Button variant="ghost" color="neutral" size="sm">Cancel</Button>
          <Button size="sm">Save</Button>
        </CardFooter>
      </Card>
    </div>
  </DocsFigure>
</template>
