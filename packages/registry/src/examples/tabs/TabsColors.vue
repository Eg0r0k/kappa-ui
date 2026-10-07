<script setup lang="ts">
import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs";

const colors = ["primary", "neutral", "success", "warning", "destructive", "info"] as const;
</script>

<template>
  <div class="flex w-full max-w-md flex-col gap-4">
    <Tabs v-for="color in colors" :key="color" default-value="overview">
      <TabsList variant="line" :color="color" class="w-full" :aria-label="color">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
    </Tabs>
  </div>
</template>
