<script setup lang="ts">
import { Progress } from "@/ui/progress";
</script>

<template>
  <div class="flex h-48 gap-8">
    <Progress orientation="vertical" :model-value="25" status />
    <Progress orientation="vertical" :model-value="50" status />
    <Progress orientation="vertical" :model-value="75" status inverted />
    <Progress orientation="vertical" animation="swing" />
  </div>
</template>
