<script setup lang="ts">
import { ref } from "vue";

import { Button } from "@/ui/button";
import { type ToastPosition, Toaster, useToast } from "@/ui/toast";

const toast = useToast();
const position = ref<ToastPosition>("bottom-end");

const positions: ToastPosition[] = [
  "top-start",
  "top-center",
  "top-end",
  "bottom-start",
  "bottom-center",
  "bottom-end",
];

const show = (value: ToastPosition) => {
  position.value = value;
  toast.add({ group: "positions", title: "Message archived", description: `Shown at ${value}.` });
};
</script>

<template>
  <div class="grid grid-cols-3 gap-2">
    <Button v-for="value in positions" :key="value" variant="outline" color="neutral" size="sm" @click="show(value)">
      {{ value }}
    </Button>
  </div>
  <Toaster group="positions" :position="position" />
</template>
