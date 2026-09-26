<script setup lang="ts">
import { Button } from "@/ui/button";
import { type ToastColor, useToast } from "@/ui/toast";

const toast = useToast();

const messages: { color: ToastColor; title: string; description: string }[] = [
  { color: "neutral", title: "Draft saved", description: "You can come back to it later." },
  { color: "primary", title: "Update available", description: "Version 2.4 is ready to install." },
  { color: "success", title: "Payment received", description: "We emailed you the receipt." },
  { color: "warning", title: "Storage almost full", description: "You have used 92% of 15 GB." },
  { color: "destructive", title: "Could not send", description: "Check your connection and try again." },
];
</script>

<template>
  <div class="flex flex-wrap justify-center gap-2">
    <Button
      v-for="message in messages"
      :key="message.color"
      variant="outline"
      color="neutral"
      class="capitalize"
      @click="toast.add(message)"
    >
      {{ message.color }}
    </Button>
  </div>
</template>
