<script setup lang="ts">
import { TriangleAlert } from "@lucide/vue";

import { Alert, AlertActions, AlertDescription, AlertTitle } from "@/ui/alert";
import { Button } from "@/ui/button";

const orientations = ["vertical", "horizontal"] as const;
</script>

<template>
  <div class="grid w-full max-w-xl gap-4">
    <Alert
      v-for="orientation in orientations"
      :key="orientation"
      :orientation="orientation"
      variant="soft"
      color="warning"
    >
      <TriangleAlert />
      <AlertTitle>Your trial ends in 3 days</AlertTitle>
      <AlertDescription>Add a payment method to keep your projects running.</AlertDescription>
      <AlertActions>
        <Button size="xs" color="warning">Upgrade</Button>
        <Button size="xs" variant="ghost" color="neutral">Dismiss</Button>
      </AlertActions>
    </Alert>
  </div>
</template>
