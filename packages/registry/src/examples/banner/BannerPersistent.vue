<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";

import { Banner, BannerClose, BannerSubtitle, BannerTitle } from "@/ui/banner";
import { Button } from "@/ui/button";

const open = useLocalStorage("kappa-ui-banner-persistent", true, { initOnMounted: true });
</script>

<template>
  <div class="flex w-full flex-col items-center gap-4">
    <Banner v-model:open="open" color="info">
      <BannerTitle>Scheduled maintenance</BannerTitle>
      <BannerSubtitle>Sunday 02:00–03:00 UTC.</BannerSubtitle>
      <BannerClose />
    </Banner>
    <Button v-if="!open" variant="outline" color="neutral" size="sm" @click="open = true">Forget the choice</Button>
  </div>
</template>
