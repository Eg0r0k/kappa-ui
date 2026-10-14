<script setup lang="ts">
import { Skeleton } from "@/ui/skeleton";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <div class="flex items-center gap-4">
    <Skeleton variant="circle" class="size-12" v-bind="$attrs" />
    <div class="flex flex-col gap-2">
      <Skeleton class="h-4 w-60" />
      <Skeleton class="h-4 w-48" />
    </div>
  </div>
</template>
