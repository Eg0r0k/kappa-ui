<script setup lang="ts">
import { Button } from "@/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  useDialogContext,
} from "@/ui/dialog";

const props = defineProps<{ done: number; total: number }>();

const { dismiss } = useDialogContext();
</script>

<template>
  <DialogContent class="max-w-sm" :show-close-button="false" @interact-outside.prevent>
    <DialogHeader>
      <DialogTitle>Exporting photos</DialogTitle>
      <DialogDescription>{{ props.done }} of {{ props.total }} exported.</DialogDescription>
    </DialogHeader>
    <div
      role="progressbar"
      aria-label="Export progress"
      aria-valuemin="0"
      :aria-valuemax="props.total"
      :aria-valuenow="props.done"
      class="mx-6 h-1 overflow-hidden rounded-full bg-muted"
    >
      <div
        class="h-full bg-primary transition-[width] duration-short-4 ease-standard motion-reduce:transition-none"
        :style="{ width: `${(props.done / props.total) * 100}%` }"
      />
    </div>
    <DialogFooter>
      <Button variant="outline" color="neutral" @click="dismiss()">Cancel</Button>
    </DialogFooter>
  </DialogContent>
</template>
