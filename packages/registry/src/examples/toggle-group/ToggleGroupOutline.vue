<script setup lang="ts">
import { ToggleGroup, ToggleGroupItem } from "@/ui/toggle-group";
</script>

<template>
  <ToggleGroup type="single" default-value="week" variant="outline" active-variant="subtle" color="primary" size="sm">
    <ToggleGroupItem value="day">Day</ToggleGroupItem>
    <ToggleGroupItem value="week">Week</ToggleGroupItem>
    <ToggleGroupItem value="month">Month</ToggleGroupItem>
  </ToggleGroup>
</template>
