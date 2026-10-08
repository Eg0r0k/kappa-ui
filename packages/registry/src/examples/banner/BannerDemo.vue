<script setup lang="ts">
import { Megaphone } from "@lucide/vue";
import { ref } from "vue";

import { Banner, BannerActions, BannerClose, BannerSubtitle, BannerTitle } from "@/ui/banner";
import { Button } from "@/ui/button";

const open = ref(true);
</script>

<template>
  <div class="flex w-full flex-col items-center gap-4">
    <Banner v-model:open="open">
      <Megaphone />
      <BannerTitle>kappa-ui 0.15</BannerTitle>
      <BannerSubtitle>Tour, Banner and Marker are in.</BannerSubtitle>
      <BannerActions>
        <Button size="xs" color="neutral">Read more</Button>
      </BannerActions>
      <BannerClose />
    </Banner>
    <Button v-if="!open" variant="outline" color="neutral" size="sm" @click="open = true">Show the banner</Button>
  </div>
</template>
