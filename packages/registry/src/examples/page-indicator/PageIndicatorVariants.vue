<script setup lang="ts">
import { PageIndicator, PageIndicatorItem } from "@/ui/page-indicator";

const variants = ["dot", "pill", "line"] as const;
</script>

<template>
  <div class="flex w-full max-w-xs flex-col items-center gap-8">
    <PageIndicator
      v-for="variant in variants"
      :key="variant"
      v-slot="{ pages }"
      :variant="variant"
      :count="5"
      :default-page="2"
    >
      <PageIndicatorItem v-for="value in pages" :key="value" :value="value" />
    </PageIndicator>
  </div>
</template>
