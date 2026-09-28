<script setup lang="ts">
import { Sparkles } from "@lucide/vue";

import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
</script>

<template>
  <Alert as="a" href="#" role="link" variant="link" color="primary" class="max-w-xl">
    <Sparkles />
    <AlertTitle>Version 2.4 is out</AlertTitle>
    <AlertDescription>Read what changed.</AlertDescription>
  </Alert>
</template>
