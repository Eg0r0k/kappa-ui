<script setup lang="ts">
import { CircleCheck } from "@lucide/vue";
import { ref } from "vue";

import { Alert, AlertClose, AlertDescription, AlertTitle } from "@/ui/alert";
import { Button } from "@/ui/button";

const open = ref(true);
</script>

<template>
  <div class="flex w-full max-w-md flex-col items-center gap-3">
    <Alert v-model:open="open" variant="subtle" color="success">
      <CircleCheck />
      <AlertTitle>Changes saved</AlertTitle>
      <AlertDescription>Your profile is up to date and visible to your team.</AlertDescription>
      <AlertClose />
    </Alert>
    <Button v-if="!open" variant="outline" color="neutral" size="sm" @click="open = true">Show the alert</Button>
  </div>
</template>
