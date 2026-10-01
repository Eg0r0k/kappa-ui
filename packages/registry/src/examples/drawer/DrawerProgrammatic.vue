<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import { defineDrawer } from "@/ui/drawer";
import ShareDrawer from "./ShareDrawer.vue";

const shareDrawer = defineDrawer(ShareDrawer, { props: { file: "holiday.jpg" } });
const status = ref("holiday.jpg is ready to share.");

const share = async () => {
  const result = await shareDrawer.open<string>();
  status.value = result.ok ? `Sent to ${result.value}.` : `Not shared (${result.reason}).`;
};
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <Button variant="outline" color="neutral" @click="share">Share</Button>
    <p class="text-body-md text-muted-foreground" aria-live="polite">{{ status }}</p>
  </div>
</template>
