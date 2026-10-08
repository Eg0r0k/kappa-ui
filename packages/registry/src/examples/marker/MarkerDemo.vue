<script setup lang="ts">
import { GitBranch, Search } from "@lucide/vue";

import { Marker, MarkerContent, MarkerIcon } from "@/ui/marker";
import { Spinner } from "@/ui/spinner";
</script>

<template>
  <div class="flex w-full max-w-sm flex-col gap-8">
    <Marker>
      <MarkerIcon><GitBranch /></MarkerIcon>
      <MarkerContent>Switched to a new branch</MarkerContent>
    </Marker>
    <Marker role="status">
      <MarkerIcon><Spinner /></MarkerIcon>
      <MarkerContent class="shimmer">Thinking…</MarkerContent>
    </Marker>
    <Marker variant="separator">
      <MarkerContent>Conversation compacted</MarkerContent>
    </Marker>
    <Marker>
      <MarkerIcon><Search /></MarkerIcon>
      <MarkerContent>Explored 4 files</MarkerContent>
    </Marker>
  </div>
</template>
