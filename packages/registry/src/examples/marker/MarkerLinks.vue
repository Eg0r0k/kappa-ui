<script setup lang="ts">
import { GitBranch, RotateCcw } from "@lucide/vue";
import { ref } from "vue";

import { Marker, MarkerContent, MarkerIcon } from "@/ui/marker";

const reverted = ref(false);
</script>

<template>
  <div class="flex w-full max-w-sm flex-col gap-8">
    <Marker as-child>
      <a href="#marker-links">
        <MarkerIcon><GitBranch /></MarkerIcon>
        <MarkerContent>View the pull request</MarkerContent>
      </a>
    </Marker>
    <Marker as-child>
      <button type="button" class="cursor-pointer transition-colors hover:text-foreground" @click="reverted = true">
        <MarkerIcon><RotateCcw /></MarkerIcon>
        <MarkerContent>{{ reverted ? "Change reverted" : "Revert this change" }}</MarkerContent>
      </button>
    </Marker>
  </div>
</template>
