<script setup lang="ts">
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Spinner } from '@/ui/spinner'
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Buttons</CardTitle>
      <CardDescription>Every variant in the brand colour and in neutral.</CardDescription>
    </CardHeader>
    <CardContent class="flex flex-col gap-3">
      <div class="flex flex-wrap gap-2">
        <Button>Solid</Button>
        <Button variant="soft">Soft</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
      <div class="flex flex-wrap gap-2">
        <Button color="neutral">Solid</Button>
        <Button variant="soft" color="neutral">Soft</Button>
        <Button variant="outline" color="neutral">Outline</Button>
        <Button variant="ghost" color="neutral">Ghost</Button>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <Button disabled>
          <Spinner data-icon="inline-start" />
          Saving
        </Button>
        <Button variant="soft" color="success">Approve</Button>
        <Button variant="soft" color="warning">Review</Button>
        <Button color="destructive">Delete</Button>
      </div>
    </CardContent>
  </Card>
</template>
