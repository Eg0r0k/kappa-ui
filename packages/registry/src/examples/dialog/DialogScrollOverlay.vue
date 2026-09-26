<script setup lang="ts">
import { Button } from "@/ui/button";
import {
  Dialog,
  DialogBody,
  DialogDescription,
  DialogHeader,
  DialogScrollContent,
  DialogTitle,
  DialogTrigger,
} from "@/ui/dialog";

const changes = Array.from(
  { length: 30 },
  (_, index) => `Change ${index + 1}: fixed a layout shift in the settings panel.`,
);
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button variant="outline" color="neutral">Open release notes</Button>
    </DialogTrigger>
    <DialogScrollContent>
      <DialogHeader>
        <DialogTitle>Release notes</DialogTitle>
        <DialogDescription>Version 2.4, everything that changed.</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <ul class="flex list-disc flex-col gap-2 ps-5 text-body-md">
          <li v-for="change in changes" :key="change">{{ change }}</li>
        </ul>
      </DialogBody>
    </DialogScrollContent>
  </Dialog>
</template>
