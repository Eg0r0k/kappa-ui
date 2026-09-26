<script setup lang="ts">
import { Bell } from "@lucide/vue";

import { Badge } from "@/ui/badge";
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <Badge square>1</Badge>
    <Badge square>12</Badge>
    <Badge square color="destructive">99+</Badge>
    <Badge square variant="soft" color="neutral" aria-label="Notifications"><Bell /></Badge>
  </div>
</template>
