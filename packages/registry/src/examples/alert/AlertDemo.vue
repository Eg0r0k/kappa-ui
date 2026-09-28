<script setup lang="ts">
import { CircleAlert, Info } from "@lucide/vue";

import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
</script>

<template>
  <div class="grid w-full max-w-xl gap-4">
    <Alert variant="subtle" color="info">
      <Info />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>You can add components to your app with the CLI.</AlertDescription>
    </Alert>
    <Alert variant="subtle" color="destructive">
      <CircleAlert />
      <AlertTitle>Unable to process your payment</AlertTitle>
      <AlertDescription>Check your card details and try again.</AlertDescription>
    </Alert>
  </div>
</template>
