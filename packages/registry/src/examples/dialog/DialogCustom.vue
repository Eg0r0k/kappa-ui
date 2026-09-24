<script setup lang="ts">
import { Trash2 } from "@lucide/vue";

import { Button } from "@/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
</script>

<template>
  <Dialog class="max-w-sm">
    <Button variant="outline" color="destructive">Delete project</Button>

    <template #content>
      <DialogHeader class="flex-col items-center pt-8 text-center">
        <span class="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <Trash2 class="size-6" />
        </span>
        <DialogTitle>Delete this project?</DialogTitle>
        <DialogDescription>The project and its 42 files are removed for everyone. This cannot be undone.</DialogDescription>
      </DialogHeader>
      <DialogFooter class="sm:justify-center">
        <DialogClose as-child>
          <Button variant="outline" color="neutral">Keep it</Button>
        </DialogClose>
        <DialogClose as-child>
          <Button color="destructive">Delete</Button>
        </DialogClose>
      </DialogFooter>
    </template>
  </Dialog>
</template>
