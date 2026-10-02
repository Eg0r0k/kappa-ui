<script setup lang="ts">
import { PageIndicator, PageIndicatorItem } from "@/ui/page-indicator";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <PageIndicator
      v-for="size in sizes"
      :key="size"
      v-slot="{ pages }"
      :size="size"
      variant="pill"
      :count="5"
      :default-page="2"
    >
      <PageIndicatorItem v-for="value in pages" :key="value" :value="value" />
    </PageIndicator>
  </div>
</template>
