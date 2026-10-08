<script setup lang="ts">
import { Banner, BannerSubtitle, BannerTitle } from "@/ui/banner";

const colors = ["primary", "neutral", "success", "warning", "destructive", "info"] as const;
</script>

<template>
  <div class="flex w-full flex-col gap-2">
    <Banner v-for="color in colors" :key="color" :color="color">
      <BannerTitle class="capitalize">{{ color }}</BannerTitle>
      <BannerSubtitle>A notice across the top of the page.</BannerSubtitle>
    </Banner>
  </div>
</template>
