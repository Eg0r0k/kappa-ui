<script setup lang="ts">
import { Progress } from "@/ui/progress";

const steps = ["Waiting…", "Cloning…", "Migrating…", "Deploying…", "Done!"];
</script>

<template>
  <Progress :model-value="2" :max="steps" status class="max-w-sm" />
</template>
