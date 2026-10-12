<script setup lang="ts">
import { Info } from "@lucide/vue";

import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <Alert class="max-w-xl" v-bind="$attrs">
    <Info />
    <AlertTitle>Heads up!</AlertTitle>
    <AlertDescription>You can add components to your app with the CLI.</AlertDescription>
  </Alert>
</template>
