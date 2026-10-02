<script setup lang="ts">
import { PageIndicator, PageIndicatorItem } from "@/ui/page-indicator";

const colors = ["primary", "neutral", "success", "warning", "destructive", "info"] as const;
</script>

<template>
  <div class="flex w-full max-w-sm flex-col items-center gap-6">
    <div class="flex flex-wrap justify-center gap-6">
      <PageIndicator
        v-for="color in colors"
        :key="color"
        v-slot="{ pages }"
        :color="color"
        variant="pill"
        :count="4"
        :default-page="2"
      >
        <PageIndicatorItem v-for="value in pages" :key="value" :value="value" />
      </PageIndicator>
    </div>
    <div class="flex h-32 w-full items-end justify-center rounded-xl bg-linear-to-br from-sky-700 to-indigo-950 p-4">
      <PageIndicator v-slot="{ pages }" variant="pill" :count="4" :default-page="2" class="[--tone:white]">
        <PageIndicatorItem v-for="value in pages" :key="value" :value="value" />
      </PageIndicator>
    </div>
  </div>
</template>
