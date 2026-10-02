<script setup lang="ts">
import { PageIndicator, PageIndicatorItem } from "@/ui/page-indicator";

const targets = ["none", "expand", "wrapper"] as const;
</script>

<template>
  <div
    class="flex flex-col items-center gap-10 [&_button::after]:outline [&_button::after]:outline-dashed [&_button::after]:outline-pink-500/70"
  >
    <PageIndicator
      v-for="target in targets"
      :key="target"
      v-slot="{ pages }"
      :touch-target="target"
      variant="pill"
      :count="4"
      :default-page="2"
    >
      <PageIndicatorItem v-for="value in pages" :key="value" :value="value" />
    </PageIndicator>
  </div>
</template>
