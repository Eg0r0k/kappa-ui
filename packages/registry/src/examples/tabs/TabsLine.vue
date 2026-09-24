<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
</script>

<template>
  <Tabs default-value="overview" class="w-full max-w-md">
    <TabsList variant="line">
      <TabsTrigger value="overview">Overview</TabsTrigger>
      <TabsTrigger value="analytics">Analytics</TabsTrigger>
      <TabsTrigger value="reports">Reports</TabsTrigger>
      <TabsTrigger value="archive" disabled>Archive</TabsTrigger>
    </TabsList>
    <TabsContent value="overview" class="text-body-md text-muted-foreground">Your projects at a glance.</TabsContent>
    <TabsContent value="analytics" class="text-body-md text-muted-foreground">Traffic and conversion for the last 30 days.</TabsContent>
    <TabsContent value="reports" class="text-body-md text-muted-foreground">Scheduled and one-off exports.</TabsContent>
  </Tabs>
</template>
