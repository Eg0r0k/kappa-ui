<script setup lang="ts">
import { Badge } from "@/ui/badge";
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <Badge>New</Badge>
    <Badge variant="soft" color="success">Active</Badge>
    <Badge variant="outline" color="neutral">Draft</Badge>
  </div>
</template>
