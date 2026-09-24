<script setup lang="ts">
import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <div class="flex flex-col items-start gap-4">
    <Tabs v-for="size in sizes" :key="size" default-value="day">
      <TabsList :size="size">
        <TabsTrigger value="day">Day</TabsTrigger>
        <TabsTrigger value="week">Week</TabsTrigger>
        <TabsTrigger value="month">Month</TabsTrigger>
      </TabsList>
    </Tabs>
  </div>
</template>
