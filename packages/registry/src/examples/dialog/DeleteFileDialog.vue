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

const props = defineProps<{ name: string }>();

const { close, dismiss } = useDialogContext();
</script>

<template>
  <DialogContent class="max-w-sm">
    <DialogHeader>
      <DialogTitle>Delete {{ props.name }}?</DialogTitle>
      <DialogDescription>The file moves to the bin for 30 days.</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" color="neutral" @click="dismiss()">Cancel</Button>
      <Button color="destructive" @click="close()">Delete</Button>
    </DialogFooter>
  </DialogContent>
</template>
