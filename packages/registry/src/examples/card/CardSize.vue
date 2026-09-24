<script setup lang="ts">
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
</script>

<template>
  <div class="grid w-full max-w-2xl items-start gap-4 sm:grid-cols-2">
    <Card v-for="size in ['default', 'sm'] as const" :key="size" :size="size">
      <CardHeader>
        <CardTitle>Storage almost full</CardTitle>
        <CardDescription>18.6 GB of 20 GB used.</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="h-2 overflow-hidden rounded-full bg-muted">
          <div class="h-full w-[93%] rounded-full bg-warning" />
        </div>
      </CardContent>
      <CardFooter>
        <Button :size="size === 'sm' ? 'sm' : 'default'">Upgrade</Button>
      </CardFooter>
    </Card>
  </div>
</template>
