<script setup lang="ts">
import { PageIndicator, PageIndicatorItem } from "@/ui/page-indicator";
</script>

<template>
  <div class="flex h-48 items-center justify-center gap-12">
    <PageIndicator v-slot="{ pages }" orientation="vertical" variant="pill" :count="4" :default-page="2">
      <PageIndicatorItem v-for="value in pages" :key="value" :value="value" />
    </PageIndicator>
    <PageIndicator v-slot="{ pages }" orientation="vertical" variant="line" :count="4" :default-page="2">
      <PageIndicatorItem v-for="value in pages" :key="value" :value="value" />
    </PageIndicator>
  </div>
</template>
