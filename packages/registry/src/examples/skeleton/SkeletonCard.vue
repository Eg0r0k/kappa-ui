<script setup lang="ts">
import { Card, CardContent, CardFooter, CardHeader } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";
</script>

<template>
  <Card class="w-full max-w-sm" aria-busy="true" aria-label="Loading article">
    <CardHeader>
      <div class="flex items-center gap-3">
        <Skeleton animation="wave" variant="circle" class="size-10" />
        <div class="flex flex-1 flex-col">
          <Skeleton animation="wave" variant="text" class="w-1/2 text-title-sm" />
          <Skeleton animation="wave" variant="text" class="w-1/3 text-body-sm" />
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <Skeleton animation="wave" class="aspect-video w-full rounded-lg" />
    </CardContent>
    <CardFooter class="gap-2">
      <Skeleton animation="wave" class="h-9 w-24 rounded-lg" />
      <Skeleton animation="wave" class="h-9 w-24 rounded-lg" />
    </CardFooter>
  </Card>
</template>
