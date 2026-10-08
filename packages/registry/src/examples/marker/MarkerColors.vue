<script setup lang="ts">
import { CircleCheck, GitBranch, TriangleAlert } from "@lucide/vue";

import { Marker, MarkerContent, MarkerIcon } from "@/ui/marker";
</script>

<template>
  <div class="flex w-full max-w-sm flex-col gap-8">
    <Marker variant="separator" color="destructive">
      <MarkerContent>New messages</MarkerContent>
    </Marker>
    <Marker color="success">
      <MarkerIcon><CircleCheck /></MarkerIcon>
      <MarkerContent>All 128 tests passed</MarkerContent>
    </Marker>
    <Marker color="warning">
      <MarkerIcon><TriangleAlert /></MarkerIcon>
      <MarkerContent>2 files changed outside the workspace</MarkerContent>
    </Marker>
    <Marker variant="border" color="info">
      <MarkerIcon><GitBranch /></MarkerIcon>
      <MarkerContent>Switched to release-candidate</MarkerContent>
    </Marker>
  </div>
</template>
