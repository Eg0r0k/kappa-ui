<script setup lang="ts">
import { RotateCw } from "@lucide/vue";
import { ref } from "vue";

import { Button } from "@/ui/button";
import {
  ErrorState,
  ErrorStateActions,
  ErrorStateDescription,
  ErrorStateHeader,
  ErrorStateMedia,
  ErrorStateTitle,
} from "@/ui/error-state";
import { Spinner } from "@/ui/spinner";

const retrying = ref(false);
const retry = () => {
  retrying.value = true;
  setTimeout(() => (retrying.value = false), 1500);
};
</script>

<template>
  <ErrorState class="w-full max-w-xl">
    <ErrorStateHeader>
      <ErrorStateMedia />
      <ErrorStateTitle>Couldn't load projects</ErrorStateTitle>
      <ErrorStateDescription
        >The server didn't answer. Your projects are safe; try again in a moment.</ErrorStateDescription
      >
    </ErrorStateHeader>
    <ErrorStateActions>
      <Button variant="outline" color="neutral" :disabled="retrying" @click="retry">
        <Spinner v-if="retrying" data-icon="inline-start" />
        <RotateCw v-else data-icon="inline-start" />
        Retry
      </Button>
    </ErrorStateActions>
  </ErrorState>
</template>
