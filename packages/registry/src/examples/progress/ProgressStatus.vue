<script setup lang="ts">
import { Progress } from "@/ui/progress";
</script>

<template>
  <div class="grid w-full max-w-sm gap-6">
    <Progress :model-value="30" status />
    <Progress :model-value="70" status inverted />
  </div>
</template>
