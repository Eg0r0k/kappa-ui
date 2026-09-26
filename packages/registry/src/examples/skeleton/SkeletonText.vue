<script setup lang="ts">
import { ref } from "vue";

import { Label } from "@/ui/label";
import { Skeleton } from "@/ui/skeleton";
import { Switch } from "@/ui/switch";

const loading = ref(true);
</script>

<template>
  <div class="flex w-full max-w-sm flex-col gap-6">
    <div class="flex items-center gap-2">
      <Switch id="skeleton-loading" v-model="loading" />
      <Label for="skeleton-loading">Loading</Label>
    </div>
    <article :aria-busy="loading" class="flex flex-col gap-1">
      <template v-if="loading">
        <Skeleton variant="text" class="w-2/3 text-headline-sm" />
        <Skeleton variant="text" class="text-body-md" />
        <Skeleton variant="text" class="text-body-md" />
        <Skeleton variant="text" class="w-1/2 text-body-md" />
      </template>
      <template v-else>
        <h3 class="text-headline-sm">Release notes</h3>
        <p class="text-body-md text-muted-foreground">
          Menus take a size now, from xs to xl, and the separator got a label. The layout below does not move when this
          text replaces the skeleton.
        </p>
      </template>
    </article>
  </div>
</template>
