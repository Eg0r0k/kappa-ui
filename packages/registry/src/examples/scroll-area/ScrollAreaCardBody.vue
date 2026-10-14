<script setup lang="ts">
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { ScrollArea } from "@/ui/scroll-area";

const events = Array.from({ length: 24 }, (_, index) => ({
  id: index,
  title: `Build #${1240 - index} passed`,
  time: `${index + 2} min ago`,
}));
</script>

<template>
  <Card class="w-full max-w-sm">
    <CardHeader>
      <CardTitle>Activity</CardTitle>
      <CardDescription>The latest builds on main.</CardDescription>
    </CardHeader>
    <ScrollArea class="max-h-48">
      <CardContent>
        <ul class="flex flex-col gap-3">
          <li v-for="event in events" :key="event.id" class="flex items-center justify-between gap-4">
            <span class="text-body-md">{{ event.title }}</span>
            <span class="text-label-md text-muted-foreground">{{ event.time }}</span>
          </li>
        </ul>
      </CardContent>
    </ScrollArea>
    <CardFooter class="text-body-sm text-muted-foreground">24 builds today</CardFooter>
  </Card>
</template>
